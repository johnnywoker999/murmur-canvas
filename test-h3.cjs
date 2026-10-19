// 测试 MiniMax-H3（把画布自带的 fl2va API 工作流改绑到本机已有的 fused turbo8 模型）
// 用法: node test-h3.cjs [width] [height] [seconds] [steps]
const fs = require("node:fs");

const PROXY = "http://127.0.0.1:8189";
const BASE_JSON = "D:/infinite-canvas/web/public/workflows/minimax_h3_fl2va_fp8_20step_api.json";

const UNET = "minimax_h3_fused_refdelta_r1024_turbo8_mystic07_int8_convrot.safetensors";
const VIDEO_VAE = "minimax_h3_video_vae_int8_convrot.safetensors";
const AUDIO_VAE = "minimax_h3_audio_vae_fp32.safetensors";
const TE = "qwen3vl_32b_minimax_h3_nvfp4_awq.safetensors";

const width = Number(process.argv[2] || 640);
const height = Number(process.argv[3] || 384);
const seconds = Number(process.argv[4] || 2);
const steps = Number(process.argv[5] || 8);

(async () => {
  const wf = JSON.parse(fs.readFileSync(BASE_JSON, "utf8"));

  // 1) 换成本机文件
  wf["105:6"].inputs.unet_name = UNET;
  wf["105:11"].inputs.vae_name = VIDEO_VAE;
  wf["105:24"].inputs.vae_name = AUDIO_VAE;
  wf["105:13"].inputs.clip_name = TE;

  // 2) 步数（turbo8 蒸馏 → 8 步）
  wf["105:9"].inputs.steps = steps;

  // 3) 尺寸 / 时长 / 种子 / 提示词
  wf["121"].inputs.value = width;
  wf["122"].inputs.value = height;
  wf["123"].inputs.value = seconds;
  wf["125"].inputs.value = 123456789;
  wf["126"].inputs.value =
    "电影感近景：一位穿深灰工装的打捞员在浑浊的水下侧身游过，头灯打出强烈光柱，照亮悬浮颗粒和气泡，蓝绿色调，体积光，胶片颗粒。" +
    " 声音：低沉的水下环境噪音、气泡声、远处金属受力时的闷响。";

  // 4) 纯文生视频：拆掉首/尾帧（这两个 LoadImage 引用了不存在的图片）
  delete wf["105:104"].inputs.first_frame;
  delete wf["105:104"].inputs.last_frame;
  delete wf["114"];
  delete wf["124"];

  const frames = Math.max(5, Math.round(seconds * 24));
  console.log(`提交: ${width}x${height}, ~${frames}帧/${seconds}s, steps=${steps}`);
  console.log(`模型: ${UNET}`);
  console.log(`VAE:  ${VIDEO_VAE} + ${AUDIO_VAE}`);
  console.log(`TE:   ${TE}`);

  const r = await fetch(`${PROXY}/prompt`, {
    method: "POST",
    headers: { "content-type": "application/json", origin: "http://127.0.0.1:3000" },
    body: JSON.stringify({ prompt: wf, client_id: "hermes-h3-" + Date.now() }),
  });
  const txt = await r.text();
  console.log("POST /prompt ->", r.status, txt.slice(0, 600));
  if (!r.ok) process.exit(1);
  const { prompt_id, node_errors } = JSON.parse(txt);
  if (node_errors && Object.keys(node_errors).length) { console.log("node_errors:", JSON.stringify(node_errors).slice(0, 800)); process.exit(2); }
  console.log("prompt_id =", prompt_id, " 开始等待…");

  const t0 = Date.now();
  let lastMsg = "";
  for (;;) {
    await new Promise((s) => setTimeout(s, 5000));
    const el = (Date.now() - t0) / 1000;
    const h = await (await fetch(`${PROXY}/history/${prompt_id}`, { headers: { origin: "http://127.0.0.1:3000" } })).json();
    const rec = h[prompt_id];
    if (rec) {
      console.log(`\n完成，用时 ${el.toFixed(1)}s  status=${rec.status.status_str}`);
      for (const m of rec.status.messages || []) {
        const s = JSON.stringify(m);
        if (s.includes("error") || s.includes("exception")) console.log("  !!", s.slice(0, 600));
      }
      console.log("输出:", JSON.stringify(rec.outputs || {}).slice(0, 600));
      process.exit(rec.status.status_str === "error" ? 3 : 0);
    }
    const q = await (await fetch(`${PROXY}/queue`, { headers: { origin: "http://127.0.0.1:3000" } })).json();
    const msg = `  ${el.toFixed(0)}s running=${q.queue_running.length} pending=${q.queue_pending.length}`;
    if (msg !== lastMsg) { process.stdout.write(msg + "\n"); lastMsg = msg; }
    if (el > 1500) { console.log("超时 25 分钟，放弃"); process.exit(4); }
  }
})();

// 端到端测试：把画布内置的 z_image_turbo_api.json 经 CORS 代理提交给 ComfyUI
const fs = require("node:fs");

const PROXY = "http://127.0.0.1:8189";
const API_JSON = "D:/infinite-canvas/web/public/workflows/z_image_turbo_api.json";

(async () => {
  const wf = JSON.parse(fs.readFileSync(API_JSON, "utf8"));
  // 降分辨率 + 换短提示词，只为验证链路
  wf["70"].inputs.value = 832;
  wf["71"].inputs.value = 1216;
  wf["69"].inputs.value = "一只橘猫坐在台灯下的木桌上，胶片质感";
  wf["9"].inputs.filename_prefix = "canvas_e2e_test";

  const clientId = "hermes-e2e-" + Date.now();
  const body = JSON.stringify({ prompt: wf, client_id: clientId });

  const r = await fetch(`${PROXY}/prompt`, {
    method: "POST",
    headers: { "content-type": "application/json", origin: "http://127.0.0.1:3000" },
    body,
  });
  const txt = await r.text();
  console.log("POST /prompt ->", r.status, txt.slice(0, 400));
  if (!r.ok) process.exit(1);

  const { prompt_id } = JSON.parse(txt);
  console.log("prompt_id =", prompt_id, "\n排队中…");

  const t0 = Date.now();
  for (;;) {
    await new Promise((s) => setTimeout(s, 3000));
    const h = await fetch(`${PROXY}/history/${prompt_id}`, { headers: { origin: "http://127.0.0.1:3000" } });
    const j = await h.json();
    const rec = j[prompt_id];
    if (rec) {
      const secs = ((Date.now() - t0) / 1000).toFixed(1);
      console.log(`\n完成，用时 ${secs}s  status=${JSON.stringify(rec.status)}`);
      const outs = rec.outputs || {};
      for (const [nid, o] of Object.entries(outs)) {
        console.log(`节点${nid} 输出:`, JSON.stringify(o).slice(0, 400));
      }
      process.exit(rec.status && rec.status.status_str === "error" ? 2 : 0);
    }
    const q = await (await fetch(`${PROXY}/queue`, { headers: { origin: "http://127.0.0.1:3000" } })).json();
    const running = q.queue_running.length, pending = q.queue_pending.length;
    if ((Date.now() - t0) / 1000 > 240) { console.log("\n超时 240s，放弃"); process.exit(3); }
    process.stdout.write(`\r  ${((Date.now() - t0) / 1000).toFixed(0)}s  running=${running} pending=${pending}   `);
  }
})();

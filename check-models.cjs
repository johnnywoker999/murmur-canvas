// 对比：画布内置工作流需要的文件 vs 本地 ComfyUI 实际有的文件
const fs = require("node:fs");
const path = require("node:path");

const BASE = "http://127.0.0.1:8189";
const WF_DIR = "D:/infinite-canvas/web/public/workflows";

const folders = ["diffusion_models", "checkpoints", "text_encoders", "clip", "vae", "loras", "vae_approx", "ultralytics"];

async function getModels(f) {
  try {
    const r = await fetch(`${BASE}/models/${f}`);
    if (!r.ok) return [];
    const j = await r.json();
    return Array.isArray(j) ? j : [];
  } catch { return []; }
}

(async () => {
  const inv = {};
  for (const f of folders) inv[f] = await getModels(f);
  const all = new Set();
  for (const f of folders) for (const m of inv[f]) all.add(path.basename(m.replace(/\\/g, "/")));

  const files = fs.readdirSync(WF_DIR).filter((f) => f.endsWith(".json"));
  const rows = [];
  for (const f of files) {
    let txt;
    try { txt = fs.readFileSync(path.join(WF_DIR, f), "utf8"); } catch { continue; }
    const refs = [...new Set((txt.match(/[A-Za-z0-9_.\-\u4e00-\u9fa5\/]+\.(safetensors|gguf|pth|pt)/g) || []))];
    const missing = refs.filter((r) => !all.has(path.basename(r.replace(/\\/g, "/"))));
    rows.push({ file: f, total: refs.length, missing, refs });
  }
  rows.sort((a, b) => a.missing.length - b.missing.length);

  console.log("=== 本地已有模型（按目录） ===");
  for (const f of folders) console.log(`[${f}] ${inv[f].length}`);
  console.log("\n=== 工作流匹配度（缺最少的在前） ===");
  for (const r of rows.slice(0, 14)) {
    console.log(`${r.missing.length === 0 ? "✅" : "❌"} ${r.file}  需要${r.total} 缺${r.missing.length}` + (r.missing.length ? `  缺: ${r.missing.join(", ")}` : ""));
  }
  console.log("\n=== 完整清单 ===");
  for (const r of rows) console.log(JSON.stringify({ f: r.file, need: r.refs, missing: r.missing }));
})();

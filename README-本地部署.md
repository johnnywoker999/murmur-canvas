# 无限画布 本地部署记录（2026-10-19 装好并连通）

## 现在的状态

| 组件 | 位置 | 端口 | 说明 |
|---|---|---|---|
| 无限画布（前端） | `D:\infinite-canvas\web` | 3000 | Vite dev server，`bun run dev` |
| CORS 代理 | `D:\infinite-canvas\cors-proxy.mjs` | 8189 → 8188 | 见下方「为什么要代理」 |
| ComfyUI | ComfyUI **Desktop** 自带进程 | 127.0.0.1:8188 | 版本 0.35.1，不要动它的启动参数 |

画布地址：**http://127.0.0.1:3000**
渠道已保存为：`系统内置 ComfyUI · http://127.0.0.1:8189`

一键启动：双击 `D:\infinite-canvas\启动无限画布.bat`（会开两个黑窗口，都别关）。

## 为什么要那层代理（关键，别删）

1. 画布跑在 3000 端口，ComfyUI 在 8188 → 跨域，浏览器要 CORS 头。Desktop 版 ComfyUI **不能加命令行参数**，`--enable-cors-header "*"` 传不进去。
2. 更要紧：**ComfyUI 0.35+ 会拦截带跨站 Origin 的请求，直接返回 403**（实测 `Origin: http://127.0.0.1:3000` → 403，`Origin: http://127.0.0.1:8188` → 200）。所以光加 CORS 头不够。

代理干两件事：转发前**剥掉 `origin` / `referer` / `sec-fetch-*`**（后端当成同源请求放行），回程再补上 `Access-Control-Allow-Origin: *`。WebSocket（`/ws` 进度推送）也走同一套透传。

验证过的结果：
- `/queue` `/system_stats` `/object_info`(3.9MB) `/models` 在浏览器里全部 200
- `POST /prompt` 返回 400（说明已经打到后端，只是空 body）
- `GET /ws` 握手返回 `101 Switching Protocols`

## 克隆时踩的坑（重装要看）

仓库 `assets/cloud-mirror/` 里有个文件名带冒号 `lightcc:autodl -3 画布 地址配置列表.png`，**Windows 上无法创建**，整仓 checkout 必失败。做法：只导出 `web/` 子树

```bash
cd D:/infinite-canvas
git -c core.protectNTFS=false archive HEAD web | tar -x -C .
git -c core.protectNTFS=false archive HEAD VERSION CHANGELOG.md | tar -x -C .
```

`VERSION` 和 `CHANGELOG.md` 必须补齐，`web/vite.config.ts` 启动时会读这两个文件，缺了直接 `ENOENT` 起不来。

## 实测结果（2026-10-19 15:56 通过）

端到端跑通，证据链：

| 环节 | 证据 |
|---|---|
| 浏览器 → 代理 | `FETCH 200 http://127.0.0.1:8189/system_stats` |
| 提交任务 | `FETCH 200 /prompt` → `prompt_id 786fc172-…`，`node_errors: {}` |
| ComfyUI 执行 | `/history/786fc172-…` → `status: success, completed: true` |
| 产物 | `output/z-image-turbo_00263_.png`（1.37MB，画布节点里以 blob 显示） |
| 内容核对 | 视觉检查：橘猫坐在木桌上，与提示词一致 |
| 另一种验证 | `test-e2e.cjs` 直接经代理提交画布自带的 `z_image_turbo_api.json`：27.1s 出图（832×1216） |

**用的是 Z-Image-Turbo 文生图**：它是 9 个工作流里唯一模型 100% 齐全的（`z_image_turbo_bf16` + `qwen_3_4b` + `ae` 三个文件本地都有）。已在「配置 → 渠道 → 编辑 → 文生图工作流」里把它设为默认。

## ⚠️ 最坑的一处：界面改接口地址不生效

画布 UI 的「ComfyUI 接口地址」输入框写的是 `channel.baseUrl`，但**真正发请求用的是 `channel.comfyuiProxyUrl`**（早期 comfy-api-proxy 时代留下的字段）。在界面上填 `http://127.0.0.1:8189` 保存后，卡片会显示 8189，但请求仍然打到 8188 → 浏览器报 `Failed to fetch`，节点显示「全部图片生成失败」。

修复方式是把 IndexedDB 里的 `comfyuiProxyUrl` 改掉。浏览器 DevTools Console 粘贴：

```js
(async () => {
  const db = await new Promise(r => { const q = indexedDB.open('infinite-canvas'); q.onsuccess = () => r(q.result); });
  const KEY = 'infinite-canvas:ai_config_store';
  const st = db.transaction('app_state', 'readwrite').objectStore('app_state');
  const raw = await new Promise(r => { const q = st.get(KEY); q.onsuccess = () => r(q.result); });
  const o = typeof raw === 'string' ? JSON.parse(raw) : raw;
  const ch = o.state.config.channels[0];
  ch.comfyuiProxyUrl = 'http://127.0.0.1:8189';   // 代理端口
  await new Promise(r => { const q = st.put(typeof raw === 'string' ? JSON.stringify(o) : o, KEY); q.onsuccess = r; });
  location.reload();
})();
```

数据在数据库 `infinite-canvas` 的 `app_state` 表，键 `infinite-canvas:ai_config_store`（zustand persist 结构 `{state:{config:{channels:[…]}}}`）。

## 补丁 2：源码层修掉「地址填了没用」

`web/src/services/api/comfyui.ts` 的 `normalizeBaseUrl()` 改成了：

```ts
const LOCAL_CORS_PROXY_URL = "http://127.0.0.1:8189";
function normalizeBaseUrl(baseUrl: string) {
    const u = baseUrl.trim().replace(/\/+$/, "");
    if (!u) return LOCAL_CORS_PROXY_URL;                                   // 空地址
    if (/^https?:\/\/(127\.0\.0\.1|localhost):8188$/i.test(u)) return LOCAL_CORS_PROXY_URL;  // 直连 8188
    return u;
}
```

所有 `/prompt`、`/history`、`/system_stats`、`/object_info`、上传都过这个函数，所以**不管渠道里存的是空、8188 还是别的，本机 8188 一律改走 8189 代理**。验证：把渠道写回 `http://127.0.0.1:8188`，刷新后照样出图（18s）。

> 换回干净上游时：`git -c core.protectNTFS=false archive` 重新导出 `web/src`，或把这个函数还原成一行。

## 补丁 3：默认文生图工作流要换成 Z-Image-Turbo

默认的 **Qwen-Image-2.1 文生图**在你这台机器上跑不了，报：

```
400 missing_node_type
Node 'Qwen Image 2.1 缓存' not found. The custom node ...
```

原因：它要一个自定义节点 `QwenImage21Cache`（工作流里的「Qwen Image 2.1 缓存」），以及 `qwen_image_2.1_bf16` / `qwen3vl_8b_bf16` / `qwen_image_2.1_vae_bf16` 三个模型，本机都没有。

改法（界面操作，这次是有效的，因为绑的是 workflows 列表的 `isDefault` 标记）：

配置 → 渠道 → 编辑 → **文生图工作流** → 点 **Z-Image-Turbo 文生图** 那一行的「设为默认」→ 保存。
之后**新建**一个图片节点（旧节点还是绑着 Qwen），或直接在节点里的模型选择器切到 Z-Image-Turbo。

验证：新节点输入「窗台上的一杯黑咖啡，晨光，浅景深」→ 18s 出图，`/prompt` 返回 `node_errors: {}`。

## 补丁 4：MiniMax-H3 实测通过（用本机 fused turbo8 模型）

画布自带的 H3 工作流全部指向 `*_pruned_fp8_scaled` + PDMD LoRA，本机没有。改用已有的
`minimax_h3_fused_refdelta_r1024_turbo8_mystic07_int8_convrot.safetensors`（20GB，int8，turbo8 蒸馏）。

三处替换：

| 工作流里 | 换成本机实际 |
|---|---|
| `minimax_h3_fl2va_pruned_fp8_scaled` | `minimax_h3_fused_refdelta_r1024_turbo8_mystic07_int8_convrot` |
| `minimax_h3_video_vae_fp16` | `minimax_h3_video_vae_int8_convrot` |
| `minimax_h3_pdmd_4step_lora…`（4 步蒸馏 LoRA） | **删掉**——模型本身已含 turbo8，步数设 **8** |

成稿文件：`h3-fl2va-turbo8-fused-api.json`（也在 `web/public/workflows/`，可直接 `http://127.0.0.1:3000/workflows/h3-fl2va-turbo8-fused-api.json` 取）。

**实测（2026-10-19 16:19）**：640×384、56 帧 / 2.33s、8 步 →
`execution_start 1792397937274` → `execution_success 1792397985804` = **48.5 秒**，
输出 `output/video/MiniMax_H3_00001_.mp4`（435KB，H.264 640×384/24fps + AAC 32kHz 立体声），
抽帧核验：水下打捞员 + 头灯光柱，画面连贯无崩坏，音频轨正常。

命令行复跑：`node test-h3.cjs <宽> <高> <秒> <步数>`，例：`node test-h3.cjs 896 512 5 8`

**在画布界面启用**（这一步必须在你自己浏览器里做，我改不到你的 IndexedDB）：
配置 → 渠道 → 编辑 → **首尾帧视频工作流** → 「添加工作流」→ 选 `h3-fl2va-turbo8-fused-api.json` → 设为默认 → 保存。

## 下一步：H3 工作流的模型还没对上


画布的 H3 工作流（33 个 JSON 在 `web/public/workflows/`）写死了这些文件名：

```
minimax_h3_ref2va_pruned_fp8_scaled.safetensors        ← 没有
minimax_h3_fl2va_pruned_fp8_scaled.safetensors         ← 没有
minimax_h3_pdmd_4step_lora_avg_rank_57_bf16.safetensors ← 没有
minimax_h3_video_vae_fp16.safetensors                  ← 只有 int8_convrot 版
qwen3vl_32b_minimax_h3_nvfp4_awq.safetensors           ← 有 ✔
minimax_h3_audio_vae_fp32.safetensors                  ← 有 ✔
```

本地已有的是 `minimax_h3_fused_refdelta_r1024_turbo8_mystic07_int8_convrot.safetensors`（融合了 turbo8 的 int8 构建）。

两条路：
- **A（省事）**：把工作流里的 `UNETLoader` 换成已有那个 fused 文件。注意它是 **turbo 8 步蒸馏**，采样步数要设 8（不是 4，也不要再挂 PDMD LoRA），VAE 换成 `minimax_h3_video_vae_int8_convrot`。
- **B（对齐官方）**：补 4 个文件：两个 `*_pruned_fp8_scaled` DiT（各 21GB）+ PDMD 4步 LoRA + `video_vae_fp16`。

改法：画布「配置 → 渠道 → 编辑 → 对应工作流 → 配置工作流 → 上传你的 API 格式 JSON」（ComfyUI 设置里勾 Enable Dev mode Options 才能 Save API Format）。

## 其它注意

- **托管站 canvas.imihoo.com 与本地的浏览器存储是两套**：那边渠道仍指向 8188，要用也得改成 `http://127.0.0.1:8189`。
- 别把「导出配置」的 JSON 发人，里面的渠道地址是明文。
- 关掉代理窗口 = 画布立刻 `Failed to fetch`。
- `web/` 是 sparse 导出的，`git status` 会显示大量删除，**不要 `git checkout`/`git reset`**，会把 web/ 一起清掉。

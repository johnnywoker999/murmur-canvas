// cors-proxy.mjs — 给 ComfyUI Desktop 套一层 CORS 头
// 画布(http://localhost:3000) → 本代理(127.0.0.1:8189) → ComfyUI(127.0.0.1:8188)
// 支持 HTTP 全方法与 WebSocket 升级（/ws 进度推送）。
// 不修改任何 ComfyUI 文件，不改他的启动参数；关掉这个进程就恢复原样。
import http from "node:http";
import net from "node:net";

const LISTEN_PORT = Number(process.env.PROXY_PORT || 8189);
const TARGET_HOST = "127.0.0.1";
const TARGET_PORT = Number(process.env.TARGET_PORT || 8188);

const CORS = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
  "access-control-allow-headers": "*",
  "access-control-expose-headers": "*",
  "access-control-max-age": "86400",
};

function withCors(headers) {
  const out = { ...headers };
  for (const k of Object.keys(out)) {
    if (k.startsWith("access-control-")) delete out[k];
  }
  return { ...out, ...CORS };
}

// ComfyUI 0.35+ 会拦截跨站 Origin 请求（返回 403），所以转发前剥掉
// origin / referer / sec-fetch-* —— 后端看到的就是同源请求，放行。
const STRIP = /^(origin|referer|sec-fetch-site|sec-fetch-mode|sec-fetch-dest)$/i;

function cleanRequestHeaders(headers) {
  const out = {};
  for (const [k, v] of Object.entries(headers)) {
    if (!STRIP.test(k)) out[k] = v;
  }
  return out;
}

const server = http.createServer((req, res) => {
  if (req.method === "OPTIONS") {
    res.writeHead(204, withCors({}));
    res.end();
    return;
  }

  const proxyReq = http.request(
    {
      host: TARGET_HOST,
      port: TARGET_PORT,
      method: req.method,
      path: req.url,
      headers: { ...cleanRequestHeaders(req.headers), host: `${TARGET_HOST}:${TARGET_PORT}` },
    },
    (proxyRes) => {
      res.writeHead(proxyRes.statusCode || 502, withCors(proxyRes.headers));
      proxyRes.pipe(res);
    }
  );

  proxyReq.on("error", (err) => {
    if (!res.headersSent) {
      res.writeHead(502, withCors({ "content-type": "text/plain; charset=utf-8" }));
    }
    res.end(`proxy error: ${err.message}\n(ComfyUI 在 ${TARGET_HOST}:${TARGET_PORT} 活着吗？)`);
  });

  req.pipe(proxyReq);
});

// WebSocket / 其它升级协议：原样透传（同样剥掉 Origin 类头）
server.on("upgrade", (req, socket, head) => {
  const upstream = net.connect(TARGET_PORT, TARGET_HOST, () => {
    const lines = [`${req.method} ${req.url} HTTP/1.1`];
    for (const [k, v] of Object.entries(cleanRequestHeaders(req.headers))) {
      for (const vv of Array.isArray(v) ? v : [v]) lines.push(`${k}: ${vv}`);
    }
    upstream.write(lines.join("\r\n") + "\r\n\r\n");
    if (head && head.length) upstream.write(head);
    socket.pipe(upstream).pipe(socket);
  });
  upstream.on("error", () => socket.destroy());
  socket.on("error", () => upstream.destroy());
});

server.listen(LISTEN_PORT, "127.0.0.1", () => {
  console.log(`[cors-proxy] http://127.0.0.1:${LISTEN_PORT}  ->  http://${TARGET_HOST}:${TARGET_PORT}  (CORS: *)`);
});

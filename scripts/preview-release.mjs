import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { resolve, extname, sep } from "node:path";

const root = resolve("out");
const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "/blueprintstudio";
const port = Number(process.env.BLUEPRINT_PREVIEW_PORT ?? 3031);
const mime = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "application/javascript", ".json": "application/json", ".txt": "text/plain; charset=utf-8", ".md": "text/plain; charset=utf-8", ".svg": "image/svg+xml", ".png": "image/png", ".ttf": "font/ttf", ".woff2": "font/woff2" };

createServer(async (request, response) => {
  try {
    const path = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
    if (base && path === base) { response.writeHead(308, { Location: `${base}/` }); response.end(); return; }
    if (base && !path.startsWith(`${base}/`)) throw new Error("Outside app path");
    let file = resolve(root, `.${path.slice(base.length)}`);
    if (file !== root && !file.startsWith(root + sep)) throw new Error("Outside export directory");
    if ((await stat(file)).isDirectory()) file = resolve(file, "index.html");
    const body = await readFile(file);
    response.writeHead(200, { "Content-Type": file.endsWith(`${sep}LICENSE`) ? "text/plain; charset=utf-8" : mime[extname(file)] ?? "application/octet-stream", "Cache-Control": "no-store" });
    response.end(body);
  } catch {
    response.writeHead(404, { "Content-Type": "text/plain" }); response.end("Not found");
  }
}).listen(port, "127.0.0.1", () => console.log(`Blueprint static preview: http://127.0.0.1:${port}${base}/`));

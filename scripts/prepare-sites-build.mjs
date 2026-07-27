import { cp, mkdir, readdir, readFile, writeFile } from "node:fs/promises";

const distDir = new URL("../dist/", import.meta.url);
const clientDir = new URL("../dist/client/", import.meta.url);
const serverDir = new URL("../dist/server/", import.meta.url);
const metadataDir = new URL("../dist/.openai/", import.meta.url);
const hostingConfig = new URL("../.openai/hosting.json", import.meta.url);

await Promise.all([
  mkdir(clientDir, { recursive: true }),
  mkdir(serverDir, { recursive: true }),
  mkdir(metadataDir, { recursive: true }),
]);

const entries = await readdir(distDir, { withFileTypes: true });
for (const entry of entries) {
  if (["client", "server", ".openai"].includes(entry.name)) continue;
  await cp(new URL(entry.name, distDir), new URL(entry.name, clientDir), {
    recursive: true,
  });
}

const worker = `export default {
  async fetch(request, env) {
    let response = await env.ASSETS.fetch(request);
    if (response.status !== 404) return response;

    const url = new URL(request.url);
    url.pathname = "/index.html";
    return env.ASSETS.fetch(new Request(url, request));
  },
};
`;

await Promise.all([
  writeFile(new URL("index.js", serverDir), worker),
  writeFile(new URL("hosting.json", metadataDir), await readFile(hostingConfig)),
]);

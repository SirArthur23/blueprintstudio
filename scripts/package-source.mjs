import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { copyFile, cp, lstat, mkdir, readFile, realpath, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { auditLicenses } from "./audit-licenses.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");

export function validatePublicPath(file) {
  if (typeof file !== "string" || !file || file.includes("\\") || path.posix.isAbsolute(file) || file.split("/").some((segment) => segment === ".." || segment === "." || !segment)) throw new Error(`Unsafe release path: ${file}`);
  if (/(^|\/)(?:\.env(?:\..*)?|\.git|\.publish|\.pnpm-store|node_modules|\.next(?:-release)?|out|release|coverage|test-results|playwright-report|private|backups?)(\/|$)|\.(?:docx|zip|log|tsbuildinfo)$|(?:^|\/)\.DS_Store$/i.test(file)) throw new Error(`Private/generated path: ${file}`);
  return file;
}

export function findCredentialMarker(content) {
  return /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----|\bsk-(?:proj-)?[A-Za-z0-9_-]{24,}|\b(?:ghp_|github_pat_)[A-Za-z0-9_]{30,}/.test(content);
}

export async function packageSource() {
  await auditLicenses();
  const files = JSON.parse(await readFile(path.join(root, "scripts/source-files.json"), "utf8"));
  if (new Set(files).size !== files.length) throw new Error("Duplicate source allowlist entry");
  const entries = [];
  // Validate everything before replacing the last prepared package.
  for (const file of files) {
    validatePublicPath(file);
    const input = path.join(root, file);
    if (!(await lstat(input)).isFile() || !(await realpath(input)).startsWith(root)) throw new Error(`Not a project-local regular file: ${file}`);
    const bytes = await readFile(input);
    if (![".ttf", ".png"].includes(path.extname(file)) && findCredentialMarker(bytes.toString("utf8"))) throw new Error(`Potential credential in ${file}; source package refused`);
    entries.push({ path: file, bytes: bytes.length, sha256: hash(bytes) });
  }
  const destination = path.join(root, "release/source/hitm-blueprint");
  await rm(destination, { recursive: true, force: true });
  await mkdir(destination, { recursive: true });
  for (const entry of entries) {
    const target = path.join(destination, entry.path);
    await mkdir(path.dirname(target), { recursive: true });
    await copyFile(path.join(root, entry.path), target);
    if (hash(await readFile(target)) !== entry.sha256) throw new Error(`Source copy mismatch: ${entry.path}`);
    if (entry.path === "next-env.d.ts") {
      // Next rewrites this file on builds. A fresh source package must typecheck without a hidden compiler cache.
      const original = await readFile(target, "utf8");
      const portable = original.replace(/^import ["']\.\/\.next[^"']*["'];?\r?\n/gm, "");
      await writeFile(target, portable);
      entry.sourceSha256 = entry.sha256;
      entry.sha256 = hash(Buffer.from(portable));
      entry.bytes = Buffer.byteLength(portable);
      entry.transformation = "Removed generated route-types import; Next regenerates it on build.";
    }
  }
  await cp(path.join(root, "release/licenses"), path.join(destination, "third-party"), { recursive: true });
  for (const file of ["inventory.json", "THIRD_PARTY_LICENSES.txt"]) {
    const bytes = await readFile(path.join(destination, "third-party", file));
    entries.push({ path: `third-party/${file}`, bytes: bytes.length, sha256: hash(bytes) });
  }
  const project = JSON.parse(await readFile(path.join(root, "package.json"), "utf8"));
  const manifest = { schemaVersion: 1, name: project.name, version: project.version, status: "Prepared locally; not published", exclusions: ["Conversation history DOCX", "Private notes/backups and environment files", "Sibling projects", "Git history", "node_modules and build/test caches"], files: entries.sort((a, b) => a.path.localeCompare(b.path)) };
  await writeFile(path.join(destination, "SOURCE_MANIFEST.json"), `${JSON.stringify(manifest, null, 2)}\n`);
  const archive = `hitm-blueprint-${project.version}-source.tar.gz`;
  const result = spawnSync("tar", ["-czf", path.join(root, "release", archive), "-C", path.dirname(destination), path.basename(destination)], { stdio: "inherit" });
  if (result.status !== 0) throw new Error(`Source folder prepared, but tar archive failed: ${result.error?.message ?? result.status}`);
  const archiveHash = hash(await readFile(path.join(root, "release", archive)));
  await writeFile(path.join(root, "release/source-package.sha256"), `${archiveHash}  ${archive}\n`);
  console.log(`Prepared standalone source: release/source/hitm-blueprint (${entries.length} files plus SHA-256 manifest). No repository created or publication performed.`);
  console.log(`Source archive: release/${archive}; checksum: release/source-package.sha256`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await packageSource();

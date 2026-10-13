import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync, realpathSync, statSync } from "node:fs";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const digest = (bytes) => createHash("sha256").update(bytes).digest("hex");
const readJson = (file) => JSON.parse(readFileSync(file, "utf8"));
const inside = (file) => file.startsWith(root);
const reviewedLicenseIds = new Set(["MIT", "ISC", "Apache-2.0", "0BSD", "CC-BY-4.0", "BSD-3-Clause", "LGPL-3.0-or-later", "MPL-2.0", "BSD-2-Clause", "Python-2.0", "CC0-1.0", "BlueOak-1.0.0"]);
// Sharp 0.35.5 wrappers declare combined terms. Retain their README library notices;
// review applies only to source/static artifacts, which do not distribute these binaries.
reviewedLicenseIds.add("Apache-2.0 AND LGPL-3.0-or-later");
reviewedLicenseIds.add("Apache-2.0 AND LGPL-3.0-or-later AND MIT");

function resolveManifest(from, name) {
  const paths = createRequire(from).resolve.paths(`${name}/package.json`) ?? [];
  for (const directory of paths) {
    const file = path.join(directory, name, "package.json");
    if (inside(file) && existsSync(file)) {
      const real = realpathSync(file);
      if (!inside(real)) throw new Error(`Dependency outside project: ${name}`);
      return real;
    }
  }
  return null;
}

function legalFiles(directory, prefix = "", depth = 0) {
  const files = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const relative = `${prefix}${entry.name}`;
    if (entry.isFile() && /(?:^|[._-])(licen[sc]e|notice|copying)(?:[._-]|$)/i.test(entry.name)) files.push(relative);
    if (entry.isDirectory() && entry.name !== "node_modules" && (depth < 2 || prefix.startsWith("dist/compiled/"))) {
      files.push(...legalFiles(path.join(directory, entry.name), `${relative}/`, depth + 1));
    }
  }
  return files.sort();
}

/** Reads only project-local installed manifests. No registry access or mutable pnpm store index is needed. */
export function collectLicenseInventory() {
  const packages = new Map();
  const visited = new Set();
  const unavailable = new Map();
  function visit(manifest, scope) {
    const visitKey = `${manifest}:${scope}`;
    if (visited.has(visitKey)) return;
    visited.add(visitKey);
    const data = readJson(manifest);
    const id = `${data.name}@${data.version}`;
    let item = packages.get(id);
    if (!item) {
      const directory = path.dirname(manifest);
      const files = legalFiles(directory);
      const readmes = readdirSync(directory).filter((file) => /^readme(?:\.|$)/i.test(file) && statSync(path.join(directory, file)).isFile() && /licen[sc]e|copyright/i.test(readFileSync(path.join(directory, file), "utf8")));
      item = { name: data.name, version: data.version, license: typeof data.license === "string" ? data.license : data.license?.type ?? "UNKNOWN", scopes: [], directory, files, readmes };
      packages.set(id, item);
    }
    if (!item.scopes.includes(scope)) item.scopes.push(scope);
    for (const name of Object.keys({ ...data.dependencies, ...data.optionalDependencies, ...data.peerDependencies }).sort()) {
      if (name.startsWith("node:")) continue;
      const child = resolveManifest(manifest, name);
      if (child) visit(child, scope);
      else {
        const optional = Object.hasOwn(data.optionalDependencies ?? {}, name) || Object.hasOwn(data.peerDependencies ?? {}, name);
        if (!optional) throw new Error(`Missing required dependency: ${id} → ${name}`);
        unavailable.set(`${id}:${name}`, { parent: id, name, range: data.optionalDependencies?.[name] ?? data.peerDependencies?.[name], reason: "Optional dependency or peer not installed on this host; not copied into either artifact." });
      }
    }
  }
  const manifest = path.join(root, "package.json");
  const project = readJson(manifest);
  for (const [scope, dependencies] of Object.entries({ production: project.dependencies, development: project.devDependencies })) {
    for (const name of Object.keys(dependencies).sort()) {
      const file = resolveManifest(manifest, name);
      if (!file) throw new Error(`Missing direct dependency: ${name}`);
      visit(file, scope);
    }
  }
  return { packages: [...packages.values()].sort((a, b) => `${a.name}@${a.version}`.localeCompare(`${b.name}@${b.version}`)), unavailable: [...unavailable.values()] };
}

export async function auditLicenses() {
  const { packages, unavailable } = collectLicenseInventory();
  const unreviewed = packages.filter((item) => !reviewedLicenseIds.has(item.license));
  if (unreviewed.length) throw new Error(`Review new/unknown license identifiers before packaging: ${unreviewed.map((item) => `${item.name}: ${item.license}`).join(", ")}`);
  const output = path.join(root, "release/licenses");
  await rm(output, { recursive: true, force: true });
  await mkdir(output, { recursive: true });
  const texts = ["HITM Blueprint Studio — installed dependency notices", "", "This includes build/test-only software conservatively. Native tooling is not distributed in the static browser app. Dependencies retain their own terms, not the project's MIT license.", ""];
  const inventory = [];
  for (const item of packages) {
    const evidence = [...item.files, ...item.readmes].map((file) => ({ file, kind: item.readmes.includes(file) ? "readme-attribution" : "license-or-notice", sha256: digest(readFileSync(path.join(item.directory, file))) }));
    texts.push(`===== ${item.name}@${item.version} (${item.license}; ${item.scopes.sort().join(", ")}) =====`, "");
    for (const { file } of evidence) texts.push(`--- ${file} ---`, readFileSync(path.join(item.directory, file), "utf8"), "");
    if (!item.files.length) texts.push("Installed package provides no separate license/notice file. Any supplied README attribution is retained above. See inventory review limits; no substitute copyright notice has been invented.", "");
    inventory.push({ name: item.name, version: item.version, license: item.license, scopes: item.scopes, separateNoticeFiles: item.files.length, evidence });
  }
  const payload = { schemaVersion: 1, lockfileSha256: digest(readFileSync(path.join(root, "pnpm-lock.yaml"))), platform: `${process.platform}-${process.arch}`, packages: inventory, notInstalled: unavailable };
  await writeFile(path.join(output, "inventory.json"), `${JSON.stringify(payload, null, 2)}\n`);
  await writeFile(path.join(output, "THIRD_PARTY_LICENSES.txt"), `${texts.join("\n")}\n`);
  const review = [
    "# Dependency license inventory", "",
    "Generated by `pnpm audit:licenses` from installed package manifests and upstream license/notice files. No registry requests or dependencies are added. Exact evidence and SHA-256 digests are in `release/licenses/inventory.json`; full text is in `release/licenses/THIRD_PARTY_LICENSES.txt`. Both accompany the staged source and static artifacts.", "",
    `Lockfile SHA-256: \`${payload.lockfileSha256}\`. Host: ${payload.platform}. ${inventory.length} unique installed name/version pairs; scope includes optional peers resolved on this host.`, "",
    "## Distribution review and limits", "",
    "- The source package does not vendor node_modules. Recipients install the locked dependencies with their upstream licenses.",
    "- The static app ships browser JS/CSS and local fonts, not Node, Sharp/libvips, SWC, Playwright, ESLint, or other native/build/test executables. Notices are conservatively included for the entire installed graph, including Next's compiled third-party license files.",
    "- Plus Jakarta Sans and Syne retain SIL OFL 1.1; `public/fonts/OFL.txt` is included in both artifacts.",
    "- The installed libvips build dependency declares LGPL-3.0-or-later; it is not copied to either artifact. Do not redistribute native tool binaries under the project MIT license. A future server/container distribution needs its own license/source-offer review.",
    "- CC-BY-4.0 browser-support data retains its attribution/license text. MPL-2.0, Python-2.0, Apache, BSD, ISC, MIT, CC0, 0BSD, and BlueOak declarations are recorded individually; project MIT does not override them.",
    "- Some packages omit a separate license file. Supplied README attribution/terms are retained (including esrecurse and imurmurhash); the table distinguishes README-only evidence. Metadata is not a replacement for missing copyright notices. Resolve any additional requirements before distributing those package binaries separately.",
    `- ${unavailable.length} absent optional/peer references are listed separately in the JSON. Their platform-specific binaries are not distributed; this is not an audit of every binary that could be installed on every platform. Regenerate on a different build host or after changing the lockfile.`,
    "- This is distribution evidence, not a legal-compliance certification or a vulnerability audit.", "",
    "New/unknown declared license identifiers fail packaging until the review list is deliberately updated; the list applies only to the present source/static distribution scope.", "",
    "## Installed inventory", "", "| Package | Version | Declared license | Scope | License/notice files |", "| --- | --- | --- | --- | --- |",
    ...inventory.map((item) => `| ${item.name} | ${item.version} | ${item.license} | ${item.scopes.join(", ")} | ${item.separateNoticeFiles || (item.evidence.length ? "README only" : "None supplied")} |`), "",
  ];
  await writeFile(path.join(root, "doc/dependency-licenses.md"), `${review.join("\n")}\n`);
  console.log(`License inventory: ${inventory.length} packages; ${inventory.filter((item) => !item.separateNoticeFiles).length} without separate notice files (${inventory.filter((item) => !item.evidence.length).length} without README terms either); ${unavailable.length} absent optional/peer references.`);
  return payload;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await auditLicenses();

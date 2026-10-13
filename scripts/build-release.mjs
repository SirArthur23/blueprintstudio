import { spawnSync } from "node:child_process";
import { copyFile, cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { auditLicenses } from "./audit-licenses.mjs";

await auditLicenses();

const result = spawnSync("pnpm", ["build"], {
  stdio: "inherit",
  env: { ...process.env, BLUEPRINT_STATIC_EXPORT: "1", NEXT_PUBLIC_BASE_PATH: process.env.NEXT_PUBLIC_BASE_PATH ?? "/blueprintstudio", NEXT_TELEMETRY_DISABLED: "1" },
});
if (result.status !== 0) process.exit(result.status ?? 1);
// With output:export, Next 16 treats a custom distDir as the export directory.
// Copy that generated artifact to the conventional, documented handoff path.
await rm("out", { recursive: true, force: true });
await cp(".next-release", "out", { recursive: true });
await mkdir("out/doc", { recursive: true });
for (const file of ["LICENSE", "PRIVACY.md", "SECURITY.md", "THIRD_PARTY_NOTICES.md", "doc/manual.en.md", "doc/manual.de.md", "doc/feedback.en.md", "doc/feedback.de.md"]) {
  await copyFile(file, `out/${file}`);
  if (file.startsWith("doc/manual.")) {
    const markdown = await readFile(file, "utf8");
    await writeFile(`out/${file}`, markdown.replaceAll("../public/manual/", "../manual/"));
  }
}
await cp("release/licenses", "out/third-party", { recursive: true });
await copyFile("doc/dependency-licenses.md", "out/doc/dependency-licenses.md");

import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { findCredentialMarker, validatePublicPath } from "../../scripts/package-source.mjs";

describe("public source boundary", () => {
  it("has a unique explicit allowlist including release tests and notices", () => {
    const files: string[] = JSON.parse(readFileSync("scripts/source-files.json", "utf8"));
    expect(new Set(files).size).toBe(files.length);
    for (const file of files) expect(validatePublicPath(file)).toBe(file);
    expect(files).toContain("tests/e2e/keyboard.spec.ts");
    expect(files).toContain("public/fonts/OFL.txt");
    expect(files).toContain("pnpm-lock.yaml");
  });
  it.each(["../sibling/file.ts", "/private/file", "src/../../secret", "src\\secret", "src//file", "doc/Blueprint Studio_last chat.docx", ".env", ".env.local", "private/notes.md", "backup/project.json", "node_modules/react/LICENSE", ".git/config", ".publish/blueprintstudio/README.md", ".pnpm-store/v10/index.json", "out/index.html", "release/source/old.md", "test-results/log.txt"])("rejects %s", (file) => {
    expect(() => validatePublicPath(file)).toThrow();
  });
  it("refuses likely credential material without flagging ordinary prose", () => {
    expect(findCredentialMarker("Example local-first planning with no API keys.")).toBe(false);
    expect(findCredentialMarker("sk-" + "x".repeat(40))).toBe(true);
    expect(findCredentialMarker("-----BEGIN " + "PRIVATE KEY-----")).toBe(true);
    expect(findCredentialMarker("ghp_" + "x".repeat(40))).toBe(true);
  });
});

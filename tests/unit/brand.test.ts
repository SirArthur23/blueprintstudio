import { describe, expect, it } from "vitest";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { brandAssets } from "@/lib/brand";

describe("supplied Blueprint Studio branding", () => {
  for (const [name, asset, hash] of [
    ["mark", brandAssets.mark, "d07cca746b296f5039373f03d5fd2980896ce6852113ca0e3c358579f3d0d15e"],
    ["artwork", brandAssets.artwork, "7c600185058303c0e24e9e7c8c8c32a04941c86d5fcae49fd19c1e364a7a929a"],
  ] as const) {
    it(`${name}: retains supplied bytes, dimensions and explicit source inclusion`, () => {
      const file = `public/brand/${asset.src.split("/").at(-1)}`;
      const image = readFileSync(file);
      expect(image.subarray(1, 4).toString()).toBe("PNG");
      expect(image.readUInt32BE(16)).toBe(asset.width);
      expect(image.readUInt32BE(20)).toBe(asset.height);
      expect(createHash("sha256").update(image).digest("hex")).toBe(hash);
      expect(JSON.parse(readFileSync("scripts/source-files.json", "utf8"))).toContain(file);
    });
  }
  for (const locale of ["en", "de"]) {
    it(`${locale}: manual uses the supplied full artwork`, () => {
      expect(readFileSync(`doc/manual.${locale}.md`, "utf8")).toContain('../public/brand/BlueprintStudio_hires.png" alt="Blueprint Studio" width="360"');
    });
  }
  it("cooled primary and deep accent retain white-text contrast", () => {
    const css = readFileSync("src/app/globals.css", "utf8");
    for (const token of ["teal", "teal-deep"]) {
      const hex = css.match(new RegExp(`--${token}: #([a-f0-9]{6});`))![1];
      const rgb = hex.match(/../g)!.map((value) => parseInt(value, 16) / 255)
        .map((value) => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
      const luminance = 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
      expect(1.05 / (luminance + 0.05)).toBeGreaterThanOrEqual(4.5);
    }
  });
});

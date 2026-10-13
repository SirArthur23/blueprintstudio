import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { manualScreenshots } from "@/lib/manual-gallery";
import { manualExample } from "../fixtures/manual-example";
import { runHitmChecks } from "@/lib/blueprint-engine";

describe("fictional bilingual manual", () => {
  for (const locale of ["en", "de"] as const) {
    it(`${locale}: images have real dimensions, descriptions and explicit source inclusion`, () => {
      const shots = manualScreenshots(locale);
      expect(shots.map((shot) => shot.id)).toEqual(["brief", "workflow", "checks", "alternatives", "report", "backup"]);
      const approved: string[] = JSON.parse(readFileSync("scripts/source-files.json", "utf8"));
      const markdown = readFileSync(`doc/manual.${locale}.md`, "utf8");
      for (const shot of shots) {
        const image = readFileSync(`public/${shot.file}`);
        expect(image.subarray(1, 4).toString()).toBe("PNG");
        expect(shot.width).toBe(image.readUInt32BE(16));
        expect(shot.height).toBe(image.readUInt32BE(20));
        expect(shot.alt.length).toBeGreaterThan(20);
        expect(shot.caption.length).toBeGreaterThan(20);
        expect(approved).toContain(`public/${shot.file}`);
        expect(markdown).toContain(`../public/${shot.file}`);
      }
    });
    it(`${locale}: training fixture starts clear and can demonstrate the documented ownership mistake`, () => {
      const project = manualExample(locale);
      expect(runHitmChecks(project, locale)).toEqual([]);
      project.ownership = project.ownership.map((item) => item.id === "decisions" ? { ...item, humanOwner: "AI" } : item);
      expect(runHitmChecks(project, locale)).toHaveLength(1);
      expect(project.projectName).toMatch(locale === "en" ? /Fictional/ : /Erfundene/);
    });
  }
});

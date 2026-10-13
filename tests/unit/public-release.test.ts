import { describe, expect, it } from "vitest";
import { parseReleaseLinks, releaseLinks, releaseVersion } from "@/lib/public-release";
import { formatCalendarDate } from "@/lib/i18n";

describe("explicit public release links", () => {
  it("leaves unchosen destinations absent rather than fabricating live links", () => {
    expect(parseReleaseLinks()).toEqual({ sourceUrl: null, feedbackUrl: null });
    expect(releaseVersion).toMatch(/^\d+\.\d+\.\d+/);
  });
  it("uses the maintainer's chosen repository and bare feedback mailbox by default", () => {
    if (!process.env.NEXT_PUBLIC_BLUEPRINT_SOURCE_URL && !process.env.NEXT_PUBLIC_BLUEPRINT_FEEDBACK_URL) {
      expect(releaseLinks).toEqual({ sourceUrl: "https://github.com/SirArthur23/blueprintstudio", feedbackUrl: "mailto:blueprintstudio@schmidtpabst.com" });
    }
  });
  it("accepts explicit HTTPS destinations without attaching blueprint content", () => {
    expect(parseReleaseLinks("https://example.org/studio/source", "https://example.org/studio/feedback")).toEqual({ sourceUrl: "https://example.org/studio/source", feedbackUrl: "https://example.org/studio/feedback" });
    expect(parseReleaseLinks("", "mailto:beta@example.org").feedbackUrl).toBe("mailto:beta@example.org");
  });
  it.each(["http://example.org/", "javascript:alert(1)", "https://user:pass@example.org", "/not-a-public-repository"])("rejects unsafe source %s", (link) => {
    expect(() => parseReleaseLinks(link)).toThrow();
  });
  it.each(["mailto:beta@example.org?body=private-project", "mailto:first@example.org,second@example.org", "mailto:invalid", "mailto:beta@invalid..example.org", "javascript:alert(1)"])("rejects unsafe feedback %s", (link) => {
    expect(() => parseReleaseLinks("", link)).toThrow();
  });
  it("shows alternative dates in the selected language, with a stable UTC calendar day", () => {
    expect(formatCalendarDate("2026-10-13T23:59:59Z", "de")).toBe("13.10.2026");
    expect(formatCalendarDate("2026-10-13T23:59:59Z", "en")).toBe("13/10/2026");
    expect(formatCalendarDate("invalid", "de")).toBe("—");
  });
});

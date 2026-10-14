import { describe, expect, it } from "vitest";
import { isVerifiedImageRevalidationCancellation } from "../e2e/runtime-image-check";

const mark = "https://example.test/brand/BlueprintStudio_lores.png";
const artwork = "https://example.test/brand/BlueprintStudio_hires.png";
const valid = { browserName: "firefox", code: "NS_BINDING_ABORTED", url: mark,
  status: 304, knownImages: new Set([mark, artwork]), decodedImages: new Set([mark, artwork]) };

describe("decoded image revalidation diagnostics", () => {
  it.each([mark, artwork])("records only verified 304 cache cancellations: %s", (url) => {
    expect(isVerifiedImageRevalidationCancellation({ ...valid, url })).toBe(true);
  });
  it.each([200, 404, 500, undefined])("keeps non-304 responses failing: %s", (status) => {
    expect(isVerifiedImageRevalidationCancellation({ ...valid, status })).toBe(false);
  });
  it("keeps images without decoding evidence failing", () => {
    expect(isVerifiedImageRevalidationCancellation({ ...valid, decodedImages: new Set() })).toBe(false);
    expect(isVerifiedImageRevalidationCancellation({ ...valid, decodedImages: undefined })).toBe(false);
  });
  it("keeps other image URLs failing even if previously decoded", () => {
    const url = "https://example.test/broken.png";
    expect(isVerifiedImageRevalidationCancellation({ ...valid, url, decodedImages: new Set([url]) })).toBe(false);
  });
  it("keeps other browser and failure codes failing", () => {
    expect(isVerifiedImageRevalidationCancellation({ ...valid, browserName: "webkit" })).toBe(false);
    expect(isVerifiedImageRevalidationCancellation({ ...valid, code: "NS_ERROR_NET_RESET" })).toBe(false);
  });
});

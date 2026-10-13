import packageInfo from "../../package.json";
import publicDefaults from "./public-release-config.json";

export const releaseVersion = packageInfo.version;

/** Explicit public destinations only. No project content is appended to any link. */
export function parseReleaseLinks(source = "", feedback = "") {
  function httpsUrl(value: string) {
    const url = new URL(value);
    if (url.protocol !== "https:" || url.username || url.password) throw new Error("Public release links must use HTTPS without embedded credentials.");
    return url.href;
  }
  const sourceUrl = source.trim() ? httpsUrl(source.trim()) : null;
  const target = feedback.trim();
  let feedbackUrl: string | null = null;
  if (target.startsWith("mailto:")) {
    // A bare mailbox, not a query that silently includes a project or private details.
    if (!/^mailto:[A-Za-z0-9.!#$%&'*+/=_`{|}~-]+@(?:[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?\.)+[A-Za-z]{2,}$/.test(target) || target.includes("..") || target.startsWith("mailto:.") || target.includes(".@")) throw new Error("Feedback mail links must contain a single address without a subject/body query.");
    feedbackUrl = target;
  } else if (target) feedbackUrl = httpsUrl(target);
  return { sourceUrl, feedbackUrl };
}

export const releaseLinks = parseReleaseLinks(
  process.env.NEXT_PUBLIC_BLUEPRINT_SOURCE_URL ?? publicDefaults.sourceUrl,
  process.env.NEXT_PUBLIC_BLUEPRINT_FEEDBACK_URL ?? publicDefaults.feedbackUrl,
);

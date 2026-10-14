import { legacyStorageKeys, storageKey } from "./blueprint-engine";

export const welcomeStorageKey = "hitm-blueprint-welcome-v1";

/** Never put an introduction in front of an existing or unreadable draft. */
export function shouldShowWelcome(storage: Pick<Storage, "getItem">): boolean {
  try {
    return storage.getItem(welcomeStorageKey) !== "dismissed" &&
      [storageKey, ...legacyStorageKeys].every((key) => storage.getItem(key) === null);
  } catch {
    return false;
  }
}

/** UI preference only; never replace, clear or attach it to a project backup. */
export function rememberWelcomeDismissal(storage: Pick<Storage, "setItem">): boolean {
  try {
    storage.setItem(welcomeStorageKey, "dismissed");
    return true;
  } catch {
    return false;
  }
}

import { describe, expect, it } from "vitest";
import { legacyStorageKeys, storageKey } from "../../src/lib/blueprint-engine";
import { rememberWelcomeDismissal, shouldShowWelcome, welcomeStorageKey } from "../../src/lib/welcome";

function storage(initial: Record<string, string> = {}) {
  const values = new Map(Object.entries(initial));
  return { values, getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => { values.set(key, value); } };
}

describe("welcome preference", () => {
  it("welcomes an empty browser without changing its storage", () => {
    const local = storage();
    expect(shouldShowWelcome(local)).toBe(true);
    expect(local.values.size).toBe(0);
  });
  it("remembers dismissal independently of project data", () => {
    const local = storage({ [storageKey]: "private draft" });
    expect(rememberWelcomeDismissal(local)).toBe(true);
    expect(local.getItem(storageKey)).toBe("private draft");
    expect(local.getItem(welcomeStorageKey)).toBe("dismissed");
    expect(shouldShowWelcome(local)).toBe(false);
  });
  it("does not automatically return after dismissal even without a saved project", () => {
    expect(shouldShowWelcome(storage({ [welcomeStorageKey]: "dismissed" }))).toBe(false);
  });
  it.each([storageKey, ...legacyStorageKeys])("does not interrupt any existing draft at %s", (key) => {
    expect(shouldShowWelcome(storage({ [key]: "corrupt or old data" }))).toBe(false);
    expect(shouldShowWelcome(storage({ [key]: "" }))).toBe(false);
  });
  it("does not obscure storage errors or throw when preferences cannot be stored", () => {
    const blocked = { getItem: () => { throw new Error("unavailable"); }, setItem: () => { throw new Error("unavailable"); } };
    expect(shouldShowWelcome(blocked)).toBe(false);
    expect(rememberWelcomeDismissal(blocked)).toBe(false);
  });
});

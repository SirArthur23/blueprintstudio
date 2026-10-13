export type InstalledLicense = { name: string; version: string; license: string; scopes: string[]; directory: string; files: string[]; readmes: string[] };
export function collectLicenseInventory(): { packages: InstalledLicense[]; unavailable: Array<{ parent: string; name: string; range: string; reason: string }> };
export function auditLicenses(): Promise<unknown>;

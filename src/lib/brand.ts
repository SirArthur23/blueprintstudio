// Supplied artwork, served unchanged and locally in both static deployment modes.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

export const brandAssets = {
  mark: { src: `${basePath}/brand/BlueprintStudio_lores.png`, width: 1254, height: 1254 },
  artwork: { src: `${basePath}/brand/BlueprintStudio_hires.png`, width: 1312, height: 1199 },
} as const;

# Third-party notices

The project MIT license applies to original code/documentation. Dependencies and bundled fonts retain their licenses.

## Fonts

- Plus Jakarta Sans: copyright 2020 The Plus Jakarta Sans Project Authors. [Upstream](https://github.com/tokotype/PlusJakartaSans).
- Syne: copyright 2017 The Syne Project Authors. [Upstream](https://gitlab.com/bonjour-monde/fonderie/syne-typeface).

Both use SIL Open Font License 1.1, included at [public/fonts/OFL.txt](public/fonts/OFL.txt). The license is included in the static export. Fonts are served locally and are not fetched from Google Fonts at runtime.

## Code dependencies

Installed package versions are locked in `pnpm-lock.yaml`. React, React DOM, and Next.js use MIT; Lucide uses ISC. Their package license files remain authoritative. Development-only dependencies are not application services.

Run `pnpm audit:licenses` to regenerate the [installed dependency inventory](doc/dependency-licenses.md). The audit reads project-local installed manifests, license files, Next's compiled third-party notices, and README terms even where separate files are present. This retains Sharp wrapper library-attribution tables as well as their declared combined terms. It does not depend on the pnpm store's license index or fetch registry metadata.

Both prepared distributions include `third-party/inventory.json` (versions, declared licenses, evidence hashes, and absent optional/peer references) and `third-party/THIRD_PARTY_LICENSES.txt` (supplied upstream text). These notices conservatively include build/test dependencies. Neither distribution vendors node_modules or native build tools. In particular, the LGPL libvips image-processing binary is not shipped in the static browser app or source package. A future server/container distribution requires a separate review.

Metadata-only packages and platform-specific optional dependencies remain explicitly flagged in the inventory. This is a review of the prepared source/static distribution, not permission to redistribute arbitrary dependency binaries or a legal-compliance certification. Rebuild the inventory after any dependency/lockfile or build-host change.

# Static release deployment

Planned destination: `https://blueprintstudio.schmidtpabst.com/`, a dedicated origin for browser-local projects. Hosting is not deployed or verified. Infrastructure preparation belongs in the schmidtpabst repository/session and requires explicit approval before DNS or server changes. Build with an explicit empty base path.

## Build and preview (retained path variant)

```sh
pnpm install --frozen-lockfile
pnpm typecheck
pnpm lint
pnpm test
pnpm build:release
pnpm preview:release
```

Open `http://127.0.0.1:3031/blueprintstudio/`. The build has `/blueprintstudio` compiled as its base path. Deploy the contents of `out/` to that URL path, including `_next`, fonts, license notices, and `help/`. Do not deploy the whole source workspace. A Node server is not required in production.

For another path, set `NEXT_PUBLIC_BASE_PATH` to that path without a trailing slash for both build and preview. For a dedicated hostname root:

```sh
NEXT_PUBLIC_BASE_PATH='' pnpm build:release
NEXT_PUBLIC_BASE_PATH='' pnpm preview:release
```

Path changes require rebuilding. The usual `pnpm dev` remains at the root of localhost:3021. Next exports to `.next-release/`; the build script copies the export and public documentation into `out/`, which is recreated on each successful build. Next manages its compiler cache under `.next/`.

## Host preparation

### Public beta links

The workspace shows “Beta preview / Beta-Vorschau” and the package version. **More → Source & feedback** opens the local bilingual help section, with MIT attribution, privacy guidance and a feedback template. It does not upload the current project.

Forks can override the maintainer-approved public destinations with these build-time variables:

- `NEXT_PUBLIC_BLUEPRINT_SOURCE_URL`: the chosen HTTPS repository URL.
- `NEXT_PUBLIC_BLUEPRINT_FEEDBACK_URL`: the chosen HTTPS feedback page or a bare `mailto:address` (no prefilled subject/body or multiple recipients).

Maintainer-approved defaults are in `src/lib/public-release-config.json`: source `https://github.com/SirArthur23/blueprintstudio` and feedback `mailto:blueprintstudio@schmidtpabst.com`, selected on 2026-10-13. Environment values override these; an explicit empty value disables that link and shows pending text. Invalid protocols/embedded credentials fail the build. Values are public, compiled into the app; never put secrets or private invitations in them. Changing them requires a rebuild. No blueprint data is appended to a destination. Link configuration does not enable private security reporting; it was separately enabled and verified for the chosen repository. Mailbox provisioning/delivery has not been tested.

### Illustrated manuals

`public/manual/` contains twelve screenshots from isolated Chromium contexts: six views each in English and German. The fixture in `tests/fixtures/manual-example.ts` uses invented training material and no real records. The warning screenshot intentionally assigns final decisions to AI for demonstration, then the capture script corrects that assignment before reporting. The alternative is compared, not adopted.

To refresh screenshots after a UI change, run `pnpm build:release`, `pnpm manual:screenshots`, then `pnpm build:release` again to ship the updated PNGs and metadata. The capture command requires the installed Chromium test browser and writes only the known `public/manual/` images/metadata. It does not use the user's normal browser profile. Review the images before handoff. The static build rewrites manual image paths from source-repository paths to the actual deployed `manual/` directory; originals remain unchanged.

Screenshot metadata stores intrinsic dimensions; captions/alt text are bilingual. Local help provides full-size image links. Feedback templates and `SECURITY.md` are included in the static output. Private GitHub vulnerability reporting is enabled; feedback mailbox delivery remains untested.

Use HTTPS. Preserve directory index serving and trailing-slash redirects. Unknown paths should return 404. Serve hashed `_next/static/` assets with long-lived caching and HTML with revalidation. Confirm all URLs work under the configured path, especially locally bundled font files and help.

Browser local storage is tied to scheme/hostname/port, not URL path. `http://localhost:3021`, the local preview, and the public hostname each have different storage. Users need JSON backups to transfer work. The dedicated public origin isolates project storage from the Ghost sites. It does not encrypt local storage. Applications on the same hostname still share an origin.

Confirm the operator's access-log retention and contact/privacy/legal notices before publishing. The app adds no analytics or project-upload endpoint. Do not silently add analytics during host setup.

## Reproducible public source

Run `pnpm package:source` to prepare `release/source/hitm-blueprint/` as the standalone repository candidate. `scripts/source-files.json` is an explicit reviewed allowlist: new files are not silently swept into publication. The packager refuses traversal, private/generated paths, symlinks, and common credential markers. It copies no Git history, conversation DOCX, environment files, backups, sibling folders, node_modules, or build caches. This is a hygiene guard, not an exhaustive secret or privacy scanner; inspect the final contents before publishing.

`SOURCE_MANIFEST.json` records file sizes and SHA-256 digests. The only source normalization removes the generated `.next` route-types import from the staged `next-env.d.ts`, so cache-free typechecking works; the manifest records both the original hash and transformation. The live working file is not changed. Install dependencies with `pnpm install --frozen-lockfile` inside the new source checkout. Keep `pnpm-lock.yaml` and the included `third-party/` notices.

The same command uses the host's `tar` utility to create `release/hitm-blueprint-0.1.0-source.tar.gz` and `release/source-package.sha256` for handoff. The archive contains the staged directory, not the workspace. Re-run packaging after changing any release-approved source or documentation.

The included `.github/workflows/verify.yml` applies when `.github/` is at the standalone repository root. It runs checks and prepares source, but does not deploy. The packager itself creates no Git repository, remote, tag, or commit. Source publication is a separate approved operation; the maintainer-selected public repository and security/conduct contacts are configured.

`pnpm audit:licenses` inventories the installed graph and supplied upstream notices without registry access. Static builds include those notices automatically. See `doc/dependency-licenses.md` for scope, platform limits, README-only/metadata-only packages, and the distinction between shipped browser assets and native/build/test tooling.

## Acceptance and rollback

Run the exported-build browser suite before upload. After approved publication, verify the live path/assets and fictional-project export/import/refresh through scripted checks in the configured browser engines and phone-sized viewport; inspect console/network errors, manual and public feedback/source links. Actual-user/real-device studies remain deferred under the budget decision, not required for initial release.

Retain the previous verified static artifact for rollback. Reverting assets does not revert browser data; keep storage-schema migrations compatible and ask users to export backups before a breaking upgrade. Record artifact version, date, build commands, and actual host checks in the release record.

References: [Next.js static exports](https://nextjs.org/docs/app/guides/static-exports), [Next.js basePath](https://nextjs.org/docs/app/api-reference/config/next-config-js/basePath).

## Root and retained path verification

`NEXT_PUBLIC_BASE_PATH='' pnpm test:e2e` uses the root preview and real root asset/help assertions. Leave the variable unset to retain `/blueprintstudio/` coverage with a matching path build. Rebuild before changing modes. For approved live checks, set `BLUEPRINT_E2E_BASE_URL=https://blueprintstudio.schmidtpabst.com/` plus the empty base path; this disables the preview startup and retains normal TLS validation. Browser profiles are isolated and fictional fixtures remain mandatory.

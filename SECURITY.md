# Security reporting

Private vulnerability reporting is enabled for [SirArthur23/blueprintstudio](https://github.com/SirArthur23/blueprintstudio/security), verified through GitHub on 2026-10-13. Use the repository's **Security → Report a vulnerability** route. Arthur Schmidt-Pabst (GitHub: SirArthur23) is the project maintainer responsible for triage. No sample vulnerability report has been submitted to test notifications or human response.

Do not post an exploitable issue or private blueprint in a public issue. Include the affected version, reproducible steps using fictional data, and the impact. The project currently offers no guaranteed response time or bug bounty.

The hosted public beta is still in preparation. The general feedback mailbox is `blueprintstudio@schmidtpabst.com`; use GitHub's private vulnerability route for security reports. The app does not provision or test that mailbox.

Blueprint Studio stores one current project and its alternatives in browser local storage. That storage is not encrypted by the app. People and scripts with access to the same browser profile/origin may access it. JSON and Markdown exports are plain files. Imported backups should be treated as untrusted input and are validated before replacing the current project.

For deployments, serve production assets over HTTPS and review the hostname's other applications because local storage is shared by origin, not isolated by URL path. See [PRIVACY](PRIVACY.md) and [deployment notes](doc/deployment.md).

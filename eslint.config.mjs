import next from "eslint-config-next";

const config = [
  ...next,
  { ignores: [".next-release/**", "out/**", "release/**", ".publish/**", ".pnpm-store/**", "playwright-report/**", "test-results/**", "coverage/**"] },
];

export default config;

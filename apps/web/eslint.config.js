import { nextJsConfig } from "@repo/eslint-config/next-js";

/** @type {import("eslint").Linter.Config[]} */
export default [
  {
    ignores: [
      ".next/**",
      "out/**",
      "public/interactions/**",
      "next-env.d.ts",
      "app/registry.ts",
      "lib/works.generated.tsx",
    ],
  },
  ...nextJsConfig,
];

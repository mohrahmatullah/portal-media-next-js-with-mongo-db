import next from "eslint-config-next";

/** @type {import("eslint").Linter.Config[]} */
const config = [
  ...next,
  {
    ignores: [".next/**", "out/**", "build/**", "node_modules/**", "next-env.d.ts"],
  },
];

export default config;

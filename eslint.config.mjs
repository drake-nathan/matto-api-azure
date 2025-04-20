// @ts-check
import { eslintConfig } from "js-style-kit";

export default eslintConfig({
  ignores: ["cache"],
  rules: {
    "@typescript-eslint/await-thenable": "off",
    "@typescript-eslint/restrict-plus-operands": "off",
    camelcase: "off",
    "unicorn/filename-case": "off",
  },
  testing: {
    framework: "jest",
  },
  typescript: "tsconfig.eslint.json",
});

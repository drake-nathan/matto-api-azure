// @ts-check
import { eslintConfig } from "js-style-kit";

export default eslintConfig({
  ignores: ["cache"],
  testing: {
    framework: "jest",
  },
  typescript: "tsconfig.eslint.json",
});

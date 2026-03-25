import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Auto-generated files
    "contracts/artifacts/**",
    "contracts/types/**",
    "contracts/cache/**",
    // Old scripts
    "reorganize.js",
    "reorganize.py",
    "reorganize_project.bat",
    "full_reorganize.bat",
    "reorganize_structure.bat",
    "create_dirs.bat",
  ]),
]);

export default eslintConfig;

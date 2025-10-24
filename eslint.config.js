// eslint.config.js
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import boundaries from "eslint-plugin-boundaries"; // ← ДОБАВИТЬ

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },

    // ✏️ ДОБАВИТЬ плагин boundaries
    plugins: {
      boundaries,
    },

    // ✏️ ДОБАВИТЬ настройки boundaries
    settings: {
      "boundaries/elements": [
        { type: "domain", pattern: "src/domain/**/*" },
        { type: "application", pattern: "src/application/**/*" },
        { type: "infrastructure", pattern: "src/infrastructure/**/*" },
        { type: "composition", pattern: "src/composition/**/*" },
        { type: "presentation", pattern: "src/presentation/**/*" },
      ],
      "boundaries/ignore": ["**/*.test.ts", "**/*.spec.ts"],
    },

    rules: {
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-explicit-any": "warn",

      // ✏️ ДОБАВИТЬ правила архитектурных границ
      "boundaries/element-types": [
        "error",
        {
          default: "disallow",
          rules: [
            // Domain - полностью изолирован
            {
              from: "domain",
              allow: ["domain"], // Только внутри себя
            },

            // Application - Domain + сам себя
            {
              from: "application",
              allow: ["domain", "application"],
            },

            // Infrastructure - Domain + сам себя
            {
              from: "infrastructure",
              allow: ["domain", "infrastructure"],
            },

            // Composition - доступ ко всем (единственное исключение)
            {
              from: "composition",
              allow: ["domain", "application", "infrastructure", "composition"],
            },

            // Presentation - только Domain (типы) и Composition (facades)
            {
              from: "presentation",
              allow: ["domain", "composition", "presentation"],
            },
          ],
        },
      ],
    },
  },
  {
    ignores: [
      "**/node_modules/**",
      "**/build/**",
      "**/dist/**",
      "**/.cache/**",
      "eslint.config.js",
    ],
  },
);

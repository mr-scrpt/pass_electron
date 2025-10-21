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

            // Application - только Domain
            {
              from: "application",
              allow: ["domain"],
            },

            // Infrastructure - только Domain
            {
              from: "infrastructure",
              allow: ["domain"],
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

      // ✏️ ДОБАВИТЬ запрет прямых импортов из Application/Infrastructure
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/application/*", "@/infrastructure/*"],
              message:
                "Presentation cannot import directly from Application or Infrastructure. Use @/domain or @/composition instead.",
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

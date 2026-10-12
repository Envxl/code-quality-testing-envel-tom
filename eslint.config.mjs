import js from "@eslint/js";
import prettier from "eslint-config-prettier";
import jsxA11y from "eslint-plugin-jsx-a11y-x";
import pluginN from "eslint-plugin-n";
import perfectionist from "eslint-plugin-perfectionist";
import pluginReact from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import unicorn from "eslint-plugin-unicorn";
import { defineConfig, globalIgnores } from "eslint/config";
import globals from "globals";

export default defineConfig([
  globalIgnores(["**/node_modules/", "**/build/", "**/dist/", "**/coverage/"]),

  // Base JS + règles communes
  {
    files: ["**/*.{js,mjs,cjs,jsx}"],
    plugins: { js },
    extends: [
      "js/recommended",
      unicorn.configs.recommended,
      perfectionist.configs["recommended-natural"],
    ],
    languageOptions: {
      ecmaVersion: "latest",
      globals: { ...globals.browser, ...globals.node },
    },
  },

  // Backend (Node, CommonJS)
  {
    files: ["packages/backend/**/*.{js,mjs,cjs}"],
    extends: [pluginN.configs["flat/recommended"]],
    languageOptions: { globals: globals.node },
    rules: {
      "unicorn/prefer-module": "off",
      "unicorn/prefer-top-level-await": "off",
    },
  },

  // Frontend (React)
  {
    files: ["packages/frontend/**/*.{js,jsx}"],
    extends: [
      pluginReact.configs.flat.recommended,
      pluginReact.configs.flat["jsx-runtime"],
      reactHooks.configs.flat.recommended,
      jsxA11y.configs.recommended,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    settings: { react: { version: "18" } }, // mets ta vraie version
  },

  // Globals Jest pour les tests et mocks
  {
    files: ["**/*.test.{js,jsx}", "**/__mocks__/**/*.{js,jsx}", "**/testUtils.js"],
    languageOptions: { globals: globals.jest },
  },

  // Règles de style jugées trop subjectives (doit venir APRÈS les blocs ci-dessus)
  {
    files: ["**/*.{js,jsx}"],
    rules: {
      "no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
      "perfectionist/sort-jsx-props": "off",
      "perfectionist/sort-objects": "off",
      "perfectionist/sort-switch-case": "off",
      "unicorn/consistent-boolean-name": "off",
      "unicorn/consistent-compound-words": "off",
      "unicorn/default-export-style": "off",
      "unicorn/filename-case": [
        "error",
        { cases: { camelCase: true, kebabCase: true, pascalCase: true } },
      ],
      "unicorn/name-replacements": "off",
      "unicorn/no-null": "off",
      "unicorn/prefer-global-this": "off",
    },
  },

    // Spécificités de Create React App
  {
    files: ["packages/frontend/**/*.{js,jsx}"],
    rules: {
      "unicorn/prefer-module": "off",
      "unicorn/prefer-top-level-await": "off",
    },
  },

  // Le fichier de config lui-même
  {
    files: ["eslint.config.mjs"],
    rules: {
      "perfectionist/sort-objects": "off",
      "unicorn/no-top-level-side-effects": "off",
    },
  },

  // Doit rester en dernier : désactive les règles en conflit avec Prettier
  prettier,
]);
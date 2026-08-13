import globals from "globals";
import pluginJs from "@eslint/js";
import pluginReact from "eslint-plugin-react";
import pluginReactHooks from "eslint-plugin-react-hooks";
import pluginUnusedImports from "eslint-plugin-unused-imports";

export default [
  {
    files: [
      "./*.{js,mjs,cjs,jsx}",
      "pages/**/*.{js,mjs,cjs,jsx}",
      "ui/**/*.{js,mjs,cjs,jsx}",
      "board/**/*.{js,mjs,cjs,jsx}",
      "calendar/**/*.{js,mjs,cjs,jsx}",
      "dashboard/**/*.{js,mjs,cjs,jsx}",
      "hooks/**/*.{js,mjs,cjs,jsx}",
      "lib/**/*.{js,mjs,cjs,jsx}",
      "sales/**/*.{js,mjs,cjs,jsx}",
      "settings/**/*.{js,mjs,cjs,jsx}",
      "tasklist/**/*.{js,mjs,cjs,jsx}",
      "utils/**/*.{js,mjs,cjs,jsx}"
    ],
    ignores: ["lib/api/**/*", "ui/**/*", "node_modules/**/*", "dist/**/*"],
    ...pluginJs.configs.recommended,
    ...pluginReact.configs.flat.recommended,
    languageOptions: {
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    settings: {
      react: {
        version: "detect",
      },
    },
    plugins: {
      react: pluginReact,
      "react-hooks": pluginReactHooks,
      "unused-imports": pluginUnusedImports,
    },
    rules: {
      "no-unused-vars": "off",
      "react/jsx-uses-vars": "error",
      "react/jsx-uses-react": "error",
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": [
        "warn",
        {
          vars: "all",
          varsIgnorePattern: "^_",
          args: "after-used",
          argsIgnorePattern: "^_",
        },
      ],
      "react/prop-types": "off",
      "react/react-in-jsx-scope": "off",
      "react/no-unknown-property": [
        "error",
        { ignore: ["cmdk-input-wrapper", "toast-close"] },
      ],
      "react-hooks/rules-of-hooks": "error",
    },
  },
];

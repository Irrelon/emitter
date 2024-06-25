import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";


export default [
	{ files: ["**/*.{js,mjs,cjs,ts}"] },
	{ languageOptions: { globals: globals.browser } },
	pluginJs.configs.recommended,
	...tseslint.configs.recommended,
	{
		rules: {
			"@typescript-eslint/no-unnecessary-type-assertion": "off",
			"@typescript-eslint/consistent-type-definitions": "off",
			"@typescript-eslint/no-empty-interface": "off",
			"@typescript-eslint/no-empty-arrow-function": "off",
			"@typescript-eslint/no-empty-function": "off",
			"@typescript-eslint/no-inferrable-types": "off",
			"@typescript-eslint/no-non-null-assertion": "off",
			"@typescript-eslint/strict-boolean-expressions": "off",
			"@typescript-eslint/ban-ts-comment": "off",
			"@typescript-eslint/no-this-alias": "off",
			"@typescript-eslint/no-explicit-any": "off",
			"@typescript-eslint/no-shadow": "error",
			"indent": ["error", "tab"],
			"space-before-function-paren": [
				"error",
				"always"
			],
			"no-shadow": "off",
			"complexity": [
				"warn",
				20
			],
			"max-depth": [
				"warn",
				4
			],
			"prefer-rest-params": "off"
		}
	}
];
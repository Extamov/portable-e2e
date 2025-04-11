import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import prettierPlugin from "eslint-plugin-prettier/recommended";

export default tseslint.config(
	eslint.configs.recommended,
	reactHooksPlugin.configs["recommended-latest"],
	tseslint.configs.strict,
	tseslint.configs.stylistic,
	prettierPlugin,
	{
		rules: {
			"@typescript-eslint/no-non-null-assertion": "off",
			"@typescript-eslint/no-explicit-any": "off",
			"@typescript-eslint/no-empty-function": "off",
			"no-empty": "off",
		},
	},
	{
		ignores: ["dist"],
	},
);

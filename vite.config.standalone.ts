import { defineConfig } from "vite";
import path from "path";
import preact from "@preact/preset-vite";
import { viteSingleFile } from "vite-plugin-singlefile";

export default defineConfig({
	root: path.resolve(__dirname, "src"),
	plugins: [preact(), viteSingleFile({ removeViteModuleLoader: true })],
	build: {
		outDir: path.resolve(__dirname, "dist"),
		emptyOutDir: true,
	},
	esbuild: {
		legalComments: "none",
	},
});

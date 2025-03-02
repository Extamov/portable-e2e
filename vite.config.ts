import { defineConfig } from "vite";
import path from "path";
import preact from "@preact/preset-vite";

export default defineConfig({
	base: "/portable-e2e/",
	root: path.resolve(__dirname, "src"),
	plugins: [preact()],
	build: {
		outDir: path.resolve(__dirname, "dist"),
		emptyOutDir: true,
		chunkSizeWarningLimit: 3000,
		rollupOptions: {
			output: {
				manualChunks: (id) => (id.includes("node_modules") && id.toLowerCase().endsWith("js") ? "vendor" : null),
			},
		},
	},
	esbuild: {
		legalComments: "none",
	},
});

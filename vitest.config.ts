import { defineConfig } from "vitest/config";
import { resolve } from "path";

export default defineConfig({
	resolve: {
		alias: {
			// Resolve SvelteKit's $lib path alias for load-function tests
			$lib: resolve(__dirname, "apps/app/src/lib"),
		},
	},
	test: {
		include: ["apps/**/*.test.ts", "packages/**/*.test.ts"],
		exclude: ["**/node_modules/**", "**/tests/**", "**/*.spec.ts"],
		globals: true,
		environment: "node",
	},
});

import { defineConfig } from "vitest/config";
import { paraglideVitePlugin } from "@inlang/paraglide-js";
import { resolve } from "path";

export default defineConfig({
	plugins: [
		// Generates apps/app/src/lib/paraglide/ (gitignored) before tests run — this
		// config is standalone from apps/app/vite.config.ts, so the plugin must be
		// registered here too or `$lib/paraglide/messages` fails to resolve on a
		// fresh checkout (nothing else in `npm run test:unit` triggers codegen).
		paraglideVitePlugin({
			project: resolve(__dirname, "apps/app/project.inlang"),
			outdir: resolve(__dirname, "apps/app/src/lib/paraglide"),
			strategy: ["cookie", "preferredLanguage", "baseLocale"],
		}),
	],
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

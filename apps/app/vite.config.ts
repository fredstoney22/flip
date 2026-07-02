import tailwindcss from '@tailwindcss/vite';
import { paraglideVitePlugin } from '@inlang/paraglide-js';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig, loadEnv } from 'vite';
import { resolve } from 'path';

const monorepoRoot = resolve(__dirname, '../../');
const apiRoot = resolve(__dirname, '../api/src');

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, monorepoRoot, '');
  Object.assign(process.env, env);

  return {
    plugins: [
      tailwindcss(),
      paraglideVitePlugin({
        project: './project.inlang',
        outdir: './src/lib/paraglide',
        // Explicit user choice (settings store) wins; otherwise detect from the
        // Accept-Language header; final fallback is the base locale (en).
        strategy: ['cookie', 'preferredLanguage', 'baseLocale']
      }),
      sveltekit()
    ],
    envDir: monorepoRoot,
    resolve: {
      alias: {
        '@lib': resolve(apiRoot, 'lib'),
        '@middleware': resolve(apiRoot, 'middleware'),
        '@routes': resolve(apiRoot, 'routes'),
        '@schemas': resolve(apiRoot, 'schemas'),
        '@utils': resolve(apiRoot, 'utils')
      }
    },
    ssr: {
      noExternal: ['svelte-sonner', '@flip/api', '@scalar/hono-api-reference']
    }
  };
});

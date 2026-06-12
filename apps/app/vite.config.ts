import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig, loadEnv } from 'vite';
import { resolve } from 'path';

const monorepoRoot = resolve(__dirname, '../../');
const apiRoot = resolve(__dirname, '../api/src');

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, monorepoRoot, '');
  Object.assign(process.env, env);

  return {
    plugins: [tailwindcss(), sveltekit()],
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

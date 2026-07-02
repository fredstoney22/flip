/** True when running a non-production Node build (SvelteKit server). */
export function isDevEnvironment(): boolean {
  return process.env.NODE_ENV !== 'production';
}

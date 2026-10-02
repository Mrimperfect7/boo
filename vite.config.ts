import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig(({ command }) => {
  // @ts-ignore
  const isGitHubActions = process.env.GITHUB_ACTIONS === 'true';
  return {
    base: command === 'build' && isGitHubActions ? '/boo/' : '/',
    plugins: [react()],
  server: {
    host: '127.0.0.1',
    port: 5199,
    strictPort: false,
  },
  build: {
    target: 'es2022',
    cssTarget: 'chrome110',
    chunkSizeWarningLimit: 1200,
  },
  };
});

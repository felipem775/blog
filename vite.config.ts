import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Fix: Cast process to any to avoid type error about 'cwd' missing
  const env = loadEnv(mode, (process as any).cwd(), '');
  return {
    plugins: [react()],
    // Esto es crucial para que GitHub Pages funcione en subdirectorios (ej. user.github.io/repo)
    base: './',
    define: {
      // Expose specific env vars to process.env so they are available in the code
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
      'process.env.GITHUB_OWNER': JSON.stringify(env.GITHUB_OWNER),
      'process.env.GITHUB_REPO': JSON.stringify(env.GITHUB_REPO),
      'process.env.GITHUB_TOKEN': JSON.stringify(env.GITHUB_TOKEN),
      // Fallback to prevent crashes if code accesses other process.env properties
      'process.env': {}
    }
  }
})
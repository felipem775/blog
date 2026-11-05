import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Carga las variables de entorno desde .env o el sistema
  // Casting a 'any' para evitar errores de tipo si process no está completamente tipado en este contexto
  const env = loadEnv(mode, (process as any).cwd(), '');
  
  return {
    plugins: [react()],
    // Esto es crucial para que GitHub Pages funcione en subdirectorios
    base: './',
    define: {
      // Definimos process.env como un objeto que contiene nuestras variables.
      // Esto permite que tanto 'process.env.VAR' como 'process.env["VAR"]' funcionen correctamente.
      'process.env': JSON.stringify({
        GITHUB_OWNER: env.GITHUB_OWNER,
        GITHUB_REPO: env.GITHUB_REPO,
        BLOG_MODE: env.BLOG_MODE,
        BLOG_DESC: env.BLOG_DESC,
        API_KEY: env.API_KEY
      })
    }
  }
})
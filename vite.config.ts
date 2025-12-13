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
      // Exponemos las variables explícitamente para que estén disponibles en el código cliente
      'process.env.GITHUB_OWNER': JSON.stringify(env.GITHUB_OWNER),
      'process.env.GITHUB_REPO': JSON.stringify(env.GITHUB_REPO),
      'process.env.GITHUB_TOKEN': JSON.stringify(env.GITHUB_TOKEN),
      'process.env.BLOG_MODE': JSON.stringify(env.BLOG_MODE),
      // Fallback para evitar crashes
      'process.env': {}
    }
  }
})
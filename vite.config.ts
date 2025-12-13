import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Esto es crucial para que GitHub Pages funcione en subdirectorios (ej. user.github.io/repo)
  base: './',
  define: {
    // Evita que la app falle si intenta acceder a process.env en el navegador
    'process.env': {}
  }
})
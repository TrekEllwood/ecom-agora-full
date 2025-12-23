import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src/features'),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost/ecom-api/routes',
        changeOrigin: true,
        // remove the '/api' prefix
        rewrite: path => path.replace(/^\/api/, ''),
      },
    },
  },
})

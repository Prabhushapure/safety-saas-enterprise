import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/GamifiedLearning/',   // VERY IMPORTANT for production!!

  plugins: [react()],

  // Dev server only — NOT used in production
  server: {
    host: '0.0.0.0',
    port: 4000,
    allowedHosts: [
      'antiz-digital.com',
      'www.antiz-digital.com'
    ],
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/GamifiedLearning/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/GamifiedLearning/, ''),
      },
    },
  },
})

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/AWE-SaaS/',   // VERY IMPORTANT for production!!

  plugins: [react()],

  // Dev server only — NOT used in production
  server: {
    host: '0.0.0.0',
    port: 4000,
    allowedHosts: [
      'suraxa-safety.com',
      'www.suraxa-safety.com'
    ],
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
})

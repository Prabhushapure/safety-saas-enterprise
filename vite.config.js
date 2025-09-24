import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // base: '/safety-saas-master/',
  plugins: [react()],
  server: {
	host: '0.0.0.0',
        port: 4000,
	allowedHosts: [
      		'suraxa-safety.com',      // add your domain
      		'www.suraxa-safety.com'   // add this too if you’ll use www
    	],
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
})

import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { networkInterfaces } from 'os'

// This laptop's Wi-Fi/LAN address (e.g. 192.168.0.203), so share links
// work on other devices on the same network instead of pointing to "localhost".
function getLanAddress(): string {
  for (const addresses of Object.values(networkInterfaces())) {
    for (const address of addresses || []) {
      if (address.family === 'IPv4' && !address.internal) return address.address
    }
  }
  return ''
}

export default defineConfig({
  plugins: [react()],
  define: {
    __LAN_ADDRESS__: JSON.stringify(getLanAddress()),
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})

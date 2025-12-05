import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8081',
        changeOrigin: true,
        secure: false,
        // --- THÊM PHẦN NÀY ĐỂ GIẢ MẠO HEADER ---
        configure: (proxy, _options) => {
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            // Ghi đè Origin header thành địa chỉ của Backend
            // Điều này đánh lừa Spring Boot rằng request đến từ "chính nó"
            proxyReq.setHeader('Origin', 'http://localhost:8081');
          });
        },
        // ----------------------------------------
      },
    },
  },
})
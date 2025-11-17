import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // 将所有以/api开头的请求代理到后端服务器
      '/api': {
        target: 'http://localhost:8000', // 后端FastAPI服务器地址
        changeOrigin: true,
        secure: false
      }
    }
  }
})
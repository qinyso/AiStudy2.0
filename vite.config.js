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
      },
      // 添加对/upload路径的代理配置，解决CORS问题
      '/upload': {
        target: 'https://ferny-darlene-unled.ngrok-free.dev',
        changeOrigin: true,
        secure: false
      },
      // 添加对/predict路径的代理配置
      '/predict': {
        target: 'https://ferny-darlene-unled.ngrok-free.dev',
        changeOrigin: true,
        secure: false
      }
    }
  }
})
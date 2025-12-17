import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // 为病理报告生成接口单独设置代理，指向本地服务
      '/api/report': {
        target: 'http://localhost:8000', // 本地后端FastAPI服务器地址
        changeOrigin: true,
        secure: false
      },
      // 将所有其他以/api开头的请求代理到原来的后端服务器
      '/api': {
        target: 'https://subclavicular-planoblastic-alexia.ngrok-free.dev', // 后端FastAPI服务器地址
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
      },
      // 添加对/inferenceimage路径的代理配置
      '/inferenceimage': {
        target: 'https://ferny-darlene-unled.ngrok-free.dev',
        changeOrigin: true,
        secure: false
      },
      // 添加对/results路径的代理配置，用于访问分析结果图片
      '/results': {
        target: 'https://subclavicular-planoblastic-alexia.ngrok-free.dev',
        changeOrigin: true,
        secure: false
      },
      
    }
  }
})
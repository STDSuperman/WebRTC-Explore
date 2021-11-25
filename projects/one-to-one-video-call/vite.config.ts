import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import reactRefresh from '@vitejs/plugin-react-refresh';
import hooks from '@midwayjs/vite-plugin-hooks';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [hooks(), reactRefresh()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  }
})

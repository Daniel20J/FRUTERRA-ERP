import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import pwaPlugin from './build/pwaPlugin.ts'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), pwaPlugin()],
})

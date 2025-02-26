import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import dotenv from 'dotenv';
dotenv.config();

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
      host:process.env.HOST,
      port:process.env.PORT,
  },
  optimizeDeps:{
      include: ["react-router-dom"]
  }
})

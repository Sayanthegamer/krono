import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'Timetable Creator',
        short_name: 'Timetable',
        description: 'Manage your weekly schedule',
        theme_color: '#ffffff',
        icons: [
          {
            src: 'logo.svg',
            sizes: '192x192 512x512',
            type: 'image/svg+xml'
          }
        ]
      }
    })
  ],
  build: {
    chunkSizeWarningLimit: 1000, // Increase limit to 1MB
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'firebase-vendor': ['firebase/app', 'firebase/firestore', 'firebase/auth'],
          'ui-vendor': ['framer-motion', 'lucide-react', 'date-fns']
        }
      }
    }
  }
})

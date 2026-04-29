import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/elexua-warehouse/', // Add this line here
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'ELEXUA Warehouse System',[cite: 2]
        short_name: 'ELEXUA',[cite: 2]
        description: 'Warehouse management system for inventory, orders, and returns',[cite: 2]
        theme_color: '#0f172a',[cite: 2]
        background_color: '#0f172a',[cite: 2]
        display: 'standalone',[cite: 2]
        orientation: 'any',[cite: 2]
        scope: '/',[cite: 2]
        start_url: '/',[cite: 2]
        icons: [[cite: 2]
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },[cite: 2]
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },[cite: 2]
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' }[cite: 2]
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],[cite: 2]
        runtimeCaching: [[cite: 2]
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,[cite: 2]
            handler: 'CacheFirst',[cite: 2]
            options: { cacheName: 'google-fonts-cache', expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 } }[cite: 2]
          }
        ]
      }
    })
  ]
})
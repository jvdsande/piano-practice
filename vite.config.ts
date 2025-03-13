import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/piano-practice/',
  plugins: [VitePWA({
    registerType: 'autoUpdate',
    manifest: {
      name: 'Piano',
      short_name: 'Piano',
      display: 'standalone',
      orientation: 'landscape',
      background_color: '#000000',
      theme_color: '#5C7CFA',
      icons: [
        {
          src: '/piano-practice/vite.png',
          type: 'image/png',
          sizes: 'any',
          purpose: 'maskable any'
        }
      ],
      start_url: '/piano-practice/'
    }
  })]
})

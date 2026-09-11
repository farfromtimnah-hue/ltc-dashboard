import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Serves from the root of portal.lagoinhatampa.com. Was '/ltc-dashboard/'
  // for the github.io project-site URL, which 404s every asset on the custom
  // domain — see index.html and manifest.webmanifest, which match this.
  base: '/'
})

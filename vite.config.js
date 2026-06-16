import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Change this to match your GitHub repo name exactly
// e.g. if your repo is github.com/ghopkins-rvh/ccu-sedation-pathway
// set base to '/ccu-sedation-pathway/'
export default defineConfig({
  plugins: [react()],
  base: '/ccu-sedation-pathway/',
})

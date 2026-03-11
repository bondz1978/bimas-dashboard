// nuxt.config.ts
export default defineNuxtConfig({
  devtools: { enabled: true },

  modules: ['@nuxtjs/google-fonts'],

  googleFonts: {
    families: {
      'Playfair+Display': [500, 600, 700],
      'DM+Sans': [300, 400, 500, 600],
    },
    display: 'swap',
  },

  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    public: {
      apiBase: process.env.API_BASE || 'http://localhost:3001/api',
    },
  },

  app: {
    head: {
      title: 'Dashboard Penyuluh Agama — Bimas Islam',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Dashboard Data Penyuluh Agama Bimas Islam Kementerian Agama RI' },
      ],
      link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }],
      script: [
        {
          src: 'https://cdn.tailwindcss.com',
          onload: `
            tailwind.config = {
              darkMode: ['selector', '[data-theme="dark"]'],
              theme: {
                extend: {
                  colors: {
                    cream: 'var(--cream)',
                    surface: 'var(--white)',
                    primary: 'var(--color-primary)',
                    secondary: 'var(--color-secondary)',
                    accent: 'var(--color-accent)',
                  },
                  fontFamily: {
                    display: 'var(--font-display)',
                    body: 'var(--font-body)',
                  },
                }
              }
            }
          `
        }
      ],
    },
  },
})

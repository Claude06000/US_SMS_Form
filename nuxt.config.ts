// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxtjs/color-mode',
  ],

  css: ['~/assets/css/main.css'],

  colorMode: {
    classSuffix: '',
    preference: 'light',
    fallback: 'light',
  },

  app: {
    head: {
      htmlAttrs: { lang: 'fr' },
      title: 'Enregistrement Numéro Toll-Free US — SMS',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: "Formulaire d'enregistrement pour numéro Toll-Free US pour l'envoi de SMS" },
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700;800&display=swap' },
        { rel: 'icon', type: 'image/png', href: 'https://noviamind.ai/logo.png' },
      ],
    },
  },

  runtimeConfig: {
    resendApiKey: '',
    recipientEmail: '',
    senderEmail: 'noreply@noviamind.ai',
    senderEmailName: 'NoviaMind',
  },
})

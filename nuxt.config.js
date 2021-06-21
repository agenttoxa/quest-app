module.exports = {
  debug: true,
  head: {
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { 'http-equiv': 'X-UA-Compatible', content: 'IE=edge,chrome=1' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
    ]
  },

  plugins: [
    { src: '~plugins/element-ui.js' },
    { src: '~plugins/markdown-it.js' }
  ],

  telemetry: false,

  modules: [
    [
      '@nuxtjs/axios',
      {
        prefix: '/api',
        proxy: true,
        credentials: true
      }
    ]
  ],

  build: {
    extend (config, ctx) {
      if (ctx.isClient) {
        config.module.rules.push({
          enforce: 'pre',
          test: /\.(js|vue)$/,
          loader: 'eslint-loader',
          exclude: /(node_modules)/
        })
      }
    }
  }
}

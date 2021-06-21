import express from 'express'
import apiBuild from './api'
import session from 'express-session'


/* Для API обработки изображений с помощью http запросов */
/* API для работы с ресурсами сайта */
import { Nuxt, Builder } from 'nuxt'

/* Параметры запуска веб-сервера */
const host = process.env.HOST || '127.0.0.1'
const port = process.env.PORT || 3000
const launch = process.env.LAUNCH || 'NUXT-AND-API'

if (['NUXT-AND-API', 'API'].indexOf(launch) !== -1) {
  const app = express()

  app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: false,
    cookie: { secure: true }
  }))

  app.set('port', port)

  /* Полный запуск сайта */
  if (launch === 'NUXT-AND-API') {
    let config = require('../nuxt.config.js')
    config.dev = !(process.env.NODE_ENV === 'production')
    const nuxt = new Nuxt(config)

    if (config.dev) {
      const builder = new Builder(nuxt)
      builder.build()
    }

    apiBuild(app)
    app.use(nuxt.render)
  }

  /* Слушать сервер */
  app.listen(port, host)

  console.log(`Server${launch === 'NUXT-AND-API' ? '' : '-' + launch} listening on ${host}:${port}`)
} else {
  console.log('This launch does not exist')
}

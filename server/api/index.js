/* Подключение маршрутов для работы с файлоами */

const path = require('path')
const bodyParser = require('body-parser')

// Require API routes
const teams = require('./teams')
// const products = require('./products')
const login = require('./login')

module.exports = (app) => {
  app.use(bodyParser.json())
  app.use(bodyParser.urlencoded({ extended: true }))

  // Import API Routes
  app.use('/api', teams)
  // app.use('/api', products)
  app.use('/api', login)

  /* app.use('/.well-known/acme-challenge/UmNmktNBdEWB6LU3glcqwKKhCKMtBx9A6fDiF4-DRoI', (req, res, next) => {
    var options = {
      root: path.join(__dirname, './../../static'),
      dotfiles: 'deny',
      headers: {
        'x-timestamp': Date.now(),
        'x-sent': true
      }
    }
    var fileName = 'UmNmktNBdEWB6LU3glcqwKKhCKMtBx9A6fDiF4-DRoI'
    res.sendFile(fileName, options, function (err) {
      if (err) {
        next(err)
      } else {
        console.log('Sent:', fileName)
      }
    })
  }) */
}

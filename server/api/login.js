const { Router } = require('express')
const path = require('path')
const fs = require('fs')

const router = new Router()

router.post('/login', async (req, res, next) => {
  const name = req.body.name
  const pwd = req.body.pwd

  const filePath = path.join(__dirname, './../data/users.json')
  let users = JSON.parse(fs.readFileSync(filePath))

  const user = users.find(({ username }) => {
    return username === name
  })

  if (user) {
    if (user.password === pwd) {
      res.json({
        status: 200,
        message: 'All right!'
      })
    } else {
      res.json({
        status: 500,
        message: 'Password is invalid'
      })
    }
  } else {
    res.json({
      status: 500,
      message: 'User not found'
    })
  }
})

module.exports = router

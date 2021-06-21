const { Router } = require('express')
const path = require('path')
const fs = require('fs')

const router = new Router()

router.get('/allTeams', async (req, res, next) => {
  const filePath = path.join(__dirname, './../data/teams.json')
  let fileTeams = JSON.parse(fs.readFileSync(filePath))

  return res.json(fileTeams)
})
router.post('/addTeam', async (req, res, next) => {
  const filePath = path.join(__dirname, './../data/teams.json')
  let fileTeams = JSON.parse(fs.readFileSync(filePath))

  try {
    const team = fileTeams.find(({ pin }) => pin === req.body.pin)
    if (team) {
      return res.json({
        err: 'Команда с таким Паролем существует!'
      })
    } else {
      fileTeams.push(req.body)
      await fs.writeFileSync(filePath, JSON.stringify(fileTeams, null, '  '))
      return res.json({
        status: 200
      })
    }
  } catch (err) {
    return res.json({
      err: err
    })
  }
})

router.get('/team', async (req, res, next) => {
  const userPin = req.query.userPin
  const filePath = path.join(__dirname, './../data/teams.json')
  let fileTeams = JSON.parse(fs.readFileSync(filePath))

  if (fileTeams) {
    const team = fileTeams.find(({ pin }) => pin === userPin)
    if (team) {
      if (team.level === -1) {
        var updatedTeam = await levelUp(team)
        return res.json({
          status: 200,
          message: "Команда найдена",
          data: updatedTeam
        })
      } else {
        return res.json({
          status: 200,
          message: "Команда найдена",
          data: team
        })
      }
    } else {
      return res.json({
        status: 400,
        message: "Комманда не найдена"
      })
    }
  } else {
    return res.json({
      status: 500,
      message: "Проблемы с файлом teams.json"
    })
  }
})

router.post('/level', async (req, res, next) => {
  let teamId = parseInt(req.body.teamId)

  const filePathTeams = path.join(__dirname, './../data/teams.json')
  let fileTeams = JSON.parse(fs.readFileSync(filePathTeams))

  let team = fileTeams.find(({ id }) => id === teamId)

  if (!team) {
    return res.json({
      status: 500,
      message: 'Команда не найдена'
    })
  }

  try {
    // разрешение выдать первую или вторую подсказку
    let canHint1 = false
    let canHint2 = false
    const filePath = path.join(__dirname, './../data/levels.json')
    let fileLevels = JSON.parse(fs.readFileSync(filePath))

    if (team.progress[team.level]) {
      let now = new Date().getTime()
      let levelStart = new Date(team.progress[team.level].start).getTime()
      let distance = now - levelStart

      if (distance > 60 * 60 * 1000) {
        team = await levelUp(team)
      }

    } else {
      team.progress.push({
        start: Date.now(),
        deadline: Date.now() + 3600000,
        finish: null,
        findCodes: [],
        writeCodes: [],
        spoiler: false
      })

      await updateTeam(team)
    }

    let level = await fileLevels.find(({ id }) => id === team.level)

    //TODO::Оформить ошибку на фронте
    if (!level) {
      return res.json({
        status: 200,
        data: [],
        team: team,
        questIsEnd: true
      })
    }


    level.start = team.progress[team.level].start

    let now = new Date().getTime()
    let levelStart = new Date(level.start).getTime()
    let distance = now - levelStart

    if (distance > 10 * 60 * 1000) {
      canHint1 = true
    }

    if (distance > 20 * 60 * 1000) {
      canHint2 = true
    }

    return res.json({
      status: 200,
      data: {
        title: level.title,
        content: level.content,
        spoiler: team.progress[team.level].spoiler ? level.spoiler.text : null,
        countCodes: level.trueCodes.length,
        start: level.start,
        hint1: canHint1 ? level.hint1 : null,
        hint2: canHint2 ? level.hint2 : null
      },
      team: team
    })
  } catch (err) {
    return res.json({
      status: 500,
      err: err
    })
  }
})

router.post('/checkCode', async (req, res, next) => {
  let code = req.body.code

  if (code === undefined) {
    return res.json({
      status: 500,
      message: 'Code is undefined'
    })
  }

  if (code === 'exit777') {
    return res.json({
      status: 200,
      message: 'exit'
    })
  }

  try {
    const filePathTeams = path.join(__dirname, './../data/teams.json')
    let fileTeams = JSON.parse(fs.readFileSync(filePathTeams))

    const filePathLevels = path.join(__dirname, './../data/levels.json')
    let fileLevels = JSON.parse(fs.readFileSync(filePathLevels))

    let team = await fileTeams.find(({ id }) => id === req.body.teamId)

    let level = await fileLevels.find(({ id }) => id === team.level)

    code = code.trim().toLowerCase()
    code = code.replace(/ /g, '')
    team.progress[team.level].writeCodes.push(code)

    if (level.trueCodes.indexOf(code) === -1) {
      await fs.writeFileSync(filePathTeams, JSON.stringify(fileTeams, null, '  '))
      return res.json({
        status: 201,
        message: 'Неверный код'
      })
    } else {
      if (team.progress[team.level].findCodes.indexOf(code) > -1) {
        await fs.writeFileSync(filePathTeams, JSON.stringify(fileTeams, null, '  '))
        return res.json({
          status: 201,
          message: 'Код уже был введён'
        })
      } else {
        team.progress[team.level].findCodes.push(code)
        if (team.progress[team.level].findCodes.length === level.trueCodes.length) {
          team.progress[team.level].finish = Date.now()
          team = await levelUp(team)
          await fs.writeFileSync(filePathTeams, JSON.stringify(fileTeams, null, '  '))
          return res.json({
            status: 200,
            message: 'Последний код'
          })
        } else {
          await fs.writeFileSync(filePathTeams, JSON.stringify(fileTeams, null, '  '))

          return res.json({
            status: 200,
            code: code,
            message: 'Верный код!'
          })
        }
      }
    }


  } catch (err) {
    return res.json({
      status: 500,
      message: err.message ? err.message : 'Произошла ошибка на сервере',
      errors: err
    })
  }

  return res.json({
    status: 200
  })
})

router.post('/checkSpoiler', async (req, res, next) => {
  let code = req.body.code

  if (code === undefined) {
    return res.json({
      status: 500,
      message: 'Code is undefined'
    })
  }

  try {
    const filePathTeams = path.join(__dirname, './../data/teams.json')
    let fileTeams = JSON.parse(fs.readFileSync(filePathTeams))

    const filePathLevels = path.join(__dirname, './../data/levels.json')
    let fileLevels = JSON.parse(fs.readFileSync(filePathLevels))

    let team = await fileTeams.find(({ id }) => id === req.body.teamId)

    let level = await fileLevels.find(({ id }) => id === team.level)

    code = code.trim().toLowerCase()
    code = code.replace(/ /g, '')
    team.progress[team.level].writeCodes.push(code)

    if (level.spoiler.answers.indexOf(code) === -1) {
      await fs.writeFileSync(filePathTeams, JSON.stringify(fileTeams, null, '  '))
      return res.json({
        status: 201,
        message: 'Неверный код'
      })
    } else {
        team.progress[team.level].spoiler = true
        await fs.writeFileSync(filePathTeams, JSON.stringify(fileTeams, null, '  '))

        return res.json({
          status: 200,
          message: 'Верный код!'
        })
      }
  } catch (err) {
    return res.json({
      status: 500,
      message: err.message ? err.message : 'Произошла ошибка на сервере',
      errors: err
    })
  }
})

const levelUp = async (team) => {
  team.level++
  const startTime = Date.now()

  if (!team.progress[team.level]) {
    team.progress.push({
      start: Date.now(),
      deadline: Date.now() + 3600000,
      finish: null,
      findCodes: [],
      writeCodes: [],
      spoiler: false
    })
  }

  await updateTeam(team)

  return team
}

const updateTeam = (team) => {
  const teamId = team.id

  const filePath = path.join(__dirname, './../data/teams.json')
  let fileTeams = JSON.parse(fs.readFileSync(filePath))
  const foundTeam = fileTeams.find(({id}) => id === teamId)

  fileTeams[fileTeams.indexOf(foundTeam)] = team

  return fs.writeFileSync(filePath, JSON.stringify(fileTeams, null, '  '))
}

module.exports = router
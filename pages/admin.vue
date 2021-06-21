<template lang="pug">
  .page-admin
    .page-admin__container
      .page-admin__login(v-if="!isLogin")
        el-form(ref="loginForm" :model="loginData"  :rules="loginRules")
          el-form-item(label="Логин" prop="username")
            el-input(ref="username" v-model="loginData.username")
          el-form-item(label="Пароль" prop="password")
            el-input(ref="password" v-model="loginData.password")
          el-button(@click="login") Войти

      el-row(v-else)
        el-col(:span="8" style="padding-right: 1rem;")
          h4 Команды
          el-menu(
            v-if="teams && teams.length"
            :default-active="0"
            @select="handleSelect"
          )
            el-menu-item(
              v-for="(team, indexTeam) in teams" :key="indexTeam"
              :index="indexTeam"
            ) {{ team.name }} :
              span.page-admin__level-title  Уровень {{ team.level + 1 }}
            .page-admin__add(@click="addTeamActive = true") Добавить команду

        el-col(:span="16")
          .page-admin__content(v-if="teams.length && teams[activeMenuItem]")
            h4 Лог команды

            .page-admin__content-level(v-for="(level, lIndex) in teams[activeMenuItem].progress")
              .page-admin__content-title Уровень {{ lIndex }}
              .page-admin__content-subtitle Начало уровня: {{ getTime(level.start) }}
              .page-admin__content-codes
                .page-admin__content-code(
                  v-for="(code, codeIndex) in level.writeCodes" :key="codeIndex"
                  :class="level.findCodes.indexOf(code) > -1 ? 'page-admin__content-code--right': ''"
                ) {{ code }}
              .page-admin__content-subtitle Конец уровня: {{ getTime(level.finish) }}
              .page-admin__content-subtitle Уровень пройден за {{ getDistance(level.finish - level.start) }}

    .page-admin__addTeam(v-if="addTeamActive")
      .page-admin__addTeam-container
        el-form(ref="addTeam" :model="addTeamData")
          el-form-item(label="Имя")
            el-input(v-model="addTeamData.name")
          el-form-item(label="Пароль")
            el-input(v-model="addTeamData.pin")
          el-button(@click="addTeam") Добавить
          el-button(@click="addTeamActive = false") Отмена
</template>

<script>
  import ElNotification from 'element-ui/lib/notification'
  import 'element-ui/lib/theme-chalk/index.css'

  export default {
    name: 'admin',

    data () {
      const com = this
      return {
        isLogin: false,

        teams: [],
        activeMenuItem: 0,

        loginData: {
          username: '',
          password: ''
        },

        addTeamActive: false,

        addTeamData: {
          name: '',
          pin: ''
        },

        loginRules: {
          username: [
            { required: true, message: 'Поле обязательное для заполнения', trigger: 'blur' },
            {
              validator (rule, value, callback, source, options) {
                let errors = []

                if (!/^[a-z0-9_-]+$/i.test(value)) {
                  errors.push(
                    new Error('Логин содержит не верные символы')
                  )
                }

                callback(errors)
              },
              trigger: 'blur'
            },
            { min: 3, max: 20, message: 'Длина от 3 до 20 символов', trigger: 'blur' }
          ],
          password: [
            { required: true, message: 'Поле обязательное для заполнения', trigger: 'blur' }
          ]
        }
      }
    },

    methods: {
      async login () {
        const valid = await this.$refs.loginForm.validate()
        const com = this

        if (valid) {
          this.$axios.$post('/login', {
            name: this.loginData.username,
            pwd: this.loginData.password
          }).then(res => {
            if (res.status === 200) {
              com.isLogin = true

              if (localStorage) {
                localStorage.isLogin = 1
                com.isLogin = true
              }

              ElNotification({
                title: 'Успешно',
                message: 'Авторизация пройдена',
                type: 'success'
              })
            } else if (res.message === 'Password is invalid') {
              ElNotification({
                title: 'Ошибка',
                message: 'Неверный пароль!',
                type: 'error'
              })
            } else if (res.message === 'User not found') {
              ElNotification({
                title: 'Ошибка',
                message: 'Пользователь не найден!',
                type: 'error'
              })
            } else {
              ElNotification({
                title: 'Ошибка',
                message: 'Неизвестная ошибка!',
                type: 'error'
              })
            }
          })
        }
      },

      handleSelect (key, keyPath) {
        this.activeMenuItem = key
      },

      getTime (num) {
        let date = new Date(num)
        return `${date.getHours()} : ${date.getMinutes()} : ${date.getSeconds()}`
      },

      getDistance (distance) {
        let minOnLevel = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
        let secOnLevel = Math.floor((distance % (1000 * 60)) / (1000))
        return `${minOnLevel} : ${secOnLevel}`
      },

      addTeam () {
        const com = this
        let team = {
          id: com.teams[com.teams.length - 1].id + 1,
          pin: com.addTeamData.pin,
          name: com.addTeamData.name,
          level: 0,
          progress: []
        }

        this.$axios.$post('/addTeam', team).then(res => {
          if (res.status === 200) {
            ElNotification({
              title: 'Успешно',
              message: 'Команда добавлена',
              type: 'success'
            })
            com.addTeamActive = false
          } else {
            ElNotification({
              title: 'Ошибка',
              message: res.err,
              type: 'error'
            })
          }
        })
      }
    },

    async mounted () {
      if (localStorage && localStorage.isLogin) {
        this.isLogin = parseInt(localStorage.isLogin)
      }

      this.teams = await this.$axios.$get('/allTeams')
      const com = this
      setInterval(async () => {
        await this.$axios.$get('/allTeams').then(res => {
          com.teams = res
        })
      }, 5000)
    }
  }
</script>

<style lang="sass">
  .page-admin
    &__container
      width: 900px
      margin: auto

    h4
      font-family: 'sans-serif'
      font-weight: normal

    .el-collapse-item__header
      font-size: 1.2rem
      font-family: 'sans-serif'
      &.is-active
        color: #ffbb29

    img
      max-width: 100%

    input, textarea
      margin-bottom: 0

    &__content-level
      background-color: rgba(173, 255, 47, 0.42)
      border-radius: 15px
      padding: 1rem
      font-size: 1.2rem
      margin-top: 1.5rem
    &__content-title
      font-size: 1.4rem
    &__content-codes
      display: flex
      flex-wrap: wrap
    &__content-subtitle
      color: #9a00009c
      font-weight: bold
      font-size: .9rem
      margin: 1rem 0
    &__content-code
      margin: 0 1.5rem
      &--right
        color: orange

    &__add
      width: 100%
      padding: 10px 5px
      cursor: pointer

      &:hover
        color: green

    &__addTeam
      width: 100%
      height: 100vh
      left: 0
      top: 0
      background: rgba(0, 0, 0, 0.76)
      display: flex
      align-items: center
      justify-content: center
      position: fixed
      &-container
        width: 600px
</style>
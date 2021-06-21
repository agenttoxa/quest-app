<template lang="pug">
  .main-page
    .main-page-header
      .main-page-header--text Рождественский квест

    .main-page-body(v-if="isLoaded")
      .main-page-body__login(v-if="!isLogin")
        .main-page-body__text Пожалуйста, ведите пин-код вашей команды для регестрации:
        el-input(v-model="userPin")
        el-button.site-button(@click="login" type="primary") Зарегистрироваться
        .main-page-body__error {{ error }}

      template(v-else)
        .main-page-body__game(v-if="questIsEnd")
          .main-page-body__title Квест завершён
        template(v-else)
          .main-page-body__main-field
            .main-page-body__title(
              style="font-family: db20; font-weight: normal; font-size: 1.1rem; color: black"
            ) Поле для ввода кодов
            .main-page-body__input
              el-input(v-model="inputCode")
                el-button(slot="append" @click="checkCode") ОK
            .main-page-body__message(:style="{ color: colorMessage }") {{ message }}

          .main-page-body__line-img

          .main-page__timers
            timer(text="Время на уровне" :min="minOnLevel" :sec="secOnLevel")
          site-progress(
            :find-codes="team.progress[team.level].findCodes"
            :count="level.countCodes"
          )

          .main-page__hint(v-if="level.hint1")
            .main-page__hint-title Подсказка 1
            .main-page__hint-text(v-html="$md.markdownExtra(level.hint1)")

          .main-page__hint(v-if="level.hint2")
            .main-page__hint-title Подсказка 2
            .main-page__hint-text(v-html="$md.markdownExtra(level.hint2)")

          .main-page-body__game
            .main-page-body__title(
              v-if="level && level.title"
              style="font-family: lemon;"
            ) Команда {{ team.name }}
            .main-page-body__title(
              v-if="level && level.title"
              style="font-family: db20;"
            ) {{ level.title }}
            .main-page-body__content(v-if="level && level.content")
              .main-page-body__item(v-for="(item, index) in level.content" :key="index")
                .main-page-body__text(v-if="item.type === 'text'" v-html="$md.markdownExtra(item.data)")
                .main-page-body__img(v-if="item.type === 'img'")
                  img(:src="item.path")

            .main-page__svitok(v-if="!svitokOpened")
              .main-page-body__title Поле ввода для раскрытия свитка:
              .main-page-body__input
                el-input(v-model="inputSpoiler")
                  el-button(slot="append" @click="checkSpoiler") ОK
              .main-page-body__message(:style="{ color: colorMessage }") {{ message }}
            Svitok(:openned="svitokOpened" :content="level.spoiler")
    .main-page-load(v-else) Идёт загрузка...
</template>

<script>
  import ElInput from 'element-ui/lib/input'
  import ElButton from 'element-ui/lib/button'
  import Svitok from './../components/svitok.vue'
  import Timer from './../components/timer.vue'
  import SiteProgress from './../components/progress.vue'
  import 'element-ui/lib/theme-chalk/index.css'

  export default {
    name: 'main-page',

    data () {
      return {
        userPin: '',
        team: null,
        error: '',
        level: null,
        svitokOpened: false,
        isLogin: false,
        isLoaded: false,
        inputCode: '',
        inputSpoiler: '',
        message: '',
        colorMessage: 'black',
        minOnLevel: 0,
        secOnLevel: 0,
        questIsEnd: false
      }
    },

    methods: {
      login () {
        const com = this
        this.$axios.$get(`/team?userPin=${this.userPin}`).then(res => {
          if (res.message === 'Команда найдена') {
            if (localStorage) {
              localStorage.isLogin = 1
              localStorage.teamId = res.data.id
              com.isLogin = true
            }
            com.$axios.$post('/level', {teamId: res.data.id}).then(resLevel => {
              if (resLevel.status === 200) {
                com.level = resLevel.data
                com.team = resLevel.team
                com.svitokOpened = com.level.spoiler ? true : false
                /* Получить переменную флаг, что квест завершён, если это так */
                com.questIsEnd = resLevel.questIsEnd

                if (window) {
                  window.location.reload()
                }
              }
            })
          } else {
            this.error = res.message
          }
        })
      },

      checkCode () {
        const com = this
        this.$axios.$post('/checkCode', {code: this.inputCode, teamId: this.team.id}).then((res) => {
          if (res.message === 'exit') {
            this.logout()
          }
          if (res.status === 200) {
            this.colorMessage = 'green'
            this.inputCode = ''

            if (res.code) {
              com.team.progress[com.team.level].findCodes.push(res.code)
            }

            if (res.message === 'Последний код') {
              if (window) {
                window.location.reload()
              }
            }
          }
          if (res.status === 201) {
            this.colorMessage = 'red'
          }
          this.message = res.message
        })
      },

      checkSpoiler () {
        this.$axios.$post('/checkSpoiler', {code: this.inputSpoiler, teamId: this.team.id}).then((res) => {
          if (res.status === 200) {
            this.colorMessage = 'green'
            this.inputSpoiler = ''

            if (window) {
              window.location.reload()
            }
          }
          if (res.status === 201) {
            this.colorMessage = 'red'
          }
          this.message = res.message
        })
      },

      logout () {
        localStorage.isLogin = 0
        localStorage.teamId = -1
      }
    },

    mounted () {
      const com = this

      if (localStorage && localStorage.isLogin && localStorage.teamId) {
        this.isLogin = parseInt(localStorage.isLogin)
        this.$axios.$post('/level', {teamId: localStorage.teamId}).then(resLevel => {
          if (resLevel.status === 200) {
            com.level = resLevel.data
            com.team = resLevel.team
            com.svitokOpened = com.level.spoiler ? true : false
            /* Получить переменную флаг, что квест завершён, если это так */
            com.questIsEnd = resLevel.questIsEnd ? resLevel.questIsEnd : false

            if (resLevel.questIsEnd) {
              if (localStorage) {
                localStorage.isLogin = 0
              }
            }

            setInterval(() => {
              var start = new Date(com.level.start).getTime()
              var now = new Date().getTime()
              var distance = now - start
              com.minOnLevel = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
              com.secOnLevel = Math.floor((distance % (1000 * 60)) / (1000))
              if ((com.minOnLevel == 10 || com.minOnLevel == 20 || com.minOnLevel == 60) && com.secOnLevel == 0 ) {
                window.location.reload()
              }
            }, 1000)
          } else {
            com.isLogin = false
            if (localStorage) {
              localStorage.isLogin = 0
            }
          }
          this.isLoaded = true
        })
      } else {
        this.isLoaded = true
      }
    },

    components: {
      ElInput,
      ElButton,
      Svitok,
      SiteProgress,
      Timer
    }
  }
</script>

<style lang="sass">
  @font-face
    font-family: 'db20'
    src: url('./../assets/fonts/db20.otf')
    src: local('db20') url('./../assets/fonts/db20.otf') format('embedded-opentype')
    font-weight: normal
    font-style: normal
  @font-face
    font-family: 'lemon'
    src: url('./../assets/fonts/lemon.ttf')
    src: local('lemon') url('./../assets/fonts/lemon.ttf') format('truetype')
    font-weight: normal
    font-style: normal
  .main-page
    max-width: 500px
    margin: auto

    &__hint
      border: 1px solid #8E8E27
      border-radius: 10px
      padding: 8px
      background: #474710
      color: white
      width: 95%
      margin: 1rem auto
      &-text
        font-family: helvetica
      &-title
        font-weight: bold
        font-family: lemon
        text-align: center
        text-decoration: underline
    &-header
      width: 100%
      height: 5rem
      background-color: #474710
      color: white
      justify-content: center
      display: flex
      align-items: center

      &--text
        font-family: db20
        font-size: 1.2rem
        font-weight: bold
        text-align: center

    &-body__game, &-body__login
      padding: 2rem 1rem 0
    &-body
      background: #7971de0d
      background-image: url(/bg-4.jpg)

      &__content
        background: #89c91357
        border-radius: 10px
        font-family: helvetica
        padding: 5px

      &__line-img
        width: 100%
        height: 60px
        background: url('/img-3.png')
        background-size: contain
        background-position: center
        position: relative
        top: -15px
        margin-bottom: -15px

    &-body, &-load

      img
        max-width: 100%

      &__main-field
        width: 100%
        height: 125px
        background-repeat: no-repeat
        background-size: cover
        background-position: center
        // background-image: url('/bg-5.jpg')
        color: #474710
        padding: 1.5rem 1rem 0

      &__title
        font-family: helvetica
        font-weight: bold
        margin-bottom: .5rem
        text-align: center

      &__login
        width: 100%
        display: flex
        flex-direction: column

      &__text
        font-size: 1rem
        margin-bottom: 1rem

    .el-input
      font-size: 1.2rem

      &-group__append
        cursor: pointer
        background-color: #6a3317
        color: white
        padding: 0

        &:hover
          background-color: rgba(106, 51, 23, 0.92)

        .el-button
          margin: auto
          padding: 0
          height: 38px
          width: 100px
          display: block
          font-family: lemon

    .site-button.el-button
      margin: 1.5rem auto
      font-size: 1.2rem

    &__svitok
      .el-input__inner
        &:focus
          border-color: #e6c68d

    &__timers
      display: flex
      justify-content: space-between
      width: 100%
</style>
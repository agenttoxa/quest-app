// todo: Пример подключения плагина другой библиотеки https://github.com/nuxt-community/modules/blob/master/packages/vuetify/index.js
import Vue from 'vue'
import ElementUI from 'element-ui'
import ElLangRU from 'element-ui/lib/locale/lang/ru-RU'
import ElLocale from 'element-ui/lib/locale/index'

export default () => {
  /* Подключаем локализацию на русском языке у Element-UI компонентов */
  ElLocale.use(ElLangRU)

  Vue.use(ElementUI)
}

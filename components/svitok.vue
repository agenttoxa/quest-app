<template lang="pug">
  .svitok
    .svitok-top
    .svitok-body(:style="{ height: height }")
      .svitok__content(v-html="$md.markdownExtra(content)")
    .svitok-bottom(v-if="openned")

</template>

<script>
  export default {
    name: 'svitok',

    props: {
      openned: false,

      content: ''
    },

    computed: {
      height () {
        return !this.openned ? '0px' : 'auto'
      }
    }
  }
</script>

<style lang="sass">
  .svitok
    width: 100%

    &-top, &-bottom
      background-image: url('/svitok.png')
      width: 104%
      height: 40px
      background-repeat: no-repeat
      background-position: center
      background-size: cover
      position: relative
      top: 14px
      right: 8px

    &-bottom
      transform: rotate(180deg)
      top: -14px

    img
      max-width: 100%
      max-width: 400px

    &-body
      background-color: #e6c289
      transition: all .3s ease

    &__content
      padding: 1rem
</style>
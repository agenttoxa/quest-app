<template lang="pug">
  .site-timer
    .site-timer__time {{ min }} : {{ sec }}
</template>

<script>
  export default {
    name: 'site-timer',

    props: {
      text: String,

      min: Number,

      sec: Number
    }
  }
</script>

<style lang="sass">
  .site-timer
    width: 100%
    border-radius: 5px
    text-align: center
    margin-bottom: 1.5rem

    &__text
      font-size: 1rem

    &__time
      font-size: 2.5rem
      font-family: lemon
      color: #474710
      font-weight: bold
</style>
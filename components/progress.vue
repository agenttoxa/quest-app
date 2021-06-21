<template lang="pug">
  .site-progress
    .site-progress__title Оставшиеся коды
    .site-progress__codes(v-if="findCodes")
      .site-progress__code.site-progress__code--found(v-for="code in findCodes") {{ code }}
      .site-progress__code.site-progress__code--not(v-for="i in count - findCodes.length") ?
</template>

<script>
  export default {
    name: 'site-progress',

    props: {
      findCodes: Array,
      count: Number
    }
  }
</script>

<style lang="sass">
  .site-progress
    height: 100%
    &__title
      font-family: lemon
      text-align: center
      font-size: 1.2rem
      font-weight: bold
    &__codes
      display: flex
      flex-wrap: wrap
      justify-content: space-evenly
    &__code
      width: 100px
      height: 75px
      margin: 0 .5rem
      background-size: contain
      background-position: center
      background-repeat: no-repeat
      display: flex
      justify-content: center
      align-items: center
      font-size: 1.2rem
      font-weight: bold
      color: #000000
      text-align: center
      &--not
        background-image: url('/code.png')
        font-family: lemon
        font-size: 2rem
      &--found
        background-image: url('/code.png')
</style>
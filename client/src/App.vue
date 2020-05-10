<template>
  <div id="app">

    <router-view />
  </div>
</template>

<script>
  import headerComponent from './components/HeaderComponent'

  export default {
    name: 'app',
    data () {
      return {

      }
    },
    components: {
      headerComponent
    }
}
</script>

<style lang="scss">
  body {
    margin: 0;
  }
</style>

<template>
  <v-app>
    <div id="app">
      <b-container>
        <h1>
          <small>
            geo
          </small>
        </h1>
        <router-view style="z-index: 10;"/>
      </b-container>

    </div>
  </v-app>
</template>

<script>

  export default {
    name: 'App'
  }
</script>

<style>
  #app {
    background-image: radial-gradient(rgba(255, 255, 255, 0.51), rgba(140, 245, 255, 0.51) ),
      url('../back.jpeg');
    background-repeat: round;
  }
</style>

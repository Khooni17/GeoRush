<template>
  <div class="container">
    <div class="head"></div>
    <div class="mid"></div>
<!--    <chat class="chat"></chat>-->
  </div>
</template>

<script>
  import chat from './chat'

  export default {
    name: "GameComponent",

    components: {
      chat
    }
  }


</script>

<style lang="scss" scoped>
  $black : #000;
  $gray : #202020a8;

  .container {
    height: 100vh;
    width: 100vw;
    padding: 0;
    margin: 0;
    background-color: $black;
    -moz-user-select: none;
    -webkit-user-select: none;

    .head {
      height: 100%;
      background-color: $gray;
      clip-path: polygon(50% 0%, 100% 0, 100% 54%, 17% 39%, 0 61%, 0 0);
    }

    .chat {
      position: absolute;
      top: 20%;
      right: 5%;

    }
  }
</style>

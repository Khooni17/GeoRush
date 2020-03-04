<template>
    <div class="container">
      <button class="start_play">Играть!</button>
      <div class="head"></div>
      <chat class="chat"></chat>
    </div>
</template>

<script>
  import chat from './chat';

    export default {
      name: "StartComponent",
      data(){
        return {
          login : 'w'
        }
      },
      components:{
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
    -khtml-user-select: none;
    user-select: none;

    .start_play {
      position: absolute;
      z-index: 110;
      left: 13%;
      top: 45%;
      cursor: pointer;
      padding: 27px 50px;
      background-color: #00caca;
      border: none;
      border-radius: 15px;
      color: #dddddd;
      font-size: 1.4em;
      text-shadow: #000 1px 1px;
      clip-path: polygon(26% 19%, 27% 19%, 100% 48%, 0 73%);

      &:hover {
        background-color: aqua;
      }

      &:focus {
        outline: none !important;
      }

      &:active{
        border: none;
        transform: scale(0.97);
      }
    }

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

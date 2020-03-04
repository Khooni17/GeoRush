<template>
    <div class="header">
      <div class="header-cont">
        <a class="logo">logo</a>
        <a class="button-head profile_head" v-if="login">My Profile</a>
        <a class="button-head login_button" v-if="!login">Логин</a>
        <a class="button-head reginster_button" v-if="!login">Регистрация</a>
      </div>
    </div>
</template>

<script>

    export default {
        name: "HeaderComponent"
    }

</script>

<style lang="scss" scoped>
  .header {
    height: 70px;
    width: 100vw;
    position: absolute;
    z-index: 1000;
    top: 0;
    -moz-user-select: none;
    -khtml-user-select: none;
    user-select: none;


    .header-cont {
      width: 960px;
      height: 100%;
      margin: 0 auto;
      display: flex;

      .logo {
        color: white;
      }

      .button-head {
        //background-color: #242323;
        padding: 5px 10px;
        font-size: 1.2em;
        color: #00caca;
        //border: 1px solid blue;
        position: absolute;
        top: 30%;
        cursor: pointer;

        &:hover {
          background-color: #242323;
        }

        &:active {
          transform: scale(0.97);
        }
      }

      .login_button {
        right: 10%;
      }

      .reginster_button {
        right: 17%;
      }

      .profile_head {
        right: 15%;
      }
    }


  }
</style>

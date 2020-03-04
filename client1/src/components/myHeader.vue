
<template>
  <div class="header-cont">
    <div class="header">
      <div class="logo">
        <a href="http://localhost:8080/">
          <div class="logo-shadow">
            <img class="logo-photo" src="https://www.iconspng.com/uploads/kawaii-earth/kawaii-earth.png" alt="logo">
          </div>
        </a>
      </div>
      <div class="profile" @click="showSubMenuProfile = !showSubMenuProfile">
        <div class="avatar"><img src=""></div>
        <span style="margin-left: .5vw" class="name">{{profileID}}   <i class="fas fa-caret-down"></i></span>
        <transition name="profile-sub-menu">
          <ul v-if="showSubMenuProfile">
            <li>
              <a href="">Войти</a>
            </li>
            <hr>
            <li>
              <a href="">Посмотреть профиль</a>
            </li>
            <li>
              <a href="">Статистика</a>
            </li>
          </ul>
        </transition>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        profileID: null,
        showSubMenuProfile: false
      }
    },
    sockets: {
      connect() {
        this.profileID = this.$socket.id;
      }
    },
    name: "myHeader"
  }
</script>

<style scoped>
  .header {
    position: relative;
    height: 8vh;
    width: 90vw;
    z-index: 50;
    #background: #017410;
    border: 3px solid #017410;
    margin-bottom: 1.5vh;
    margin-top: .5vh;
    border-bottom-left-radius: 2vh;
    border-bottom-right-radius: 2vh;
  }

  .logo {
    position: absolute;
    left: 3%;
    top: 58%;
    transform: translateY(-50%);
    width: 17vh;
    height: 17vh;
  }

  .logo-shadow {
    position: absolute;
    border-radius: 50%;
    height: 17vh;
    width: 17vh;
    box-shadow: rgba(0, 0, 0, 0.6) -3px 3px 5px;
    overflow: hidden;
  }

  .logo-shadow > img {
    margin: -4vh;
    clip: rect(1vh, 17vw, 21vh, 1vw);
    padding: 0;
    width: 25vh;
    transform: rotate(33deg);
    pointer-events: none;
    user-select: none;
  }

  .profile {
    line-height: 2;
    user-select: none;
    cursor: pointer;
    color: #d6d6d6;
    position: absolute;
    right: 0;
    top: 50%;
    margin-right: 2vw;
    transform: translateY(-50%);
    z-index: 20;
    border-radius: 2vw;
  }

  .profile:hover {
    background: aliceblue;

  }

  .profile > ul {
    position: absolute;
    background-color: #fff;
    width: 100%;
    border: solid 1px rgba(0, 0, 0, 0.26);
    list-style-type: none;
  }

  .profile > ul > li {
    padding: 1vh 1vw;
  }

  .profile > ul > li:hover {
    background-color: rgba(0, 0, 0, 0.06);
  }

  .profile > ul > li > a:hover {
    text-decoration: none;
  }

  .avatar {
    width: 2vw;
    height: 2vw;
    border-radius: 50%;
    overflow: hidden;
    float: left;

  }

  .avatar > img {
    width: 100%;
  }

  .profile-sub-menu-enter-active {
    animation: profile-sub-menu-enter 0.15s;

  }

  .profile-sub-menu-leave-active {
    animation: profile-sub-menu-leave 0.15s;
  }

  @keyframes profile-sub-menu-enter {
    0% {
      opacity: 0;
      transform: translateY(5vh);

    }

    100% {
      opacity: 1;
      color: red;
    }
  }

  @keyframes profile-sub-menu-leave {
    0% {
    }

    100% {
      opacity: 0;
      transform: translateY(5vh);
    }
  }

</style>

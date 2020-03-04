<template>

  <div
    class="container"
    @mouseover="show"
    @mouseleave="unshow"
  >
    <transition name="fluidly">
      <div
        v-if="showButton"
        class="back">

      </div>
    </transition>
    <span>{{ lobbyID }}</span>
    <span>{{ `${new Date(lobbyInfo.date).getHours()}:${new Date(lobbyInfo.date).getMinutes()}`}}</span>
    <span>
      already connected: {{ players.length }} / {{ lobbyInfo.countPlayers }}
    </span>

    <transition name="fluidly">
      <button v-if="showButton"
        class="btn"
        @click="connectToLobby"
      > connect </button>
    </transition>
  </div>
</template>

<script>
  import _ from 'lodash';

  export default {
    props: ['lobbyID', 'players', 'lobbyInfo'],
    name: "lobbyPreview",
    data(){
      return {
        users: [],
        showButton: false
      }
    },
    sockets: {

      // подключение (тут редирект и передача данных в лобби)
      connectSuccess(lobbyInfo){
        ///  ! тут поменять (тупая проверка на ID)
        if(lobbyInfo.UserID === this.$socket.id){
          this.$router.push({
            name: 'lobby',
            params: {
              lobbyID: lobbyInfo.lobbyID,
              lobbyInfo
            }
          });
        }
      },
    },

    mounted () {
      //  запрос на людей находящихся в комнате
      this.$socket.emit('getCountPeopleInLobby', this.lobbyID);
    },
    methods: {
      connectToLobby(){
        this.$socket.emit('connectLobby', this.lobbyInfo);
      },
      show() {
        console.log('show');

          this.showButton = true;

      },
      unshow() {
        this.showButton = false;
      }
    }
  }
</script>

<style scoped>

  .container {
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: space-around;
    align-items: center;
    background-color: #fff;
    height: 10vh;
    margin: 2vh 0;
    position: relative;
    border-radius: .5em;
  }


  .btn {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translateY(-50%) translateX(-50%);
    width: 25%;
    height: 55%;
    border-radius: 1.5vw;
    outline:none;
    display: inline-block;
    margin-bottom: 0;
    font-size: .8em;
    font-weight: normal;
    line-height: 1.42857143;
    text-align: center;
    white-space: nowrap;
    vertical-align: middle;
    -ms-touch-action: manipulation;
    touch-action: manipulation;
    cursor: pointer;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    background-image: none;
    border: 1px solid transparent;

    background-color: #086330;
    color: #fff;
  }

  .back {
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.31);
    position: absolute;
    left: 0;
    top: 0;
    transition: 1s;
  }


  .fluidly-enter-active {
    animation: fluidly-enter .4s;
  }

  .fluidly-leave-active {
    animation: fluidly-leave .4s;
  }



  @keyframes fluidly-enter {
    0% {
      opacity: 0;
    }
  }

  @keyframes fluidly-leave {
    100% {
      opacity: 0;
    }
  }
</style>

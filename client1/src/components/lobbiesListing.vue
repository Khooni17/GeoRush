<template>
  <div>
    <div class="create-container" >
      <transition name="back" >
        <div
          v-if="creatingLobby"
          class="back"
          @click="creatingLobby = false"
        ></div>
      </transition>
      <transition name="create-lobby">
        <create-game
          v-if="creatingLobby"
          class="create-game"
          :reveivedLobbies="reveivedLobbies"/>
      </transition>
    </div>
    <div class="container">
      <div class="left">
        <div class="listing">

          <div class="top-bar">
            <div class="status-connect">статус подключения -  подключен</div>
            <div class="create-game-button">
              <button
                class="btn-create"
                @click="creatingLobby = true"
              >
                + создать новую игру
              </button>
            </div>
          </div>

          <div class="list">
            <div class="list-head">
              <span>Игра</span>
              <span>Время</span>
              <span>Подключено</span>
            </div>
            <transition-group
              name="lobby-birth">
              <lobby-preview
                :key="lobby.lobbyID"
                v-for="lobby in freeLobbies"
                :lobbyInfo="lobby"
                :lobbyID="lobby.lobbyID"
                :players="lobby.players"
              ></lobby-preview>
            </transition-group>
          </div>
        </div>
      </div>
      <div class="right">
        <chat></chat>
        <div>
          <p style="text-align: center">ваше место в топе - №1</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>

  import lobbyPreview from '@/components/lobbyPreview';
  import createGame from '@/components/createGame';
  import chat from '@/components/chat';

  export default {
    name: 'lobbiesListing',
    data() {
      return {
        creatingLobby: false,
        addedUser : true,
        leavedUser: true,
        nameLobby: '',
        freeLobbies: [],
        messages: [],
        reveivedLobbies: null
      }
    },

    sockets: {
      // приходит список всех лобби не начавшихся уже с подключившимися игроками
      createdLobbies(lobbies){
        this.freeLobbies = lobbies;
      },

      reveivedLobbies (lobbies) {
        this.reveivedLobbies = lobbies;
      },

      nameReleased(lobbyID){
        if (this.reveivedLobbies.includes(lobbyID)) {
          this.reveivedLobbies.splice(this.reveivedLobbies.indexOf(lobbyID) , 1)
        }
      },

      lobbyCreated(info){
        this.freeLobbies.push(info);
        //console.log(this.freeLobbies);
        /// добавляю превью сюда чтобы сокет сработал который в превью
        this.$socket.emit('connectLobby', info);
      },

      newLobby (info) {
        this.reveivedLobbies.push(info.lobbyID);
        this.freeLobbies.push(info);
      },

      // добавление челика в ревью
      addUserToReviewLobby (userInfo) {
        this.freeLobbies.forEach( (lobby) => {
          if(lobby.lobbyID === userInfo.lobbyID){
            lobby.players.push(userInfo.UserID);
            //console.log(lobby);
          }
        });
      },

      // удаление челика из ревью
      leaveSocket (id) {
        this.freeLobbies.forEach( (lobby) => {
          if( lobby.players.includes(id) ){
            lobby.players.splice(lobby.players.indexOf(id), 1);

            if (lobby.players.length === 0) {
              // скрытие лобби
              this.freeLobbies.forEach( (freeLobby, i) => {
                if(freeLobby.lobbyID === lobby.lobbyID){
                  this.freeLobbies.splice(i, 1);
                }
              });

              // емит на удаление лобби
              this.$socket.emit('closeLobby', lobby.lobbyID);
              // емит на удаление сообщений
              this.$socket.emit('deleteMessages', lobby.lobbyID);
            }
          }
        })
      },

      // идет после запроса на коннект если комната заполнена
      lobbyFilled(){
        console.log('комната заполнена');
      },

      // скрытие ревью

      hideRoom (lobbyID) {
        this.freeLobbies.forEach( (lobby, i) => {
          if(lobby.lobbyID === lobbyID){
            this.freeLobbies.splice(i, 1);
          }
        });
      },

      //  открытие ревью
      showingRoom (lobbyID) {
        console.log('showingRoom');
        let needToPush = true;
        this.freeLobbies.forEach((lobby) => {
          if (lobby.lobbyID === lobbyID) {
            needToPush = false;
          }
        });
        if (needToPush) {
          this.$socket.emit('getLobbyByID', lobbyID);
        }
      },
      lobbyByID( lobbyInfo ) {
        this.freeLobbies.push(lobbyInfo);
        this.$socket.emit('getCountPeopleInLobbyToListing', lobbyInfo.lobbyID);
      },
      CountPeopleInLobbyToListing(playersInfo){
        this.freeLobbies.forEach( (lobby) => {
          if(lobby.lobbyID === playersInfo.lobbyID){
            lobby.players = playersInfo.players;
          }
        });
      }

    },

    mounted(){
      this.$socket.emit('getCreatedLobbies');
      this.$socket.emit('getReceivedLobbies');
    },
    components: {
      lobbyPreview,
      createGame,
      chat
    }
  }
</script>

<style scoped>
  .container {
    display: flex;
    flex-direction: row;
    align-items: start;
    justify-content: space-evenly;
    background-color: #a2e296;
    width: 90vw;
    border-radius: 2vh;
  }

  .right {
    width: 29vw;
  }

  .left {

    width: 50vw;
  }

  .listing {
    width: 100%;
  }

  .listing > table {
    width: 100%;
    text-align: center;
    border-collapse: separate;
  }



  .listing-hat > ul > li {
    margin-right: auto;
  }

  .top-bar {
    position: relative;
    height: 10vh;
  }

  .status-connect {
    position: absolute;
    left: 1vw;
    top: 50%;
    transform: translateY(-50%);
  }

  .create-game-button {
    position: absolute;
    right: 1vw;
    top: 50%;
    transform: translateY(-50%);
  }

  .create-game {
    position: absolute;
    top: 40%;
    left: 50%;
    transform: translateY(-50%) translateX(-50%);
    z-index: 10;
  }

  .lobby-birth-enter-active {
    animation: lobby-birth-enter 3.35s;
  }

  .lobby-birth-leave-active {
    animation: lobby-birth-leave 0.35s;
  }

  @keyframes lobby-birth-enter {
    0% {
      opacity: 0;
    }
  }

  @keyframes lobby-birth-leave {
    100% {
      opacity: 0;
    }
  }


  .create-lobby-enter-active {
    animation: create-enter 0.7s;
  }

  .create-lobby-leave-active {
    animation: create-leave 0.7s;
  }

  .back-enter-active {
    animation: back-enter 0.7s;
  }

  .back-leave-active {
    animation: back-leave 0.7s;
  }


  .btn-create {
    outline:none;
    display: inline-block;
    padding: 6px 12px;
    margin-bottom: 0;
    font-size: 14px;
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
    border-radius: 7px;
    background-color: rgba(113, 177, 255, 0.9);
    color: #fff;
  }

  .btn-create:hover {
    outline:none;
    background-color: rgb(107, 225, 255);
  }

  .btn-create:active {
    outline:none;
    transition: 0.5s;
    transform: translateY(5px);
  }


  @keyframes create-enter {
    0% {
      transform: translateY(-300%) translateX(-50%);

    }

    40% {
      transform: translateY(-10%) translateX(-50%);

    }

    100% {
      transform: translateX(-50%) translateY(-50%);
    }
  }
  @keyframes create-leave {
    0% {

    }

    100% {
      transform: translateY(-300%) translateX(-50%);
    }
  }
  @keyframes back-enter {
    0% {
      opacity: 0;
    }
  }
  @keyframes back-leave {
    100% {
      opacity: 0;
    }
  }

  .list {
    display: flex;
    flex-direction: column;
  }

  .list-head {
    text-align: center;
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: space-around;
  }


  .back {
    background-color: black;
    position: absolute;
    left: 0;
    top: 0;
    opacity: 0.45;
    width: 100vw;
    height: 100vh;
    z-index: 10;
  }

</style>

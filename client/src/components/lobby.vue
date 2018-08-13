<template>
  <div class="lobby">
    <div class="container">'
      <div class="top">
        <span style="margin: 0 0 0 10%">Готовятся к игре:</span>
        <span style="margin: 0 0 0 35%"> {{ lobbyID }}</span>
      </div>
      <div class="mid">
        <div class="users">
          <div class="card-container" v-for="user in users" :style="user === userID ? !ready.includes(user) ? {'background': 'orange'} :
                                                                   {'background': 'green'} :
                                                                    !ready.includes(user) ? {'background': 'red'} : {'background': 'green'}">
            <div class="card-main" :style="!ready.includes(user) ?  {'margin': '1% 1%  5%  17%', 'transition' : '.3s'} : {'margin': '1% 17%  5%  1%', 'transition' : '.3s'}">
              <span class="username">{{user}}</span>
              <span class="status">{{!ready.includes(user) ? 'готов' : 'не готов'}}</span>
            </div>
            <div class="ready">
              <div v-if="user === userID" style="height: 100%;">
                <a v-if="!ready.includes(user)" class="ready ready-btn" @click="userReadyToPlay"></a>
                <a v-else class="unready ready-btn" @click="userUnreadyToPlay"></a>
              </div>
              <div v-else class="ready-btn"></div>
            </div>
          </div>
        </div>
        <div class="chat">
          <lobby-chat :lobbyID="lobbyID">
          </lobby-chat>
        </div>
      </div>


      </div>

    </div>
</template>

<script>
  import lobbyChat from '@/components/lobby-chat';

  export default {
    name: "lobby",
    data() {
      return {
        lobbyInfo: '',
        leaved: '',
        messageText: '',
        lobbyID: '',
        messages: [],
        users: [],
        ready: [],
        userID: '',
        admin: null,
        showChelikov: true
      }
    },

    sockets: {
      // сначала получается список всех
      CountPeopleInLobby(users){
        this.users = users;

        if (users.length === 1) {
          this.admin = this.userID;
        } else {
          // узнаю кто админ
          this.$socket.emit('getWhoAdmin', this.lobbyID);
        }

      },

      getAdminID(){
        if (this.admin !== null) {
          this.$socket.emit('adminFounded', {
            adminID: this.admin,
            lobbyID: this.lobbyID
          });
        }
      },

      admin(adminID){
        console.log('adminID', adminID);
        if (this.admin === null) {
          this.admin = adminID;
        }
      },






      addUserToLobby (userInfo) {
        this.users.push(userInfo.UserID);  // добавляю челика в список
        const messageObj = {
          lobbyID: this.lobbyID,
          username: 'GEO',
          text: `${userInfo.UserID} присоединился в игре`,
          date: new Date()
        };
        this.messages.push(messageObj); //  служебное сообщение в чат
      },

      leaveSocket(id){
        if(this.users.includes(id)) {
          this.users.splice(this.users.indexOf(id), 1);
          const messageObj = {
            lobbyID: this.lobbyID,
            username: 'GEO',
            text: `${id} покинул игру`,
            date: new Date()
          };
          this.messages.push(messageObj);
        }
        // сразу же идет отправка чтобы открылась комната
        this.$socket.emit('showRoom', this.lobbyID);
        this.showChelikov = false;
        this.showChelikov = true;
      },

      initialReady(readyList){
        this.ready = readyList;
      },



      userReady(userID){
        this.ready.push(userID);
        console.log(userID, '===' , this.userID, '=', userID === this.userID);

        const allReady = this.ready.length === this.users.length;
        if (allReady) {
          this.$socket.emit('tryToStart', {
            lobbyID: this.lobbyID,
            countPlayers: this.lobbyInfo.countPlayers,
            allReady: allReady
          });
        }
      },

      userUnready(userID){
        this.ready.splice(this.ready.indexOf(userID), 1);
      },

      setStartGameTimer () {
        if( this.userID === this.admin ){
          this.$socket.emit('requestToCloseLobby', this.lobbyID);
        }

        this.$router.push({
          name: 'timer',
          params: {
            lobbyID: this.lobbyID,
            lobbyInfo: {
              ...this.lobbyInfo,
              userID: this.userID,
              users: this.users,
              admin: this.admin
            }
          }
        });
      }
    },
    mounted () {
      //  забор инфы о лобби из параметров
      this.lobbyID = this.$store.state.route.params.lobbyID;
      this.userID = this.$socket.id;

      this.lobbyInfo = this.$store.state.route.params.lobbyInfo;




      // запрос на людей
      this.$socket.emit('getCountPeopleInLobby', this.lobbyID);  // запрос на игроков
      // запрос на то кто готов
      this.$socket.emit('getInitialReady', this.lobbyID);

    },
    computed: {

    },
    methods: {

      userReadyToPlay(){
        console.log(Math.ceil(this.users.length/2));
        this.puller = false;
        this.puller = true;
        this.$socket.emit('readyToPLay', {
          lobbyID: this.lobbyID,
          userID: this.userID
        });
      },
      userUnreadyToPlay(){
        this.$socket.emit('unreadyToPLay', {
          lobbyID: this.lobbyID,
          userID: this.userID
        });
      },

    },
    components: {
      lobbyChat
    }

  }
</script>

<style scoped>

  .top {
    width: 50vw;
    height: 10vh;
    overflow: hidden;
  }

  .top:first-child {
    margin: 0 0 0 10%;

  }

  .top:last-child{
    color: red;
  }



  .lobby {
    background-color: rgba(62, 181, 107, 0.24);
    width: 90vw;
    height: 90vh;
    overflow: hidden;
  }

  .container {
    height: 78vh;
    margin: 2vh 0;
    width: 90vw;

  }

  .mid {
    width: 90%;
    margin: 0 auto;
    height: 100%;
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    justify-content: space-between;
  }
  .users {
    width: 40%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-around;
  }




  .card-container {
    width: 18vw;
    height: 7vh;
    border-radius: 5vw;
    z-index: 13;
    position: relative;
    overflow: hidden;
  }

  .ready {
    width: 100%;
    height: 100%;
    border-radius: 5vw;
    position: absolute;
    top: 0;
    left: 0;

  }

  .card-main {
    height: 86%;
    width: 80%;
    border-radius: 5vw;
    background: white;

  }

  .username {
    font-size: .8vw;
    margin-left: 20%;
    font-weight: bold;
    letter-spacing: 1px;
    color: rgba(0, 0, 0, 0.51);
    user-focus: none;
    user-select: none;
  }

  .status {
    font-size: .7vw;
    margin-left: 70%;
    font-weight: bold;
    color: rgba(0, 0, 0, 0.9);
    user-focus: none;
    user-select: none;

  }





  .ready-btn {
    width: 100%;
    z-index: 12;
    height: 100%;
    cursor: pointer;
    display: block;
  }


  @keyframes puller-enter {
    0% {
      width: 0;
      right: 0;
    }

    100% {
      width: 100%;
      right: 0;
    }
  }

  @keyframes puller-leave {
    0% {
      width: 100%;
      left: 0;
    }

    100% {
      width: 0;
      left: 0;
    }
  }



</style>

<template>
  <b-container class="full">
    <h2 class="text-center"> {{ lobbyID }}</h2>
    <div>
      <span>
        waiting for {{ lobbyInfo.countPlayers - users.length }} players
      </span>
    </div>
    <div class="b">
      <span> Готовятся к игре: </span>
      <b-row>
        <b-col v-for="user in users">
          <b-card
            bg-variant="light"
            :header="user"
            class="text-center"
            text-variant="dark"
          >
            <span class="success" v-if="ready.includes(user)">
              готов
            </span>
            <span class="warning" v-else>
              не готов
            </span>

          </b-card>
        </b-col>
      </b-row>
      <br >
      <b-row>
        <b-col md="3" offset-md="4">
          <v-card>
            <v-card-title primary-title>
              {{ userID }}
            </v-card-title>
            <v-card-actions>
              <v-btn
                v-if="ready.includes(userID)"
                color="warning"
                @click="userUnreadyToPlay"
              >
                я не готов
              </v-btn>

              <v-btn
                v-else
                @click="userReadyToPlay"
                color="success">
                я готов
              </v-btn>
            </v-card-actions>
          </v-card>
        </b-col>
      </b-row>
    </div>
    <br>
    <b-card
      bg-variant="info"
      header="chat"
      class="text-center"
      text-variant="dark"
    >
      <b-container>
        <b-row class="border-dark" v-for="message in messages">
          <b-col>{{ message.username }}</b-col>
          <b-col>{{ message.text }}</b-col>
          <b-col>{{ message.date }}</b-col>
        </b-row>
        <br>
        <input type="text" v-model="messageText">
        <button @click="sendMessage">
          send
        </button>
      </b-container>
    </b-card>

  </b-container>
</template>

<script>
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
        userID: ''
      }
    },

    sockets: {
      // сначала получается список всех
      CountPeopleInLobby(users){
        console.log('users');
        this.users = users;
        console.log(users);
      },

      // история сообщений
      historyMessages(messages){
        this.messages = messages;
      },

      //  если будет сообщение оно отобразится
      newMessageInLobby(msg){
        this.messages.push(msg);
      },


      addUserToLobby(userInfo){
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
      },

      initialReady(readyList){
        this.ready = readyList;
      },

      userReady(userID){
        this.ready.push(userID);

        const allReady = this.ready.length === this.users.length;
        if(allReady){
          console.log('pognale');
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

      setStartGameTimer(){
        console.log('pognale');
        this.$router.push({
          name: 'timer',
          params: {
            lobbyID: this.lobbyID,
            lobbyInfo: {
              ...this.lobbyInfo,
              userID: this.userID,
              users: this.users
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


      // запрос на историю сообщений
      this.$socket.emit('getHistoryMessages', this.lobbyID);
      // запрос на людей
      this.$socket.emit('getCountPeopleInLobby', this.lobbyID);  // запрос на игроков
      // запрос на то кто готов
      this.$socket.emit('getInitialReady', this.lobbyID);

    },

    methods: {

      userReadyToPlay(){
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
      sendMessage () {
        this.$socket.emit('sendMessageToLobby', {
          lobbyID: this.lobbyID,
          text: this.messageText
        });
        this.messageText = '';
      }
    }

  }
</script>

<style scoped>
  .full {
    height: 100vh;
  }


</style>

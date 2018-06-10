<template>
  <div class="container">
    <h2> {{ lobbyID }}</h2>
    <div class="b">
      <span>
        waiting for {{ lobbyInfo.countPlayers - users.length }} players
      </span>
    </div>
    <div class="b">
      <span>users</span>
      <ul>
        <li v-for="user in users">
          {{ user }}
        </li>
      </ul>
    </div>
    <div class="b chat">
      <h4>chat</h4>
        <table>
          <tr v-for="message in messages">
            <td>{{ message.username }}</td>
            <td>{{ message.text }}</td>
            <td>{{ message.date }}</td>
          </tr>
        </table>
      <input type="text" v-model="messageText">
      <button @click="sendMessage">
        send
      </button>
    </div>
  </div>
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
        users: []
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
        this.messages.push(`${userInfo.UserID} присоединился в игре`); //  служебное сообщение в чат
      },

      leaveSocket(id){
        if(this.users.includes(id)) {
          this.users.splice(this.users.indexOf(id), 1);
          this.messages.push(`${id} ливанул`);
        }
        // сразу же идет отправка чтобы открылась комната
        this.$socket.emit('showRoom', this.lobbyID);
      },

    },
    mounted () {
      //  забор инфы о лобби из параметров
      this.lobbyID = this.$store.state.route.params.lobbyID;
      console.log(this.lobbyID);

      this.lobbyInfo = this.$store.state.route.params.lobbyInfo;
      console.log(this.lobbyInfo);

      // запрос на историю сообщений
      this.$socket.emit('getHistoryMessages', this.lobbyID);

      this.$socket.emit('getCountPeopleInLobby', this.lobbyID);  // запрос на игроков
    },

    methods: {
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
  .container {
    position: absolute;
    top: 50vh;
    left: 0;

    overflow: hidden;
  }

  .b {
    background-color: #D6D6D6;
    margin: 0.5rem;
    font-size: 1rem;
    border: 1px solid grey;
    border-radius: 1rem;
    padding: 3rem;
    width: 40vw;
    float: left;
  }
</style>

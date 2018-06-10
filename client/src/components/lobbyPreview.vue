<template>
  <div>
      <p style="display: inline-block; margin-right: 2rem">{{ lobbyID }}</p>
      <button
        style="display: inline-block"
        @click="connectToLobby">
        connect
      </button>
      <hr>
      <p
        style="display: inline-block; margin-right: 2rem"
      >
        already connected: {{ users.length }} / {{ lobbyInfo.countPlayers }}
      </p>
    </div>
</template>

<script>
  export default {
    props: ['lobbyID'],
    name: "lobbyPreview",
    data(){
      return {
        lobbyInfo: '',
        users: []
      }
    },
    sockets: {

      // инфа о лобби приходит
      lobbyInfo(lobbyInfo){
        if (lobbyInfo.lobbyID === this.lobbyID) {
          this.lobbyInfo = lobbyInfo;
        }
      },

      //  инфа о людях в лобби
      CountPeopleInLobby(users) {
        this.users = users;
      },

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

      // добавляет челика
      addUserToReviewLobby(userInfo){
        console.log('пришло', userInfo.lobbyID);
        console.log('из лобби', this.lobbyID);

        //if (userInfo.lobbyID === this.lobbyID) {
          this.users.push(userInfo.UserID);
       // }
      },

      // убавляет челика
      leaveSocket(id){
        if(this.users.includes(id)) {
          this.users.splice(this.users.indexOf(id), 1);
        }
      },
    },

    mounted () {
      // запрос на данные об игре: количество игроков тд
      this.$socket.emit('getLobbyInfo', this.lobbyID);
      //  запрос на людей находящихся в комнате
      this.$socket.emit('getCountPeopleInLobby', this.lobbyID);
    },
    methods: {
      connectToLobby(){
        this.$socket.emit('connectLobby', this.lobbyInfo);
      }
    },
  }
</script>

<style scoped>

</style>

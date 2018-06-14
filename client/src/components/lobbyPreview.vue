<template>
  <b-card
    bg-variant="info"
    text-variant="white"
    :header="lobbyID"
    class="text-center">

    <button
      class="btn btn-succes"
      @click="connectToLobby"
    > connect </button>
    <span class="info-users">
      already connected: {{ players.length }} / {{ lobbyInfo.countPlayers }}
    </span>
    </b-card>
</template>

<script>
  export default {
    props: ['lobbyID', 'players', 'lobbyInfo'],
    name: "lobbyPreview",
    data(){
      return {
        users: []
      }
    },
    sockets: {

      // инфа о лобби приходит
      /*lobbyInfo(lobbyInfo){
        if (lobbyInfo.lobbyID === this.lobbyID) {
          this.lobbyInfo = lobbyInfo;
        }
      },*/

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
      // запрос на данные об игре: количество игроков тд
      //this.$socket.emit('getLobbyInfo', this.lobbyID);
      //  запрос на людей находящихся в комнате
      this.$socket.emit('getCountPeopleInLobby', this.lobbyID);
    },
    methods: {
      connectToLobby(){
        this.$socket.emit('connectLobby', this.lobbyInfo);
      }
    }
  }
</script>

<style scoped>
  .text-center {
    border-radius: 10px;
    margin: 1vh auto;
  }

  .info-users {

    margin-left: 2vw;
    font-size: .9em;
  }
</style>

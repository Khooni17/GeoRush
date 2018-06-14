<template>
      <b-row>
        <b-col>
          <create-game />
        </b-col>
      <b-col>
        <h4>
          <small>LOBBIES : </small>
        </h4>

          <b-row v-for="lobby in freeLobbies">
            <lobby-preview
              :lobbyInfo="lobby"
              :lobbyID="lobby.lobbyID"
              :players="lobby.players"
            ></lobby-preview>
          </b-row>


      </b-col>
    </b-row>
</template>

<script>

  import lobbyPreview from '@/components/lobbyPreview';
  import createGame from '@/components/createGame';

  export default {
    name: 'lobbiesListing',
    data() {
      return {
        addedUser : true,
        leavedUser: true,
        nameLobby: '',
        freeLobbies: [],
        messages: []
      }
    },

    sockets: {
      // приходит список всех лобби не начавшихся уже с подключившимися игроками
      createdLobbies(lobbies){
        this.freeLobbies = lobbies;

      },

      lobbyCreated(info){
        this.freeLobbies.push(info);
        //console.log(this.freeLobbies);
        /// добавляю превью сюда чтобы сокет сработал который в превью
        this.$socket.emit('connectLobby', info);
      },

      newLobby (info) {
        this.freeLobbies.push(info);
        //console.log(this.freeLobbies);
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
          }
        })
      },

      // идет после запроса на коннект если комната заполнена
      lobbyFilled(){
        console.log('комната заполнена');
      },

      // скрытие ревью
      hideRoom(lobbyID) {
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
    },
    components: {
      lobbyPreview,
      createGame
    }
  }
</script>

<style>
  h4 {
    text-align: center;
  }
</style>

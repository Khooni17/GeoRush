<template>
  <div>
    <create-game />
    <div class="b lobby__list">
      <span>LOBBIES :</span>
      <div style="margin: 3rem; background-color: aqua; border-radius: 1rem" v-for="lobby in freeLobbies">
        <lobby-preview
          :lobbyID="lobby.lobbyID"
        ></lobby-preview>
      </div>
    </div>
  </div>
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
      createdLobbies(lobbies){
        this.freeLobbies = lobbies;
      },

      lobbyCreated(info){
        this.freeLobbies.push(info.lobbyID);  /// добавляю превью сюда чтобы сокет сработал который в превью
        this.$socket.emit('connectLobby', info);
      },

      newLobby(info){
        this.freeLobbies.push(info.lobbyID);
      },

      // идет после запроса на коннект если комната заполнена
      lobbyFilled(){
        console.log('комната заполнена');
      },

      // показ скрытие ревью
      hideRoom(lobbyInfo) {
        const name = lobbyInfo.lobbyName;
        this.freeLobbies.splice(this.freeLobbies.indexOf(name), 1);
      },

      showingRoom(lobbyInfo) {
        if (!this.freeLobbies.includes(lobbyInfo)) {
          this.freeLobbies.push(lobbyInfo);
          console.log('work');
        }
        else {
          console.log('ne');
        }
      }

    },

    mounted(){
      this.$socket.emit('getCreatedLobbies')
    },
    components: {
      lobbyPreview,
      createGame
    }
  }
</script>

<style>

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

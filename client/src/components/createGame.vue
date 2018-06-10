<template>
  <div class="b lobby__create">
    <label >name lobby: </label>
    <input type="text" v-model="lobbyID">
    <br>
    <label >count Players</label>
    <input type="text" v-model="countPlayers">
    <br>
    <button @click="createLobby" class="create_lobby">
      Create Lobby
    </button>
  </div>
</template>

<script>
  export default {
    name: "createGame",
    data(){
      return {
        lobbyID: '',
        countPlayers: ''
      }
    },
    methods: {
      createLobby(){
        // отправка данных на сервер
        this.$socket.emit('createLobby', {
          lobbyID: this.lobbyID,
          countPlayers: this.countPlayers
        });

        this.lobbyID = '';
        this.countPlayers = '';
      }
    }
  }
</script>

<style scoped>

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

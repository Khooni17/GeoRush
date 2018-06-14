<template>
  <div class="b">
    <h4 class="">Создать новую игру</h4>
    <br>
    <b-form-input
      placeholder="введите имя комнаты.."
      type="text"
      v-model="lobbyID"
    ></b-form-input>
    <br>
    <b-form-input
      placeholder="количество игроков.."
      type="text"
      v-model="countPlayers"
      >
    </b-form-input>
    <br>
    <button
      @click="createLobby"
      class="btn btn-info"
    >
      Вперёд!
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
    background-color: #0ae7db;
    margin: 0.5rem;
    font-size: 1rem;
    border: 1px solid grey;
    border-radius: 1rem;
    padding: 3rem;
    width: 40vw;
    float: left;
  }
</style>

<template>
  <div class="create-cont">
    <h4 class="">Создать новую игру</h4>

    <div class="inputs-block">
      <input
        placeholder="введите имя комнаты.."
        type="text"
        v-model="lobbyID"
      />
      <input
        placeholder="количество игроков.."
        type="number"
        v-model="countPlayers"
      >
    </div>

    <span
      :style="{color:colorFlash}"
      v-if="showFlash"
    >
      {{ flashMessage }}
    </span>

    <button
      @click="createLobby"
      class="btn"
    >
      Вперёд!
    </button>
  </div>
</template>

<script>
  export default {
    name: "createGame",
    props: ['reveivedLobbies'],
    data() {
      return {
        lobbyID: '',
        countPlayers: '',

        showFlash: false,
        flashMessage: '',
        colorFlash: ''
      }
    },
    methods: {
      createLobby() {
        if (!this.reveivedLobbies.includes(this.lobbyID)) {
          if(this.countPlayers > 5) {
            this.showFlash = true;
            this.flashMessage = 'Комната не сможет вместить больше 5 человек';
            this.colorFlash = 'red';
          } else {
            if(this.countPlayers < 1) {
              this.showFlash = true;
              this.flashMessage = 'Пожалуйста, введите положительное количество игроков';
              this.colorFlash = 'red';
            } else {
              // отправка данных на сервер
              this.$socket.emit('createLobby', {
                lobbyID: this.lobbyID,
                countPlayers: this.countPlayers
              });

              this.lobbyID = '';
              this.countPlayers = '';
            }
          }
        } else {
          this.showFlash = true;
          this.flashMessage = 'Это имя для лобби уже занято';
          this.colorFlash = 'red';
        }
      }
    }
  }
</script>

<style scoped>

  h4 {
    text-align: center;
  }

  .inputs-block {
    display: flex;
    flex-direction: row;
  }

  .create-cont {
    width: 50vw;
    height: 45vh;
    border: rgba(0, 0, 0, 0.45) solid 1px;
    border-radius: 2em;
    background-color: azure;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    align-items: center;
  }

  .inputs-block > input {
    padding: 1vw;
    margin: 0 1vw;
    border-radius: 10px;
    border: rgba(0, 0, 0, 0.4) solid 1px;
  }

  .inputs-block > input:focus {
    padding: 1vw;
    margin: 0 1vw;
    border-radius: 10px;
    border: rgb(63, 142, 255) solid 1px;
    outline:none;
    box-sizing: border-box;
  }

  .btn {
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
  }

  .btn:hover {
    outline:none;
    background-color: rgba(113, 177, 255, 0.9);
  }

  .btn:active {
    outline:none;
    transition: 0.5s;
    transform: translateY(5px);
  }
</style>

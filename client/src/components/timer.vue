<template >
  <div class="bar">
    <h3 class="text-primary">
      ИГРА НАЧИНАЕТСЯ
    </h3>
    <br >
    <v-progress-circular
      color="primary"
      :size="200"
      :width="15"
      :rotate="360"
      :value="value"
    >
      <h3>{{seconds}}</h3>
    </v-progress-circular>
  </div>
</template >

<script >
  export default {
    name: "timer",
    data(){
      return {
        value: -10,
        seconds: 5
      }
    },
    mounted () {
      setTimeout( () => {
        // переход в игру
        this.$router.push({
          name: 'game',
          params: {
            lobbyID: this.$store.state.route.params.lobbyID,
            lobbyInfo: this.$store.state.route.params.lobbyInfo
          }
        });
        // удаление лобби и сообщений
        this.$socket.emit('removeLobby');

      }, 5000);

      setInterval( () => {
        this.seconds--;
      }, 1000);

      setInterval( () => {
        this.value = this.value + 5;
      }, 200);
    }
  }

</script >

<style scoped >
  .bar {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
</style >

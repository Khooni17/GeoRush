<template >
    <div>
      game
    </div>
</template >

<script >
  import _ from 'lodash';

  export default {
    name: "game",
    data(){
      return {
        lobbyID: '',
        gameInfo: {}
      }
    },
    mounted () {
      this.lobbyID = this.$store.state.route.params.lobbyID;
      this.gameInfo = this.$store.state.route.params.lobbyInfo;

      // подключился к игре
      this.$socket.emit('connectedToGame', {
        userID: this.lobbyInfo.userID,
        lobbyID: this.lobbyID,
        countPlayers: this.lobbyInfo.countPlayers
      });
      }

  }
</script >

<style scoped >

</style >

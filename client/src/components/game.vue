<template >
    <div>
      <div v-if="showPick" class="question">
        <img v-bind:src="question" >
      </div>
      <div class="users">
        <h3>users</h3>
          <ul v-for="user in gameInfo.users">
            <li>
              {{user}}
            </li>
          </ul>
      </div>
      <div class="timer">

        <v-progress-circular
          color="primary"
          :size="200"
          :width="15"
          :rotate="360"
          :value="valueTimer"
        >
          <h3>{{ seconds }}</h3>
        </v-progress-circular>


      </div>
      <div class="game">
        <v-btn
          @click="sendAnswer"
          color="success">

          ответить
        </v-btn>
      </div>
      a
    </div>
</template >

<script >

  export default {
    name: "game",
    data(){
      return {
        lobbyID: '',
        gameInfo: {},
        users: [],
        valueTimer: '',
        question: '',
        timerInterval: '',
        TimerVar: '',
        seconds: '',
        showPick: false
      }
    },
    sockets: {
      question(question) {

        console.log(this.showPick);
        console.log(question);
        this.question = question;
        this.showPick = true;
        console.log(this.showPick);
        /*this.question = qstn._doc;
        // создание таймера на отправление нового вопроса
        clearTimeout(this.TimerVar);
        this.TimerVar = this.getQuestion();

        // отрисовка таймера
        this.timerFront();*/

      }
    },
    mounted () {
      this.lobbyID = this.$store.state.route.params.lobbyID;
      this.gameInfo = this.$store.state.route.params.lobbyInfo;

      // запрос на первый вопрос
      this.$socket.emit('getQuestion', this.gameInfo);
    },
    methods: {
      getQuestion() {
        return setTimeout( () => {
          this.$socket.emit('getQuestion', this.gameInfo);
        }, 6000)
      },
      sendAnswer () {
        this.$socket.emit('answer', {
          ...this.gameInfo,
          question: this.question
        });
      },

      timerFront(){
        clearInterval(this.timerInterval);

        this.valueTimer = 0;
        this.seconds = 5;

        this.timerInterval = setInterval( () => {
          this.valueTimer += 20;
          this.seconds--;
        }, 1000)
      }
    }

  }
</script >

<style scoped >

</style >

<template >
    <div>
      <div class="users">
        <h3>users</h3>
        <ul v-for="user in gameInfo.users">
          <li>
            {{user}}
          </li>
        </ul>
      </div>

      <div v-if="now === 'game'" class="game">
      <div class="question">
        <img v-bind:src="question.photoURL" >
      </div>
        <div class="map"
        v-if="showMap"
      >
        <google-map
          @marker="changePositionMarker"
        ></google-map>
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
        <v-btn
          @click="sendAnswer"
          color="success">

          ответить
        </v-btn>
      </div>

      <div v-if="now === 'answered'" class="answered">
        ваш ответ отправлен
      </div>

      <div  v-if="now === 'results'" class="results">
        results
      </div>

      <div v-if="now === 'lastResults'" class="last-results">
        last results
      </div>

    </div>
</template >

<script >
import  googleMap from '@/components/map';


  export default {
    name: "game",
    data(){
      return {
        now: '',
        showMap: true,
        lobbyID: '',
        gameInfo: {},
        users: [],
        valueTimer: '',
        question: '',
        positionMarker: '',
        timerInterval: '',
        TimerQuestion: '',
        TimerShowResults: '',
        seconds: '',

        countPoints: [], // в маунтед щзагрузиьт сюда массив обьекстов
        tempResults: [],
        result: ''
      }
    },
    sockets: {
      question(question) {
        // начинается игра
        this.now = 'game';

        this.question = question;  // тут должен быть обьект с ссылкой и координатами



        clearTimeout(this.TimerQuestion);
        this.TimerQuestion = this.getQuestion();
        this.$socket.emit('sendQuestionToOthers', {
          ...this.gameInfo,
          question: question
        });


        clearTimeout(this.TimerShowResults);
        this.TimerShowResults = this.showAnswersAndAddResults();
        // отрисовка таймера у всех
        this.timerFront();

      },

      userAnswered(answerInfo){
        this.tempResults.forEach( (user) => {
          if(answerInfo.userID === this.gameInfo.userID){
            this.now = 'answered';
          }
          if(user.userID === answerInfo.userID){
            user.count = answerInfo.result;
          }
        });
      },

      leaveSocket (userID) {
        console.log('disco', userID);
        console.log('admin', this.gameInfo.admin);
        if ( userID === this.gameInfo.admin) {
          this.gameInfo.users.splice(this.gameInfo.users.indexOf(userID), 1);  // удаляю этого пидора
          this.gameInfo.admin = this.gameInfo.users[0]; // админом становится зашедший за ним чувак
        }
      }
    },

    mounted () {
      this.lobbyID = this.$store.state.route.params.lobbyID;
      this.gameInfo = this.$store.state.route.params.lobbyInfo;
      this.gameInfo.users.forEach( (user) => {
        this.countPoints.push({
          userID: user,
          count: 0
        });
        this.tempResults.push({
          userID: user,
          count: 0
        });
      });


      // запрос на первый вопрос
      if( this.gameInfo.admin === this.gameInfo.userID) {
        this.$socket.emit('getQuestion', this.gameInfo);
      }
    },

    methods: {
      showAnswersAndAddResults(){
        return setTimeout( () => {
          this.now = 'results';

        }, 8000);
      },

      getQuestion() {
        return setTimeout( () => {
          // запрос на вопрос отсылвет только админ
          if (this.gameInfo.admin === this.gameInfo.userID) {
            this.$socket.emit('getQuestion', this.gameInfo);
          }
        }, 10000);
      },

      sendAnswer () {
        this.$socket.emit('answer', {
          ...this.gameInfo,
          question: this.question,
          answer: this.positionMarker
        });
      },

      timerFront(){
        clearInterval(this.timerInterval);

        this.valueTimer = 0;
        this.seconds = 30;

        this.timerInterval = setInterval( () => {
          this.valueTimer += 3.33333333;
          if(this.seconds >= 0) {
            this.seconds--;
          }
        }, 1000);
      },

      changePositionMarker(e){
        this.positionMarker = e;
      }
    },
    components: {
      googleMap
    }

  }
</script >

<style scoped >

</style >

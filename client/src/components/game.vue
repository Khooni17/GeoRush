<template >
    <div>
      <div v-if="now === 'game' || now === 'answered'" class="users">
        <h3> users </h3>
        <ul v-for="user in countPoints">
          <li>
            <p>
              {{ `${user.userID} - ${user.count}` }}
            </p>
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
        <h2>results</h2>
        <div v-for="result in tempResults">
          <p>{{ `${result.userID} - ${result.count}` }}</p>
        </div>
      </div>

      <div v-if="now === 'lastResults'" class="last-results">
        <h3> last results </h3>
        <ul v-for="user in countPoints">
          <li>
            <p>
              {{ `${user.userID} - ${user.count}` }}
            </p>
          </li>
        </ul>
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

        countPoints: [],
        tempResults: [],
        result: ''
      }
    },
    sockets: {
      question(question) {
        console.log(question);
        // начинается игра
        this.now = 'game';
        this.question = question;  // тут должен быть обьект с ссылкой и координатами
        if(this.gameInfo.userID === this.gameInfo.admin) {
          this.$socket.emit('sendQuestionToOthers', {
            ...this.gameInfo,
            question: question
          });
        }
        // обнуление предыдущих результатов
        this.tempResults.map((user) => user.count = 0);

        if(question.numQuestion !== 2 && this.gameInfo.userID === this.gameInfo.admin){   // кол-во вопросов
          clearTimeout(this.TimerQuestion);
          this.TimerQuestion = this.getQuestion(question);
        }

        clearTimeout(this.TimerShowResults);
        this.TimerShowResults = this.showAnswersAndAddResults(question);
        // отрисовка таймера у всех
        this.timerFront();
      },

      userAnswered (answerInfo) {
        this.tempResults.forEach( (user) => {
          if(answerInfo.userID === this.gameInfo.userID){
            this.now = 'answered';
          }
          if(user.userID === answerInfo.userID){
            user.count = answerInfo.result;
          }
        });
        this.countPoints.forEach( (user) => {
          if(user.userID === answerInfo.userID){
            user.count += answerInfo.result;
          }
        });
      },

      leaveSocket (userID) {
        if ( userID === this.gameInfo.admin) {
          this.gameInfo.users.splice(this.gameInfo.users.indexOf(userID), 1);
          this.gameInfo.admin = this.gameInfo.users[0]; // админом становится зашедший за ним чувак
        }
      },

      showResults () {
        this.now = 'lastResults';
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
        this.$socket.emit('getQuestion', {
          ...this.gameInfo,
          numQuestion: 1
        });
      }
    },

    methods: {
      showAnswersAndAddResults (question) {
        return setTimeout( () => {
          this.now = 'results';

          if(question.numQuestion === 2){
            setTimeout(() => {
              this.now = 'lastResults';
            }, 8000);
          }
        }, 8000);
      },

      getQuestion(question) {
        return setTimeout( () => {
          // запрос на вопрос отсылвет только админ
          if (this.gameInfo.admin === this.gameInfo.userID) {
            this.$socket.emit('getQuestion', {
              ...this.gameInfo,
              numQuestion: ++question.numQuestion
            });
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

        changePositionMarker (e) {
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

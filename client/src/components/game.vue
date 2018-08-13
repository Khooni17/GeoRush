<template >
    <div>
      <div v-if="now === 'game'" class="game">
        <div class="left">
          <div class="timer-container">
            <div class="timer">
              <h3>{{ seconds }}</h3>
            </div>
          </div>
        </div>

        <div class="mid">
            <img
              class="question"
              v-bind:src="question.photoURL" >
          <div class="map-container"
                 v-if="showMap">
              <google-map
                class="map"
                @marker="changePositionMarker">
              </google-map>
            </div>

            <a v-if="positionMarker !== ''"   @click="sendAnswer">
              ответить
            </a>
        </div>

          <div class="right">
            <div class="users"
                 v-if="now === 'game' || now === 'answered'" >
              <h3> users </h3>
              <ul v-for="user in countPoints">
                <li>
                  <p>
                    {{ `${user.userID} - ${user.count}` }}
                  </p>
                </li>
              </ul>
            </div>
          </div>

      </div>


      <div v-if="now === 'answered'" class="answered">
        <h3>
          ваш ответ отправлен
        </h3>
        <div class="timer">
          <h3>{{ seconds }}</h3>
        </div>
      </div>


      <div  v-if="now === 'results'" class="results">
        <div class="results-others">
          <h2>как ответили другие</h2>
          <div v-for="result in tempResults">
            <p>{{ `${result.userID} - ${result.count}` }}</p>
          </div>
        </div>
        <div class="answer">
          <h2> {{ namePlace }}</h2>
          <div class="image-answer-container">
            <img v-bind:src="question.photoURL" >
          </div>
          <div class="map-result-container">
            <mapResult
              :coordinates="answer"
            />
          </div>
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

      <b-container v-if="now === 'lastResults'">
        <b-row class="border-dark" v-for="message in messages">
          <b-col>{{ message.username }}</b-col>
          <b-col>{{ message.text }}</b-col>
          <b-col>{{ message.date }}</b-col>
        </b-row>
        <br>
        <input type="text" v-model="messageText">
        <button @click="sendMessage">
          send
        </button>
      </b-container>
    </div>
</template >

<script >
import  googleMap from '@/components/map';
import  mapResult from '@/components/mapResult';

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
        answer: null,
        namePlace: '',
        positionMarker: '',
        timerInterval: '',
        TimerQuestion: '',
        TimerShowResults: '',
        seconds: '',

        countPoints: [],
        tempResults: [],
        result: '',

        messages: [],
        messageText: ''
      }
    },
    sockets: {
      historyMessages (messages) {
        this.messages = messages;
      },

      redirectToMain (lobbyID) {
        this.$socket.emit('closeLobby', this.lobbyID);
        if (this.lobbyID === lobbyID) {
          this.$router.push({
            name: 'lobbiesListing'
          });
        }
      },
      //  если будет сообщение оно отобразится
      newMessageInLobby(msg){
        this.messages.push(msg);
      },

      question (question) {
        // начинается игра
        this.namePlace = question.namePlace;
        this.now = 'game';
        this.question = question;  // тут должен быть обьект с ссылкой и координатами
        this.answer = question.answer;
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

          // игра завершается
          if(question.numQuestion === 2){
            setTimeout(() => {
              this.now = 'lastResults';
              // изменение статуса в бд
              if (this.gameInfo.admin === this.gameInfo.userID) {
                this.$socket.emit('gameFinished', this.gameInfo);
              }
              // запрос на историю сообщений
              this.$socket.emit('getHistoryMessages', this.lobbyID);
            }, 888000);
          }
        }, 888000);
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
        }, 100000);
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
      },

      sendMessage () {
        this.$socket.emit('sendMessageToLobby', {
          lobbyID: this.lobbyID,
          text: this.messageText
        });
        this.messageText = '';
      }
    },
    components: {
      googleMap,
      mapResult
    }

  }
</script >

<style scoped >
  .game {
    height: 80vh;
    display: flex;
    flex-direction: row;
  }

  .left {
    width: 17vw;
    height: 100%;
    background: rgba(0, 0, 0, 0.49);
  }

  .right {
    width: 17vw;
    height: 100%;
    background: rgba(0, 0, 0, 0.49);
  }

  .mid {
    width: 56vw;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    overflow: hidden;
    position: relative;
    box-shadow: -1px 1px 3px black ;
  }


  .question {
    height: 65%;
    position: absolute;
    top: 2%;
    left: 50%;
    transform: translateX(-50%);
  }

  .map-container {
    position: absolute;
    bottom: 3%;

    overflow: hidden;
    height: 24%;
    left: 50%;
    transform: translateX(-50%);
  }

  .map-container:hover {
    height: 45%;
  }

  .map {
    padding-bottom: -30%;
    height: 100%;
    width: 100%;
  }

</style >

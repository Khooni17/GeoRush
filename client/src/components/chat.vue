<template>
  <div class="chat">
    <div class="chat-cont">
      <div id="chat-body">
        <ul >
          <li
            :key="message.date"
            v-for="message in messages">
            <div class="message-cont">
              <div class="user-and-text">
                <span
                  class="userField"
                >
                  {{ message.username }}
                </span>
                <span>
                   :
                </span>

                <span
                  class="textField"
                >
                 {{ message.text }}
                </span>
              </div>

              <span
                class="dateField"
              >
                {{  `${new Date(message.date).getHours()}:${new Date(message.date).getMinutes()}:${new Date(message.date).getSeconds()}` }}
              </span>
            </div>

          </li>
        </ul>
      </div>
      <div class="chat-input">
        <input
          @keyup.enter="sendMessage"
          v-model="textMessage"
          type="text">
        <a @click="sendMessage">
          <
        </a>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    name: "lobby-chat",
    props: ['lobbyID'],
    data() {
      return {
        messages: [
          {
            username: 'user',
            text: 'some text',
            date: new Date()
          },
          {
            username: 'user',
            text: 'some text',
            date: new Date()
          },
          {
            username: 'user',
            text: 'some text',
            date: new Date()
          },
          {
            username: 'user',
            text: 'some text',
            date: new Date()
          },
          {
            username: 'user',
            text: 'some text',
            date: new Date()
          },
          {
            username: 'user',
            text: 'some text',
            date: new Date()
          }
        ],
        textMessage: ''
      }
    },
    sockets: {
      historyMessages(messages){
        this.messages = messages;
        //console.log(messages);
      },
      newMessageInLobby(msg){
        this.messages.push(msg);
      }
    },
    mounted () {
      setTimeout( () => {
        this.$socket.emit('getHistoryMessages', this.lobbyID);
      }, 0);
    },
    methods: {
      sendMessage () {
        this.$socket.emit('sendMessageToLobby', {
          lobbyID: this.lobbyID,
          text: this.textMessage
        });
        this.textMessage = '';
      }
    }
  }
</script>

<style lang="scss" scoped>
  .chat {
    background-color: rgba(0, 0, 0, 0.25);
    border: 1px solid #2c2c2c;
    box-shadow: -3px 3px #0e0e0e;
    height: 66vh;
    width: 24vw;
    border-radius: 1em;

    .chat-cont {
      height: 95%;
      width: 95%;
      margin: 2.5%;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      align-items: left;

      #chat-body {
        height: 70%;
        overflow-y: auto;
        width: 100%;
        ul {
          list-style: none;
          padding: 0 2%;
          margin: 0;

          li {
            animation: enter-message .3s ease-in-out;
            word-wrap: break-word;


            .message-cont {
              height: auto;
              width: 100%;
              display: flex;
              flex-direction: row;
              align-items: start;
            }

            .user-and-text {
              width: 80%;
              color: white;
            }

            .userField {
              font-weight: bold;
              font-size: .7em;
              color: #007f7f;
            }

            .textField {
              font-size: .85em;
              color: #a2a1a9;
            }

            .dateField {
              padding: 3px;
              display: inline-block;
              width: auto;
              color: rgba(144, 139, 143, 0.31);
              font-size: .75em;
              user-select: none;
            }
          }
        }

        #chat-body::-webkit-scrollbar {  /*это весь блок со скроллом*/
          background-color: #fff;
          width: 6px;
        }

        #chat-body::-webkit-scrollbar-thumb {
          background-color: #fff;
          border: 1px solid rgba(0, 0, 0, 0.2);
          border-radius: 2em;
        }

      }

      .chat-input {
        border-radius: 4vh;
        overflow: hidden;
        border: rgba(0, 0, 0, 0.4) solid 1px;
        height: 10%;
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-items: normal;
        border: 1px solid #808080;

        input {
          padding: 2vh 1vw;
          outline: none;
          border: none;
          color: #b7b7b7;
          background-color: rgba(0, 0, 0, 0.4);
          width: 90%;
          z-index: 2;
        }

        a {
          transform: rotate(90deg);
          background-color: rgba(0, 0, 0, 0.4);
          padding: 2.5vh;
          z-index: 1;
          font-weight: bold;
          text-transform:uppercase;
          font-size: 1.1em;
          display: block;
          color: #00a5a5;
          cursor: pointer;

          &:active {
            transform: translateY(-3px) rotate(90deg);
            user-select: none;
            cursor: pointer;
          }
        }
      }

    }
  }

  @keyframes enter-message {
    0% {
      opacity: 0;
      transform: translateY(1.5em);
    }
  }
</style>

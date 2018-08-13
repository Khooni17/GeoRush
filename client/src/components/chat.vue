<template>
  <div class="chat">
    <div class="chat-cont">
      <div class="chat-hat"><span style="font-family:Wingdings">&#42;</span> Чат (50)</div>
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
      name: "chat",
      data() {
        return {
          messages: [],
          textMessage: ''
        }
      },
      sockets: {
        newMessageToGlobalChat(message) {
          this.messages.push(message);
          setTimeout( () => {
            document.getElementById('chat-body').scrollTop = 99999;
          }, 0);
        },

        historyGlobalChat(messages){
          this.messages = messages;
        }
      },
      mounted () {
        this.$socket.emit('getHistoryGlobalChat');
      },
      methods: {
        sendMessage(){
          if(this.textMessage !== '') {
            this.$socket.emit('sendMessageToGlobalChat', {
              text : this.textMessage,
              username: this.$socket.id
            });
            this.textMessage = '';
          }
        }
      }
    }
</script>

<style scoped>
  .chat {
    background-color: #fff;
    height: 70vh;
    font-family: 'PT Serif', 'Roboto Slab', serif;
    border-radius: 1em;
  }  /*весь блок его размеры*/

  .chat-cont {
    height: 90%;
    width: 90%;
    margin: 5%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: left;
  } /*блок внутки для внутренних отступов и тут позиционирование*/
  ul {
    list-style: none;
    padding: 2%;
  }

  ul > li {
    animation: enter-message .3s ease-in-out;
    word-wrap: break-word;
  }

  #chat-body {
    height: 70%;
    overflow-y: auto;
    width: 100%;
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



  .chat-input {
    border-radius: 4vh;
    overflow: hidden;
    border: rgba(0, 0, 0, 0.4) solid 1px;
    width: 95%;
    height: 10%;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-items: normal;
  }

  .chat-input > input {
    padding: 2vh 0;
    outline: none;
    border: none;
    width: 90%;
    z-index: 2;
  }

  .chat-input > a {
    transform: rotate(90deg);
    background-color: #fff;
    padding: 2.5vh;
    z-index: 1;
    font-weight: bold;
    text-transform:uppercase;
    font-size: 1.1em;
    display: block;
    color: rgb(21, 84, 255);
    cursor: pointer;
  }

  .chat-input > a:active {
    transform: translateY(-3px) rotate(90deg);
    user-select: none;
    cursor: pointer;
  }

  .message-cont {
    height: auto;
    width: 100%;
    display: flex;
    flex-direction: row;
    align-items: start;
  }

  .user-and-text {
    width: 80%;
  }

  .userField {
    font-weight: bold;
    font-size: .7em;
  }

  .textField {
    font-size: .85em;
  }

  .dateField {
    padding: 3px;
    display: inline-block;
    width: auto;
    color: rgba(12, 6, 2, 0.31);
    font-size: .75em;
    user-select: none;
  }

  @keyframes enter-message {
    0% {
      opacity: 0;
      transform: translateY(1.5em);
    }
  }

</style>

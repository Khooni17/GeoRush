<template>
    <div class="container">
        <h1 class="main-head">ГДЕ ЭТО?</h1>
        <div class="main">
            <div class="left">
                <h3>{{textTask}}</h3>
                <label class="switch">
                    <input type="checkbox" @change="changeAnswerType">
                    <span class="slider round"></span>
                </label>
                <div class="task">
                    <div class="map-box" v-if="typeAnswer">
                        <google-map :name="'map'"
                                    v-if="showCart"
                                    :showAnswer="showAnswer"
                                    :answer="question.answer.location"
                            @setMarker="setMarker"
                        ></google-map>
                    </div>
                    <div class="variants" v-else>
                        <a  class="variant"
                            v-for="(variant,index) in variants"
                            :class="[answerUser === variant ? 'current' : '',
                                     showAnswer && answerUser === variant && variant !== question.answer.correctCountry ? 'wrong' : '',
                                     showAnswer && variant === question.answer.correctCountry ? 'current' : ''
                                     ]"
                            @click="chooseVariant(variant)"
                        >
                            <img src="src/img/check.png" alt="">
                            {{variant}}</a>
                    </div>
                </div>

            </div>
            <div class="right">
                <div class="answered">
                    <a class="answered-item"
                       v-for="(task,ind) in 10"
                       :class="ind < currentQuestion ? 'checked' : ''">
                    </a>
                </div>
                <div class="image-task">
                    <div class="img">
                        <transition name="image" >
                            <img
                                    v-if="question.photoURL"
                                    :src="question.photoURL" alt="">
                        </transition>
                    </div>
                </div>


                <button
                        :class="answerUser === '' ? 'disabled' : '' "
                        :disabled="answerUser === ''"
                        class="answer-button"
                        @click="answer"
                        v-if="!showAnswer"
                >Ответить</button>
                <button
                        v-else
                        class="answer-button"
                        @click="nextQuestion"
                >Следующий вопрос ></button>
            </div>
            <p class="answer-text" v-if="showAnswer">Правильный ответ : {{this.typeAnswer ? 'на карте' : question.answer.correctCountry }}
                <br>Результат: {{resultPoints}} баллов</p>
        </div>
        <div class="finish" v-if="gameFinished">
            <h1>Поздравляем</h1>
            <p>Ваш результат <i>{{totalPoints}}</i> баллов</p>
            <p> Можете сохранить свой результат, чтобы его увидели другие.
                Для этого введите никнейм:</p>

            <div class="save">
                <input type="text" v-model="nick" :disabled="saved">
                <button
                        :disabled="nick === '' && !saved"
                        :class="nick === '' && !saved ? 'disabled' : ''"
                    @click="saveNickname"
                >{{saveText}}</button>
            </div>
            <h2>топ 10 игроков:</h2>
            <div class="top">
                <ul>
                    <li class="player"
                        v-for="(p,ind) in topPlayers"
                        :style="nick === p.nick ? {background: 'lightgreen'} : ''"
                    >
                        <p>{{ind+1}}</p>
                        <p>{{p.nick}}</p>
                        <p>{{p.score}}</p>
                    </li>
                </ul>
            </div>
            <button
                @click="final"
            >Играть ещё</button>
        </div>
    </div>
</template>

<script>
    import  googleMap from './map';

    export default {
        name: "GameComponent",
        data(){
            return {
                typeAnswer: true,
                question: {},
                variants: [],
                showCart : true,
                currentQuestion: 0,
                answerUser: '',
                totalPoints: 0,
                gameFinished: false,
                showAnswer: false,
                topPlayers: [],
                nick: '',
                saveText: 'Сохранить',
                saved: false,
                textTask: "Указать на карте (1-999) баллов",
            }
        },
        created(){
            this.textTask = this.typeAnswer ? 'Угадать страну (0-100) баллов' : 'Указать на карте (1-999) баллов';
            this.getQuestion();
        },
        methods: {
            changeAnswerType(){
                this.answerUser = '';
                this.textTask = this.typeAnswer ? 'Угадать страну (0-100) баллов' : 'Указать на карте (1-999) баллов';
                this.typeAnswer = !this.typeAnswer;
            },
            chooseVariant(variant) {
                this.answerUser = variant;
            },
            answer(){
                this.$socket.emit('answer', {
                    question: this.question,
                    answerUser: this.answerUser,
                    typeAnswer: this.typeAnswer
                });
            },
            saveNickname(){
                this.$socket.emit('saveNick', {
                    nick : this.nick,
                    score: this.totalPoints
                });
            },
            nextQuestion(){
                this.currentQuestion++;
                if(this.currentQuestion === 10){
                    this.$socket.emit('getTopPlayers');
                } else {
                    this.getQuestion();
                }
            },
            setMarker(answer){
                this.answerUser = answer;
            },
            changePositionMarker (e) {
                this.positionMarker = e;
            },
            getQuestion() {
                this.answerUser = '';
                this.showCart = false;
                this.showAnswer = false;
                this.textTask = this.typeAnswer ? 'Указать на карте (1-999) баллов' : 'Угадать страну (0-100) баллов';
                this.$socket.emit('getQuestion');
            },
            final(){
                this.showAnswer = false;
                this.gameFinished = false;

                this.currentQuestion = 0;
                document.getElementsByClassName('main')[0].style.opacity = '';
                document.getElementsByClassName('main-head')[0].style.opacity = '';
                this.getQuestion();

            }
        },
        sockets: {
            onQuestion (question) {
                this.question = question;
                this.variants = question.variants;
                this.showCart = true;
            },
            resultAnswer(result){
                this.showAnswer = true;
                this.totalPoints += result.result;
                this.resultPoints = result.result;
            },
            topPlayersList(list){
                document.getElementsByClassName('main')[0].style.opacity = '.3';
                document.getElementsByClassName('main-head')[0].style.opacity = '.3';
                this.gameFinished = true
                this.topPlayers = list;
            },
            saved(list){
                this.topPlayers = list;
                this.saved = true;
                this.saveText = "Сохранено";
            }
        },
        components: {
            googleMap
        }
    }


</script>

<style lang="scss" scoped>
    $black: #000;
    $gray: #202020a8;

    .container {
        width: 90vw;
        height: 90vh;
        position: absolute;
        top: 5vh;
        left: 5vw;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: space-between;
        overflow: hidden;

        .main {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            width: 100%;
            height: 100%;

            .left {
                width: 40vw;
                height: 65%;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: space-around;

                h3 {
                    margin: 0;
                    font-size: 20px;
                    font-family: "Lucida Sans Unicode", "Lucida Grande", Sans-Serif;
                }
                .switch {
                    position: relative;
                    display: inline-block;
                    width: 60px;
                    height: 34px;

                    input {display:none;}

                    .slider {
                        position: absolute;
                        cursor: pointer;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        background-color: #0099ff;
                        -webkit-transition: .4s;
                        transition: .4s;
                    }
                    .slider:before {
                        position: absolute;
                        content: "";
                        height: 26px;
                        width: 26px;
                        left: 4px;
                        bottom: 4px;
                        background-color: white;
                        -webkit-transition: .4s;
                        transition: .4s;
                    }

                    input:checked + .slider {
                        background-color: #ccc;
                    }

                    input:focus + .slider {
                        box-shadow: 0 0 1px #2196F3;
                    }

                    input:checked + .slider:before {
                        -webkit-transform: translateX(26px);
                        -ms-transform: translateX(26px);
                        transform: translateX(26px);
                    }

                    /* Rounded sliders */
                    .slider.round {
                        border-radius: 34px;
                    }

                    .slider.round:before {
                        border-radius: 50%;
                    }
                }

                .task {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    width: 100%;
                    height: 70%;

                    .map-box {
                        width: 80%;
                        height: 90%;
                        .map {
                            width: 100%;
                            height: 100%;
                        }
                    }
                    .variants {

                        .variant {
                            display: block;
                            border-radius: 20px;
                            float: left;
                            margin: 3% 3%;
                            width: 15vw;
                            height: 3vw;
                            border: 1px solid #000;
                            line-height: 3.1vw;
                            text-align: center;
                            background: white;
                            font-family: "Lucida Sans Unicode", "Lucida Grande", Sans-Serif;
                            font-size: 14px;
                            user-select: none;

                            img {
                                display: none;
                            }

                            &:hover {
                                cursor: pointer;
                                border: 1px solid green;
                                box-shadow: 0 0 4px 0px green;
                            }
                        }

                        .wrong {
                            background: #ff0000;
                            color: white;

                            img {
                                display: none !important;

                            }

                            &:hover {
                                cursor: initial;
                                border: 1px solid #ff0000;
                                box-shadow: none;
                            }
                        }

                        .current {
                            position: relative;
                            border: 1px solid green;

                            img {
                                position: absolute;
                                left: 10%;
                                top: 27%;
                                width: 20px;
                                height: 20px;
                                display: block;
                            }
                        }
                    }
                }
            }



            .right {
                width: 40vw;
                height: 100%;
                display: flex;
                flex-direction: column;
                align-items: center;

                .answered {
                    width: 40%;
                    height: 10px;
                    display: flex;
                    cursor: pointer;
                    justify-content: space-between;
                    .answered-item {
                        display: block;
                        border: 1px solid #2c2c2c;
                        width: 7px;
                        height: 7px;
                        padding: 3px;
                        border-radius: 50%;
                        background: rgba(0, 153, 255, 0.53);
                    }

                    .checked {
                        background: rgba(120, 238, 120, 0.76);
                    }

                }

                .image-task {
                    .img {
                        overflow: hidden;
                        width: 44vw;
                        height: 52vh;
                        margin-right: 5vw;
                        border: 3px solid #928787;
                        box-shadow: 0px 0px 5px 1px #777;
                        margin-top: 3vw;

                        img {
                            object-fit: cover;
                            width: 100%;
                            height: 100%;
                        }
                    }

                }


                .disabled {
                    opacity: .5;
                }

                .answer-button {
                    border: 1px solid lightgreen;
                    margin-right: 5vw;
                    margin-top: 10vh;
                    width: 200px;
                    height: 40px;
                    border-radius: 20px;
                    background: #44a51a;
                    color: white;
                    cursor: pointer;
                    font-family: "Lucida Sans Unicode", "Lucida Grande", Sans-Serif;

                    &:focus {
                        outline: none;
                    }

                    &:active {
                        transform: translateX(5px);
                    }

                }
            }
        }

        .answer-text {
            position: absolute;
            left: 7%;
            text-align: center;
            bottom: -3%;
            font-family: 'PT Serif', 'Roboto Slab', serif;
            font-weight: 600;
            font-size: 27px;
        }

        .finish {
            width: 65vw;
            height: 80vh;
            border-radius: 10px;
            background: rgb(234, 230, 230);
            display: flex;
            flex-direction: column;
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            box-shadow: 0px 0px 8px 0px #000000;
            align-items: center;

            h1, h2 {
                width: 100%;
                text-align: center;
                margin:2vh 0;
            }

            p {
                margin: 1vh 0;
                font-size: 18px;
                width: 100%;
                text-align: center;
                font-weight: 600;

                i {
                    background: #d72c2c;
                    padding: 1% 2%;
                    font-style: normal;
                    color: white;
                }

            }

            .save {
                display: flex;
                align-items: center;
                width: 40%;
                margin: 0 auto;
                justify-content: space-around;

                input {
                    border: 1px solid gray;
                    margin-top: 2vh;
                    padding: 1vh 2vw;
                }

                button {
                    margin-left: 20px;
                    text-align: center;
                    margin-top: 3%;
                    border: none;
                    width: 30%;
                    cursor: pointer;
                    font-weight: 700;
                    color: #ffffff;
                    text-decoration: none;
                    padding: .8em 1em ;
                    border-radius: 3px;
                    background: rgb(64,199,129);
                    box-shadow: 0 -3px rgb(53,167,110) inset;
                    transition: 0.2s;

                    &:hover { background: rgb(53, 167, 110); }
                    &:active {
                        background: rgb(33,147,90);
                        box-shadow: 0 3px rgb(33,147,90) inset;
                    }
                }
                .disabled {
                    border: none;
                    cursor: initial;
                    box-shadow: none;
                    background: grey;
                    &:hover {
                        cursor: initial;
                        background: grey;
                        box-shadow: none;
                        border: none;
                    }
                }
            }


            .top {
                width: 60%;
                margin: 0 auto;
                height: 35%;
                overflow-y: scroll;

                &::-webkit-scrollbar {
                    width: 12px;
                }

                &::-webkit-scrollbar-track {
                    -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,0.3);
                    border-radius: 10px;
                }

                &::-webkit-scrollbar-thumb {
                    border-radius: 10px;
                    -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,0.5);
                }

                ul {
                    li {
                        list-style-type: none;
                        display: flex;
                        justify-content: space-around;
                        padding: 1% 0;
                        border-radius: 25px;
                        margin: 10px 0;
                        box-shadow: 0 0 3px 0 #000;

                        p {
                            width: 30%;
                            &:first-child {
                                text-align: left;
                            }

                            &:last-child {
                                text-align: right;
                            }

                            font-size: 17px;
                        }
                    }
                }
            }


            button {
                margin-top: 3%;
                border: none;
                width: 30%;
                cursor: pointer;
                font-weight: 700;
                color: #ffffff;
                text-decoration: none;
                padding: .8em 1em calc(.8em + 3px);
                border-radius: 3px;
                background: rgb(64,199,129);
                box-shadow: 0 -3px rgb(53,167,110) inset;
                transition: 0.2s;
                }
            button:hover { background: rgb(53, 167, 110); }
            button:active {
                background: rgb(33,147,90);
                box-shadow: 0 3px rgb(33,147,90) inset;
                }

        }
    }

    .image-enter-active, .image-leave-active {
        transition: all 0.3s;
    }

    .image-enter {
        transform: translateX(100%);
    }

    .image-leave-to {
        transform: translateY(100%) rotateX(90deg);
    }



</style>

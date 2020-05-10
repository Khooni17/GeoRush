<template>
    <div class="container">
        <div class="left">
            <h1>Попробуйте угадать, где была сделана фотография!</h1>
            <img src="src/img/start.jpg" alt="">
        </div>
        <div class="right">
            <a
                    @click="play"
                    href="" style="position: absolute;
                    top: 45%;
                    left: 70%;">Играть!</a>
        </div>
    </div>
</template>

<script>

    export default {
        name: "StartComponent",
        data() {
            return {
            }
        },
        methods: {
            play(){
                this.$router.push('/game')
            }
        }
    }
</script>

<style lang="scss" scoped>

    .container {
        user-select: none;
        height: 100vh;
        width: 100vw;
        padding: 0;
        margin: 0;
        display: flex;



        .left {
            width: 50%;
            background: white;
            height: 100%;

            H1 {
                text-align: right;
                font-family: "Lucida Sans Unicode", "Lucida Grande", Sans-Serif;
                font-size: 2.5em;
                width: 44vw;
                position: absolute;
                left: 5vw;
                top: 10%;
                z-index: 100;
                transform: translateZ(-100px);
                text-shadow: -1px -1px #464141,
                -2px -2px #464141,
                -1px 1px #464141,
                -2px 2px #464141,
                1px 1px #464141,
                2px 2px #464141,
                1px -1px #464141,
                2px -2px #464141,
                -3px -3px 2px #BBB,
                -3px 3px 2px #BBB,
                3px 3px 2px #BBB,
                3px -3px 2px #BBB;
                color: #fff;
                user-select: none;
                transition: all 1s;
            }
            H1:hover {
                color: yellowgreen;
            }

            img {
                z-index: 1;
                width: 100vw;
                height: 100vh;
                position: absolute;
                left: 0;
                top: 0;
                opacity: .45;
            }


        }

        .right {
            height: 100%;
            width: 70%;
            a {
                z-index: 10;
                text-decoration: none;
                outline: none;
                font-weight: 800;
                display: inline-block;
                padding: 15px 70px;
                margin: 10px 20px;
                position: relative;
                overflow: hidden;
                border: 2px solid white;
                border-radius: 8px;
                font-family: 'Montserrat', sans-serif;
                color: white;
                transition: .2s ease-in-out;
            }
            a:before {
                content: "";
                background: linear-gradient(90deg, rgba(255,255,255,.1), rgba(255,255,255,.5));
                height: 50px;
                width: 50px;
                position: absolute;
                top: -8px;
                left: -75px;
                transform: skewX(-45deg);
            }
            a:hover {
                background: #44a51a;
                color: #fff;
                border: 2px solid #ffffff;
                box-shadow: -3px 3px 3px #0e0e0e;
            }
            a:hover:before {
                left: 150px;
                transition: 2s ease-in-out;
            }

        }
    }
</style>

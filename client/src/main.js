import Vue from 'vue'
import App from './App.vue'
import router from './router'
import * as VueGoogleMaps from 'vue2-google-maps'
import VueSocketio from "vue-socket.io";


Vue.use(VueSocketio, 'http://localhost:7777');

Vue.use(VueGoogleMaps, {
    load: {
        key: 'AIzaSyA7pzYwhi0ylManeBGD0PkylWiljlaLY5Q'
    }
});

new Vue({
    el: '#app',
    router,
    render: h => h(App),
});


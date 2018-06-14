import Vue from 'vue'
import App from './App'
import router from './router'
import {store} from '@/store/store';

import { sync } from 'vuex-router-sync';
sync(store, router);


import BootstrapVue from 'bootstrap-vue';
import VueSocketio from 'vue-socket.io';
import Vuetify from 'vuetify';


Vue.use(VueSocketio, 'http://localhost:3000');
Vue.use(BootstrapVue);
Vue.use(Vuetify);

import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-vue/dist/bootstrap-vue.css';
// index.js or main.js
import 'vuetify/dist/vuetify.min.css'; // Ensure you are using css-loader



new Vue({
  el: '#app',
  router,
  store,
  components: { App },
  template: '<App/>'
});

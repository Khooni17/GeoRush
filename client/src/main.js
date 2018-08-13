import Vue from 'vue'
import App from './App'
import router from './router'
import {store} from '@/store/store';

import { sync } from 'vuex-router-sync';
sync(store, router);


import BootstrapVue from 'bootstrap-vue';
import VueSocketio from 'vue-socket.io';
import Vuetify from 'vuetify';


Vue.use(VueSocketio, 'http://localhost:7777');
/*Vue.use(BootstrapVue);
Vue.use(Vuetify);

import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-vue/dist/bootstrap-vue.css';*/
// index.js or main.js


new Vue({
  el: '#app',
  router,
  store,
  components: { App },
  template: '<App/>'
});

import Vue from 'vue'
import App from './App'
import router from './router'
import {store} from '@/store/store';

import { sync } from 'vuex-router-sync';
sync(store, router);

import VueSocketio from 'vue-socket.io';
Vue.use(VueSocketio, 'http://localhost:3000');


new Vue({
  el: '#app',
  router,
  store,
  components: { App },
  template: '<App/>'
});

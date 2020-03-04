
import Vue from 'vue';
import Router from 'vue-router';
import Start from '../components/StartComponent';
import Game from '../components/GameComponent';


Vue.use(Router);

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      component: Start,
      name: 'start'
    },
    {
      path: '/game',
      component: Game,
      name: 'game'
    }
  ]
})

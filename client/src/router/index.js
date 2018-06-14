
import Vue from 'vue';
import Router from 'vue-router';
import Lobby from '@/components/lobby';
import lobbiesListing from '@/components/lobbiesListing';
import Timer from '@/components/timer';
import Game from '@/components/game';


Vue.use(Router);

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      component: lobbiesListing,
      name: 'lobbiesListing'
    },
    {
      path: '/lobby/:lobbyID',
      component: Lobby,
      name: 'lobby'
    },
    {
      path: '/timer',
      component: Timer,
      name: 'timer'
    },
    {
      path: '/game',
      component: Game,
      name: 'game'
    }
  ]
})

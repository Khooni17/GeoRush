
import Vue from 'vue';
import Router from 'vue-router';
import Lobby from '@/components/lobby';
import lobbiesListing from '@/components/lobbiesListing';


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
    }
  ]
})

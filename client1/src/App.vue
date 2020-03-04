<template>
    <div id="app">
      <div class="container">
        <!--<my-header></my-header>-->
        <transition name="route" mode="out-in">
          <router-view style="z-index: 10;"/>
        </transition>
      </div>
    </div>
</template>

<script>
  import myHeader from '@/components/myHeader';

  export default {
    name: 'App',
    components: {
      myHeader
    }
  }
</script>

<style scoped>

  .container {
    font-family: 'PT Serif', 'Roboto Slab', serif;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-evenly;
  }


  .route-enter-active {
    animation: route-enter 0.7s ease-in;
  }

  .route-leave-active {
    animation: route-leave 0.7s ease-in;
  }

  @keyframes route-enter {
    0% {
      transform: translateX(100%);
    }
  }

  @keyframes route-leave {
    100% {
      transform: translateX(-100%);
    }
  }

</style>

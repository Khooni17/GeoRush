<template >

  <div class="google-map-result" id="appMapResult"></div>

</template >

<script >

  export default {
    name: 'mapResult',
    props: ['name', 'coordinates'],
    data() {
      return {
        positionMarker: null,
        marker: null,
        map: null
      }
    },
    mounted() {
      const element = document.getElementById('appMapResult');
      const options = {
        zoom: 4,
        center: this.coordinates,
        fullscreenControl: false,
        gestureHandling: 'greedy',
        keyboardShortcuts: false,
        mapTypeControl: false,
        mapTypeId: 'terrain',
        panControl: false,
        rotateControl: false,
        streetViewControl: false,
        styles: []
      };

      this.map = new google.maps.Map(element, options);

      console.log(this.coordinates);
      this.marker = new google.maps.Marker({
        position: this.coordinates,
        map: this.map,
        icon: 'http://s1.iconbird.com/ico/2013/8/408/w32h321375380982126.png'
      });
    }
  }
</script >

<style scoped >

  .google-map-result {
    width: 640px;
    height: 480px;
    margin: 0 auto;
    background: gray;
  }

</style >

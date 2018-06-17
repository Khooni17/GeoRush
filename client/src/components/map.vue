<template >

  <div class="google-map" id="appMap"></div>

</template >

<script >

  export default {
    name: 'map',
    props: ['name'],
    data() {
      return {
        positionMarker: null,
        marker: null,
        map: null
      }
    },
    mounted() {
      const element = document.getElementById('appMap');
      const options = {
        zoom: 1,
        center: new google.maps.LatLng(59.93, 30.32),
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

      this.map.addListener('click', (e) => {
        this.placeMarker(e.latLng);
      });

      // marker.setMap(null);  удаление маркера

    },
    methods: {
      placeMarker: function(position) {
        this.positionMarker = {
          lat: position.lat(),
          lng: position.lng()
        };

        if (this.marker == null) {
          this.marker = new google.maps.Marker({
            position: position,
            map: this.map,
            //icon: 'http://s1.iconbird.com/ico/0512/Blueberry/file1337256405.png'
            //icon: 'http://s1.iconbird.com/ico/0912/fugue/w16h161349012860pin.png'
            icon : 'http://s1.iconbird.com/ico/0512/BuildIcons/file1337197156.png'
          });
        } else {
          this.marker.setPosition(position);
        }
      }
    },
    watch: {
      positionMarker(){
        this.$emit('marker', this.positionMarker);
      }
    }
  }
</script >

<style scoped >

  .google-map {
    width: 640px;
    height: 480px;
    margin: 0 auto;
    background: gray;
  }

</style >

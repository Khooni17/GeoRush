<template>
    <div id="map">
        <gmap-map
                style="width: 500px; height: 300px; border-radius: 10px"
                :options="options"
                @click="setMarker"
        >
            <GmapMarker
                    :key="1"
                    :position="marker"
                    :clickable="true"
                    :draggable="true"
                    v-if="!showAnswer"
                    ref="answerUser"
            />
            <GmapMarker
                    :key="2"
                    v-if="showAnswer"
                    :position="answer"
                    :icon="'https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png'"
                    :clickable="true"
                    :draggable="false"
            />
        </gmap-map>
    </div>
</template>

<script>
    export default {
        props: ['answer','showAnswer'],
        data() {
            return {
                marker: {
                    lat: '',
                    lng: ''
                }
            }
        },
        methods: {
            setMarker(event){
                this.marker.lat = event.latLng.lat();
                this.marker.lng = event.latLng.lng();


                this.$emit('setMarker', {
                    lat : event.latLng.lat(),
                    lng : event.latLng.lng()
                })
            }
        },
        computed: {
            options(){
                return {
                    center: {
                        lat:  this.showAnswer ? this.answer.lat : 10.0,
                            lng:  this.showAnswer ? this.answer.lng : 10.0,
                    },
                    zoom: this.showAnswer ? 7 : 1,
                        fullscreenControl: false,
                    gestureHandling: 'greedy',
                    keyboardShortcuts: false,
                    mapTypeControl: false,
                    mapTypeId: 'terrain',
                    panControl: false,
                    rotateControl: false,
                    streetViewControl: false,
                    styles: []
                }
            }
        }
    }
</script>

<style>
    #map {
        overflow: hidden;
        border-radius: 35px;
        box-shadow: 0 0 3px 0 #000000;
    }

</style>
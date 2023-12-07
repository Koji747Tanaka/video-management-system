<template>
  <div class="text-center video-container ml-10">
    <video-player id='video' class="video-player"></video-player>
    <div>{{ name }}</div>
  </div>
</template>

<script setup>
import { onUpdated, ref } from "vue";
import VueVideoPlayer from '@videojs-player/vue'
import 'video.js/dist/video-js.css'
import Hls from "hls.js";

const props = defineProps({
  videoUrl: String,
  name: String,
});

var videoSrc = props.videoUrl.value;
console.log("video sorce", videoSrc);
var hls = new Hls();

onUpdated(() => {
  var video = document.getElementById("video");
  hls.loadSource(props.videoUrl);
  console.log("props.vidoURl is here", props.videoUrl);
  hls.attachMedia(video);
});
</script>
<style>

.video-container {
  width: 640px; /* Fixed width */
  height: 360px; /* Fixed height */
}

.video-player {
  width: 100%;
  height: 100%;
}
</style>

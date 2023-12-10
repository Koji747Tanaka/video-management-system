<template>
  <div class="text-center ml-10">
    <video id="video" class="video-container" controls playsinline loop></video>
    <br>
    {{ name }}
  </div>
</template>

<script setup>
import { ref, onUpdated } from "vue";
import Hls from "hls.js";

const props = defineProps({
  videoUrl: String,
  name: String,
});

// const videoSrc = ref(props.videoUrl.value);
var hls = new Hls();

onUpdated(() => {
  var video = document.getElementById("video");
  hls.loadSource(props.videoUrl);
  hls.attachMedia(video);
});

</script>
<style>

.video-container {
  width: 640px; 
  height: 360px;
}
</style>

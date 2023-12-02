<template>
  <div>
    <video id="video" controls playsinline loop></video>
  </div>
</template>

<script setup>
import { onUpdated } from "vue";
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
video {
  width: 530px;
  height: 300px;
  object-fit: contain;
}
</style>

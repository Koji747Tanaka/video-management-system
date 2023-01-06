<template>
  <div>
    <div>
      <video id="video" controls playsinline loop></video>
      <!-- <button @click="videoPlay">video play</button> -->
      <!-- <span>{{ props.videoUrl }}</span> -->
    </div>
  </div>
</template>

<script setup>
// import { ref } from 'vue'
import axios from "axios";
import { userAuthStore } from "../store/auth.store.js";
import router from "../router";
import { ref, reactive, onMounted, onUpdated } from "vue";
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
  width: 90%;
  max-width: 500px;
  max-height: 300px;
}
</style>

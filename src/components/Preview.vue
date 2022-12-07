<template>
    <div>
        <div>
            <video id="video" controls muted autoplay playsinline loop></video>
            <button @click="videoPlay">video play</button>
        </div>
    </div>
</template>

<script setup>
// import { ref } from 'vue'
import axios from "axios"
import { userAuthStore } from '../store/auth.store.js'
import router from '../router';
import Hls from "hls.js";

const videoSrc = "https://localhost:3000/yayoi/yayoi.m3u8";
console.log("video sorce", videoSrc);

const videoPlay = () => {
    var video = document.getElementById('video');
    var hls = new Hls();
    hls.loadSource(videoSrc);
    hls.attachMedia(video);
    video.play();
}


</script>
<style>

</style>
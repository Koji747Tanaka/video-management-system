<template>
  <v-card>
    <div class="text-center">
    <video id="video" class="video-container mt-5" controls playsinline loop></video>
    <v-row class="mt-1 mb-1">
      <v-col class="ml-10" cols="6">
        <div class="text-left">
          {{ previewName }}
        </div>
      </v-col>
      <v-col  class="ml-7">
        <v-tooltip :text="$t('delete_video')" location="top">
          <template v-slot:activator="{ props }">
              <v-btn v-bind="props" @click="deleteVideo">DELETE</v-btn>
          </template>
        </v-tooltip>  
      </v-col>
      <v-col>
        <div class="text-right mr-9" >
        <v-tooltip :text="$t('download_scorm')" location="top">
          <template v-slot:activator="{ props }">
              <v-btn v-bind="props" @click="downloadScorm">DOWNLOAD</v-btn>
          </template>
        </v-tooltip>
      </div>
      </v-col>
    </v-row>
  </div>
  </v-card>
  
</template>

<script setup>
import { ref, onUpdated } from "vue";
import Hls from "hls.js";
import { defineEmits } from 'vue';

const emit = defineEmits(['downloadScorm', 'deleteVideo']);
const props = defineProps({
  videoUrl: String,
  previewName: String,
  uniqueName: String
});

let hls = new Hls();
onUpdated(() => {
  let video = document.getElementById("video");
  hls.loadSource(props.videoUrl);
  hls.attachMedia(video);
});

const downloadScorm=()=>{
    emit('downloadScorm', props.uniqueName)
}

const deleteVideo =()=>{
  emit('deleteVideo', props.uniqueName)
}

</script>
<style>

.video-container {
  width: 640px; 
  height: 380px;
}
</style>

<template>
  <v-card>
    <div class="text-center">
      <video id="video" class="video-container mt-5" controls playsinline loop></video>
      <v-row class="mt-1 mb-1">
        <v-col class="ml-10" cols="7">
          <div class="text-left">
            Lecture: {{ previewName }}
          </div>
        </v-col>
        <v-col cols="4" class="d-flex justify-end pr-7">
          <v-tooltip :text="$t('delete_video')" location="top">
            <template v-slot:activator="{ props }">
              <v-btn v-bind="props" @click="deleteVideo" class="mr-2" color="pink">DELETE</v-btn>
            </template>
          </v-tooltip>
          <v-tooltip :text="$t('download_scorm')" location="top">
            <template v-slot:activator="{ props }">
              <v-btn v-bind="props" @click="downloadScorm" color="primary">DOWNLOAD</v-btn>
            </template>
          </v-tooltip>
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

<template>
    <v-card>
        <v-img height="200" :src="props.video.thumbUrl" cover> </v-img>
        <v-row class="pt-3">
            <v-col>
                <div>{{ props.video.videoName }}</div>
            </v-col>
        </v-row>
        <v-row class="pt-3 pb-3">
            <v-col class="d-flex justify-end">
                <v-tooltip :text="$t('preview_lect')" location="top">
                    <template v-slot:activator="{ props }">
                        <v-btn v-bind="props" color="indigo" class="mr-2" @click="
                            setVideo(
                                videoUrl,
                                uniqueName,
                                videoName
                            )
                            ">Preview</v-btn>
                    </template>
                </v-tooltip>
                <v-tooltip :text="$t('download_scorm')" location="top">
                    <template v-slot:activator="{ props }">
                        <v-btn v-bind="props" color="primary" class="mr-2" @click="downloadScorm">Download</v-btn>
                    </template>
                </v-tooltip>
            </v-col>
        
        </v-row>
    </v-card>
</template>

<script setup>
import { ref } from "vue";
import axios from "axios";
import { defineEmits } from 'vue';
const props = defineProps({
    video: Object,
});
const emit = defineEmits(['setPreviewVideo', 'downloadScorm']);
const videoUrl = props.video.videoUrl
const uniqueName = props.video.uniqueName
const videoName = props.video.videoName

const BASE_URL = import.meta.env.VITE_SERVER_URL;
const sourceFolderName = ref("");
const previewName = ref("Click a video");
const previewUrl = ref("");

const downloadScorm=()=>{
    emit('downloadScorm', uniqueName)
}

const setVideo = (videoUrl, uniqueName, videoName) => {
    previewUrl.value = videoUrl;
    sourceFolderName.value = uniqueName;
    previewName.value = videoName;
    emit('setPreviewVideo', {videoUrl, uniqueName, videoName})
    scrollUp();
};

const scrollUp = () => {
    window.scrollTo({
        top: 0,
        behavior: "smooth",
    });
};
</script>

<style></style>

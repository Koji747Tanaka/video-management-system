<template>
  <v-container fluid>
    <v-row class="text-left mt-5 pl-2">
      <v-col cols="6" >
        <v-row>
          <v-col cols="12" class="text-left mb-0 pb-0">
            <v-file-input
            ref="file"
            :label="$t('input_lecture_recording')"
            ></v-file-input>
          </v-col>
        </v-row>
        <v-row>
          <v-col class="text-right mt-0 pt-0">
            <v-tooltip :text="$t('hls_cov_message')" location="top">
              <template v-slot:activator="{ props }">
                <v-btn v-bind="props" @click="sendFile" color="teal">{{ $t("submit") }}</v-btn>
              </template>
            </v-tooltip>
          </v-col>
        </v-row>
        <v-row class="mt-20">
          <v-col class="pl-8" cols="4">
            <v-progress-circular :rotate="360" :size="180" :width="25" :model-value="progressValue" color="teal">
              <template v-slot:default> {{ progressValue }} % </template>
            </v-progress-circular>
          </v-col>
          <v-col cols="8">
            <v-sheet
              max-width="600"
              rounded="lg"
              width="100%"
              height="100%"
              color="#F5F5F5"
              class="pa-4 text-center mx-auto"
            >
            <div style="color: darkgrey;">
              <h5 class="text-h6 font-weight-bold mb-4" >Video Conversion</h5>
              <p class="mb-4 text-medium-emphasis text-body-2 text-left">
                After submitting the video, it may take a significant amount of time to process it into a streamable format.
              <br>
                Even if you close the page, the process will continue in the background.
              </p>
            </div>
          </v-sheet>
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <v-sheet
              rounded="lg"
              width="100%"
              color="#F5F5F5"
              class="pa-4 text-center mx-auto"
            >
            <div style="color: darkgrey;">
              <h5 class="text-h6 font-weight-bold mb-4" >Moodle Upload</h5>
              <p class="mb-4 text-medium-emphasis text-body-2 text-left">
                Once the conversion finishes, please preview the lecture recording and download the SCORM package. Then you can upload it on Moodle.
              </p>
            </div>
          </v-sheet>
          </v-col>
        </v-row>
        
      </v-col>
      <v-col cols="6" class="pr-6">
        <Preview :videoUrl="previewUrl" :previewName="previewName" :uniqueName="sourceFolder" @downloadScorm="scormDownload" @deleteVideo="deleteVideo"/>
      </v-col>
    </v-row>
    <v-divider class="mt-16" :thickness="3"></v-divider>
    <v-row class="pt-6 pl-2">
      <v-col cols="6">
        <v-text-field
        :label="$t('search')"
        @input="searchVideo"
        v-model="search"
        hide-details
        prepend-icon="mdi-magnify"
        single-line
      ></v-text-field>
      </v-col>
    </v-row>
    <v-row class="pl-2 pr-3">
      <template v-for="video in videos">
        <v-col cols="4">
          <ThumbnailCard :video="video" @setPreviewVideo="setPreviewVideo" @downloadScorm="scormDownload"/>
        </v-col>
      </template>
      
    </v-row>
  </v-container>

  <v-dialog v-model="showDialog" persistent max-width="300px">
  <v-card>
    <v-card-title class="headline">Confirm Delete</v-card-title>
    <v-card-text>
      Are you sure you want to delete this video?
    </v-card-text>
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn color="green darken-1" text @click="showDialog = false">Cancel</v-btn>
      <v-btn color="green darken-1" text @click="confirmDelete">Delete</v-btn>
    </v-card-actions>
  </v-card>
</v-dialog>

</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from "vue";
import axios from "axios";
import io from 'socket.io-client';
import { userAuthStore } from "../store/auth.store.js";
import ThumbnailCard from "./ThumbnailCard.vue";
import Preview from "./Preview.vue";

const BASE_URL = import.meta.env.VITE_SERVER_URL;
const file = ref("");
const sourceFolder = ref("");
const previewName = ref("Click a video");
let videos = ref([]);
let videoFullList = ref([]);

const previewUrl = ref("");
const folderNameZip = ref("");
const search = ref("");
const socket = io(BASE_URL);
const progressValue = ref(0);
const showDialog = ref(false);
const nameToDelete = ref(null);

watch(progressValue, async(newVal, oldVal) =>{
  if (newVal == 100){
    updateThumbnails();
    setTimeout(() => {
      progressValue.value =0
    }, 1000)
  }
})

const scormDownload = (uniqueName) => {
    const options = {
        url: BASE_URL + "/scorm",
        method: "POST",
        data: {
            sourceFolderName: uniqueName,
        },
        responseType: "arraybuffer",
        headers: { Accept: "application/zip" },
    };

    axios(options)
        .then((response) => {
                const blob = new Blob([response.data], { type: "application/zip" });
                const link = document.createElement("a");
                link.href = window.URL.createObjectURL(blob);
                link.download = uniqueName; 
                link.click();
            })
            .catch((error) => {
                console.error("Error downloading SCORM package:", error);
            });
};
const deleteVideo = (uniqueName) => {
  nameToDelete.value = uniqueName;
  showDialog.value = true;
};

const confirmDelete = () => {
  const options = {
    url: BASE_URL + "/delete",
    method: "DELETE",
    data: {
      videoName: nameToDelete.value,
    }
  };

  axios(options)
    .then((response) => {
      if(response.data.success == true){
        updateThumbnails();
      }
      showDialog.value = false; // Close the dialog
    })
    .catch((error) => {
      console.error("Error deleting", error);
    });
};

onMounted(() => {
  updateThumbnails();

  socket.on('connect', () => {
        // console.log('Connected to the server');
      });
      socket.on('progressUpdate', (data) => {
        progressValue.value = data.progress;
      });
});

onUnmounted(() => {
  socket.disconnect();
});

const searchVideo = () => {
  if (search.value != "") {
    videos.value = [];
    videoFullList.value.forEach((video) => {
      if (video.videoName.startsWith(search.value)) {
        videos.value.push(video);
      }
    });
  } else {
    videos.value = videoFullList.value;
  }
};

const updateThumbnails = () => {
  videos.value = [];
  videoFullList.value = [];
  const authStore = userAuthStore();
  axios
    .get(BASE_URL + "/videoThumbnails", {
      params: { userID: authStore.$state.userid },
    })
    .then((res) => {
      if (res.data.success == true) {
        let objects = res.data.objects;
        objects.forEach((object) => {
          videos.value.unshift(object);
          videoFullList.value.unshift(object);
        });
        let videoUrl = videos.value[0].videoUrl;
        let uniqueName = videos.value[0].uniqueName;
        let videoName = videos.value[0].videoName;
        setVideo(videoUrl, uniqueName, videoName);
      } else {
        console.log("Response is here: ", res.data);
      }
    });
};
const sendFile = async () => {
  const myFiles = file.value.files;
  const formData = new FormData();
  Object.keys(myFiles).forEach((key) => {
    formData.append(myFiles.item(key).name, myFiles.item(key));
  });

  const options = {
    url: BASE_URL + "/convert",
    method: "POST",
    data: formData,
    withCredentials: true, 
  };

  axios(options).then((res) => {
    const {success} = res.data
    if (success != true){
      console.log("Error")
    }
    // else{
    //   console.log(res.data.message)
    // }
  });
};

const setVideo = (videoUrl, uniqueName, videoName) => {
  previewUrl.value = videoUrl;
  sourceFolder.value = uniqueName;
  folderNameZip.value = videoName;
  previewName.value = videoName;
  scrollUp()
};

const setPreviewVideo = ({videoUrl, uniqueName, videoName}) =>{
  setVideo(videoUrl, uniqueName, videoName)
}

const scrollUp = () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
}
</script>

<style>

</style>

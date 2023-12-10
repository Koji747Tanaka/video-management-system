<template>
  <v-container fluid>
    <v-row class="text-left mt-5 pl-6">
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
        <v-row class="mt-15">
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
              color="#dfd"
              class="pa-4 text-center mx-auto"
            >
            <div style="color: teal;">
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
        
      </v-col>
      <v-col cols="6" >
        <Preview :videoUrl="previewUrl" :name="previewName"/>
      </v-col>
    </v-row>
    <v-divider class="mt-16" :thickness="3"></v-divider>
    <v-row class="pt-6 pl-6">
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
    <v-row class="pl-6">
      <template v-for="video in videos">
        <v-col cols="4">
          <ThumbnailCard :video="video"/>
        </v-col>
      </template>
      
    </v-row>
  </v-container>

</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";
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
const progressValue = ref(0);

onMounted(() => {
  updateThumbnails();
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

let fileWithEx = "";
let videoUrl = "";
let uniqueName = "";
let videoName = "";
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
    // console.log("response is here ", res.data);
    const {uniqueName, videoUrl, videoName} = res.data
    // console.log("uniqueName", uniqueName)
    updateThumbnails();
    setVideo(videoUrl, uniqueName, videoName);
  });




  // axios.post(BASE_URL + "/convert", formData).then((res) => {
  //   console.log({ res });
  //   if (res.data.success == true) {
  //     axios.get(BASE_URL + "/ffmpeg").then((res) => {
  //       if (res.data.success == true) {
  //         open()

  //         console.log("ffmpeg res is here", res.data);
  //         const options = {
  //           url: BASE_URL + "/videoDatabase",
  //           method: "POST",
  //           data: {
  //             userID: authStore.$state.userid,
  //             videoName: res.data.videoName,
  //             uniqueName: res.data.uniqueName,
  //           },
  //         };
  //         fileWithEx = "/" + res.data.uniqueName + ".m3u8";
  //         videoUrl = res.data.videoUrl + res.data.uniqueName + fileWithEx;
  //         uniqueName = res.data.uniqueName;
  //         console.log("before res.data video")
  //         videoName = res.data.videoName;

  //         console.log("after res.data video")
  //         axios(options).then((res) => {
  //           console.log("response is here ", res.data);
  //           updateThumbnails();
  //           setVideo(videoUrl, uniqueName, videoName);
  //         });

  //       } else {
  //         error_message()
  //       }
  //     });
  //   }
  // });
};

const open = () => {
  ElMessage({
    showClose: true,
    message: '動画変換が完了しました',
    type: 'success',
  })
}
const error_message = () => {
  ElMessage({
    showClose: true,
    message: "予期せぬエラーが発生しました。ブラウザをリフレッシュして動画を再アップロードしてください。",
    type: 'error',
  })

  // ElMessage("予期せぬエラーが発生しました。ブラウザをリフレッシュして動画を再アップロードしてください。")
}
const scormDownload = () => {
  const options = {
    url: BASE_URL + "/scormProperty",
    method: "POST",
    data: {
      scormName: folderNameZip.value,
      sourceFolder: sourceFolder.value,
    },
  };

  axios(options).then((res) => {
    // console.log("res data success here", res.data.success);
    if (res.data.success) {
      axios
        .post(BASE_URL + "/scorm", {
          responseType: "arraybuffer",
          headers: { Accept: "application/zip" },
        })
        .then((res) => {
          var file = res;
          // console.log(res);
          const blob = new Blob([file], { type: "application/zip" });
          const uri = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.download = folderNameZip.value;
          link.href = uri;
          link.click();
        });
    } else {
      console.log("Scorm property root has a problem");
    }
  });
};

const setVideo = (videoUrl, uniqueName, videoName) => {
  // console.log(videoUrl);
  // console.log(videoName);
  previewUrl.value = videoUrl;
  sourceFolder.value = uniqueName;
  folderNameZip.value = videoName;
  previewName.value = videoName;

  scrollUp()
};

const scrollUp = () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
}
</script>

<style>
.el-row {
  margin-bottom: 20px;
}

.videoDiv {
  cursor: pointer;
}

.round-image {
  border-radius: 10%;
}

.bottom-line {
  border-bottom: 2px dashed #dcdcdc;
}

.message {
  color: #808080
}

.fixed-button {
  position: fixed;
  bottom: 60px;
  right: 60px;
}
</style>

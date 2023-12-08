<template>
  <v-container fluid >
    <v-row class="text-left mt-5">
      <v-col cols="6" class="pl-6">
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
          <v-col class="pl-9" cols="4">
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
    <v-row>
      
    </v-row>
  </v-container>


  <!-- <el-container>

            </el-col>
          </el-row>
          <el-row>
            <el-col :span="5" align="left">
              変換処理{{ progressValue }}%終了:
            </el-col>
            <el-col :span="15">
              <el-progress :text-inside="true" :stroke-width="24" :percentage="progressValue" status="success" />
            </el-col>
          </el-row>
          <el-row style="margin-bottom: 30px">
            <el-col class="bottom-line" :span="20">
            </el-col>

          </el-row>
          <el-row>
            <el-col :span="12" align="left">
              <el-form style="max-width: 460px">
                <el-form-item label="SCORM パッケージ名:">
                  <el-input placeholder="Zip ファイル名" v-model="folderNameZip" />
                </el-form-item>
              </el-form>
            </el-col>
            <el-col :span="12">
              <el-tooltip content="選択されたSCORMパッケージがダウンロードされます" placement="top" effect="light">
                <el-button @click="scormDownload">ダウンロード</el-button>
              </el-tooltip>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="20" align="left">
              <div class="message">
                <p>*動画一覧から選択されたSCORMパッケージがダウンロードされます。そのパッケージをMoodleの 「活動」 → 「SCORMパッケージ」で追加することが可能です。 </p>

              </div>
            </el-col>
          </el-row>

        </el-col>
        <el-col :span="10" align="right">
          <div>
            <Preview :videoUrl="previewUrl" align="right" />
            <div align="center">
              {{ previewName }}
            </div>
          </div>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="2">
          <span>動画検索:</span>
        </el-col>
        <el-col :span="5" align="left">
          <el-input v-model="search" />
        </el-col>
        <el-col :span="2">
          <el-button @click="searchVideo">検索</el-button>
        </el-col>
      </el-row>
      <el-row style="padding-right: 10px" :gutter="10">
        <template v-for="video in videos">
          <el-col :span="6">
            <div @click="
              setVideo(video.videoUrl, video.uniqueName, video.videoName)
            ">
              <el-tooltip content="動画をクリックするとプレビュー画面に表示・次ダウンロード動画としてセットされます" placement="top" effect="light">
                <el-image style="height: 200px" :src="video.thumbUrl" class="videoDiv round-image" /><br />
              </el-tooltip>
              <span>{{ video.videoName }}</span><br /><br />
            </div>
          </el-col>
        </template>
      </el-row>
    </el-main>
  </el-container>

  <div class="fixed-button">
    <el-icon>
      <el-button @click="scrollUp" type="success" size="large" circle>
        <Top />
      </el-button>
    </el-icon>
  </div> -->

</template>

<script setup>
import { ref, reactive, onMounted, onUpdated } from "vue";
import axios from "axios";
import { userAuthStore } from "../store/auth.store.js";
import Preview from "./Preview.vue";
// import io from "socket.io-client";

const BASE_URL = import.meta.env.SERVER_URL;
// const io = require('socket.io-client');
const authStore = userAuthStore();
const file = ref("");
const sourceFolder = ref("");
const previewName = ref("Click a video");
let videos = ref([]);
let videoFullList = ref([]);

const previewUrl = ref("");
const folderNameZip = ref("");
const search = ref("");
const progressValue = ref(0);
// const socket = io(BASE_URL);

onMounted(() => {
  updateThumbnails();
  // console.log("videos[-1].videoUrl", videos[0].value.videoUrl)
  // setVideo(videos[-1].videoUrl, videos[-1].uniqueName, videos[-1].videoName);
});

// socket.on("connect", (msg) => {
//   console.log("socket.id", socket.id);
//   console.log("接続できた?", socket.connected);
// });

// // Serverからメッセージを受信
// socket.on("xxx", (data) => {
//   console.log(`type: ${typeof data}   data: ${data.message}`);
//   progressValue.value = data.message;
// });

const searchVideo = () => {
  console.log(search.value);
  if (search.value != "") {
    videos.value = [];
    videoFullList.value.forEach((video) => {
      console.log(video.videoName);
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
        console.log(res.data.objects);

        var objects = res.data.objects;
        objects.forEach((object) => {
          videos.value.unshift(object);
          videoFullList.value.unshift(object);
        });

        let videoUrl = videos.value[0].videoUrl;
        let uniqueName = videos.value[0].uniqueName;
        let videoName = videos.value[0].videoName;
        setVideo(videoUrl, uniqueName, videoName);
        console.log("videos[-1].videoUrl", videos.value[videos.value.length - 1].videoUrl)

      } else {
        console.log("Response is here: ", res.data);
      }
    });
};

var fileWithEx = "";
var videoUrl = "";
var uniqueName = "";
var videoName = "";
const sendFile = async () => {
  const myFiles = file.value.files;
  const formData = new FormData();
  Object.keys(myFiles).forEach((key) => {
    formData.append(myFiles.item(key).name, myFiles.item(key));
  });
  console.log("This file is gonna be sent", file.value.files[0]);
  console.log("form data", formData);

  axios.post(BASE_URL + "/convert", formData).then((res) => {
    console.log({ res });
    if (res.data.success == true) {
      axios.get(BASE_URL + "/ffmpeg").then((res) => {
        if (res.data.success == true) {
          open()

          console.log("ffmpeg res is here", res.data);
          const options = {
            url: BASE_URL + "/videoDatabase",
            method: "POST",
            data: {
              userID: authStore.$state.userid,
              videoName: res.data.videoName,
              uniqueName: res.data.uniqueName,
            },
          };
          fileWithEx = "/" + res.data.uniqueName + ".m3u8";
          videoUrl = res.data.videoUrl + res.data.uniqueName + fileWithEx;
          uniqueName = res.data.uniqueName;
          console.log("before res.data video")
          videoName = res.data.videoName;

          console.log("after res.data video")
          axios(options).then((res) => {
            console.log("response is here ", res.data);
            updateThumbnails();
            setVideo(videoUrl, uniqueName, videoName);
          });

        } else {
          error_message()
        }
      });
    }
  });
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
    console.log("res data success here", res.data.success);
    if (res.data.success) {
      axios
        .post(BASE_URL + "/scorm", {
          responseType: "arraybuffer",
          headers: { Accept: "application/zip" },
        })
        .then((res) => {
          var file = res;
          console.log(res);
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
  console.log(videoUrl);
  console.log(videoName);
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

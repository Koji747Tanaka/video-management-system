<template>
  <el-container>
    <el-main style="margin: 20px">
      <el-row :gutter="20" style="margin-bottom: 80px">
        <el-col :span="13" style="padding-left: 15px">
          <el-row justify="start">
            <el-col :span="12" align="left">
              <input ref="file" v-on:change="handleFileUpload()" type="file" />
            </el-col>
            <el-col :span="8" align="right">
              <el-button @click="sendFile">セグメント化</el-button>
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
          <el-row>
            <el-col :span="12" align="left">
              <el-form style="max-width: 460px">
                <el-form-item label="SCORM パッケージ名:">
                  <el-input placeholder="Zip ファイル名" v-model="folderNameZip" />
                </el-form-item>
              </el-form>
            </el-col>
            <el-col :span="12">
              <el-button @click="scormDownload">ダウンロード</el-button>
            </el-col>
          </el-row>

        </el-col>
        <el-col :span="10" align="center">
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
      <el-row :gutter="10">
        <template v-for="video in videos">
          <el-col :span="6">
            <div @click="
              setVideo(video.videoUrl, video.uniqueName, video.videoName)
            ">
              <!-- <span>{{ video.videoName }}</span><br /> -->
              <el-image style="height: 200px" :src="video.thumbUrl" class="videoDiv round-image" /><br />
              <span>{{ video.videoName }}</span><br />
            </div>
          </el-col>
        </template>
      </el-row>
    </el-main>
  </el-container>
</template>

<script setup>
import { ref, reactive, onMounted, onUpdated } from "vue";
import axios from "axios";
import { userAuthStore } from "../store/auth.store.js";
import router from "../router";
import Preview from "./Preview.vue";
import io from "socket.io-client";

// const BASE_URL = "https://13.230.214.179:3000";
const BASE_URL = "https://localhost:3000";
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
const socket = io(BASE_URL);

onMounted(() => {
  updateThumbnails();
});

socket.on("connect", (msg) => {
  console.log("socket.id", socket.id);
  console.log("接続できた?", socket.connected);
});

// Serverからメッセージを受信
socket.on("xxx", (data) => {
  console.log(`type: ${typeof data}   data: ${data.message}`);
  progressValue.value = data.message;
});

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
          videos.value.push(object);
          videoFullList.value.push(object);
        });
      } else {
        console.log("Response is here: ", res.data);
      }
    });
};

var fileWithEx = "";
var videoUrl = "";
var uniqueName = "";
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
        axios(options).then((res) => {
          console.log("response is here ", res.data);
          updateThumbnails();
          setVideo(videoUrl, uniqueName);
        });
      });
    }
  });
};

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

  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
};
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
</style>

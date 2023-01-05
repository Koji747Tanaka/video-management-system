<template>
  <el-container>
    <el-main>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-row>
            <el-col :span="12">
              <input ref="file" v-on:change="handleFileUpload()" type="file" />
            </el-col>
            <el-col :span="12">
              <el-button @click="sendFile">セグメント化</el-button>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="2" />
            <el-col :span="12">
              <el-progress
                :text-inside="true"
                :stroke-width="24"
                :percentage="progressValue"
                status="success"
              />
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form label-width="160px" style="max-width: 460px">
                <el-form-item label="SCORM パッケージ名">
                  <el-input
                    placeholder="Zip ファイル名"
                    v-model="folderNameZip"
                  />
                </el-form-item>
              </el-form>
            </el-col>
            <el-col :span="12">
              <el-button @click="scormDownload">ダウンロード</el-button>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="4">
              <span> search </span>
            </el-col>
            <el-col :span="8">
              <el-input v-model="search" />
            </el-col>
            <el-col :span="12">
              <el-button @click="searchVideo">検索</el-button>
            </el-col>
          </el-row>
        </el-col>
        <el-col :span="12">
          {{ previewName }}
          <Preview :name="name" :videoUrl="previewUrl" />
        </el-col>
      </el-row>

      <el-row :gutter="10">
        <template v-for="video in videos">
          <el-col :span="6">
            <div
              @click="
                setVideo(video.videoUrl, video.uniqueName, video.videoName)
              "
            >
              <span>{{ video.videoName }}</span
              ><br />
              <el-image
                style="height: 200px"
                :src="video.thumbUrl"
                class="videoDiv"
              />
            </div>
          </el-col>
        </template>
      </el-row>
    </el-main>
  </el-container>

  <el-container> </el-container>
</template>

<script setup>
import { ref, reactive, onMounted, onUpdated } from "vue";
import axios from "axios";
import { userAuthStore } from "../store/auth.store.js";
import router from "../router";
import Preview from "./Preview.vue";
import io from "socket.io-client";

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
const socket = io("https://localhost:3000");

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
  const API_URL = "https://localhost:3000/";
  const authStore = userAuthStore();

  axios
    .get(API_URL + "videoThumbnails", {
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

  axios.post("https://localhost:3000/convert", formData).then((res) => {
    console.log({ res });
    if (res.data.success == true) {
      console.log("test try");
      //////////////////////////test////////////////////////////////
      axios.get("https://localhost:3000/ffmpeg").then((res) => {
        console.log("ffmpeg res is here", res.data);
        const options = {
          url: "https://localhost:3000/videoDatabase",
          method: "POST",
          data: {
            userID: authStore.$state.userid,
            videoName: res.data.videoName,
            uniqueName: res.data.uniqueName,
          },
        };

        console.log("video Url ", res.data.videoUrl);
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
    url: "https://localhost:3000/scormProperty",
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
        .post("https://localhost:3000/scorm", {
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
</style>

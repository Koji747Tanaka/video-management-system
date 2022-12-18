<template>
    <el-container>
        <el-main>
            <el-row>
                <el-col :span="6">
                    <input ref="file" v-on:change="handleFileUpload()" type="file" />
                </el-col>
                <el-col :span="6">
                    <el-button @click="sendFile">セグメント化</el-button>
                </el-col>
                <el-col :span="12">
                    {{ folderNameZip }}
                    <Preview :name="name" :videoUrl="previewUrl" />
                </el-col>
            </el-row>
            <el-row>
                <el-col :span="6">
                    <el-form label-width="160px" style="max-width: 460px">
                        <el-form-item label="SCORM パッケージ名">
                            <el-input placeholder="Zip ファイル名" v-model="folderNameZip" />
                        </el-form-item>
                    </el-form>
                </el-col>
                <el-col :span="6">
                    <el-button @click="scormDownload">ダウンロード</el-button>
                </el-col>
            </el-row>
            <el-row>
                <template v-for="video in videos">
                    <el-col :span="6">
                        <div @click="setVideo(video.videoUrl, video.videoName)">
                            <span>{{ video.videoName }}</span>
                            <el-image style="height: 200px; " :src="video.thumbUrl" />
                        </div>
                    </el-col>
                </template>
            </el-row>
        </el-main>
    </el-container>


    <el-container>


    </el-container>

</template>

<script setup>
import { ref, reactive, onMounted, onUpdated } from 'vue';
import axios from "axios";
import { userAuthStore } from '../store/auth.store.js';
import router from '../router';
import Preview from "./Preview.vue";

const authStore = userAuthStore();
const file = ref('');

const sourceFolder = ref('');

let videos = ref([]);

const previewUrl = ref('');
const folderNameZip = ref('');

onMounted(() => {
    updateThumbnails();
})

const updateThumbnails = () => {
    videos.value = [];
    const API_URL = "https://localhost:3000/";
    const authStore = userAuthStore();

    axios.get(API_URL + "videoThumbnails", { params: { userID: authStore.$state.userid } }).then(res => {
        if (res.data.success == true) {
            console.log(res.data.objects);

            var objects = res.data.objects;
            objects.forEach(object => {
                videos.value.push(object)
            })

        }
        else {
            console.log("Response is here: ", res.data)
        }
    })
}

var fileWithEx = "";
var videoUrl = "";
var dirName = "";
const sendFile = async () => {
    const myFiles = file.value.files
    const formData = new FormData();
    Object.keys(myFiles).forEach(key => {
        formData.append(myFiles.item(key).name, myFiles.item(key))
    })
    console.log('This file is gonna be sent', file.value.files[0]);
    console.log("form data", formData);

    axios.post("https://localhost:3000/convert", formData)
        .then((res) => {
            console.log({ res });
            if (res.data.success == true) {
                const options = {
                    url: "https://localhost:3000/videoDatabase",
                    method: 'POST',
                    data: {
                        userID: authStore.$state.userid,
                        videoName: res.data.dirName
                    }
                }
                // console.log("userid is here", authStore.$state.userid);
                // console.log("axios will be sent here to videoDatabase");

                console.log("video Url ", res.data.videoUrl)
                fileWithEx = "/" + res.data.dirName + ".m3u8"
                videoUrl = res.data.videoUrl + res.data.dirName + fileWithEx
                dirName = res.data.dirName;


                axios(options).then((res) => {
                    console.log(res)
                    updateThumbnails();
                    setVideo(videoUrl, dirName);
                })
            }
        });
}

const scormDownload = () => {
    const options = {
        url: "https://localhost:3000/scormProperty",
        method: 'POST',
        data: {
            scormName: folderNameZip.value,
            sourceFolder: sourceFolder.value

        }
    }

    axios(options).then((res) => {
        console.log("res data success here", res.data.success);
        if (res.data.success) {
            axios.post("https://localhost:3000/scorm", {
                responseType: 'arraybuffer',
                headers: { Accept: 'application/zip' },
            })
                .then((res) => {
                    var file = res;
                    console.log(res)
                    const blob = new Blob([file], { type: 'application/zip' });
                    const uri = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.download = folderNameZip.value
                    link.href = uri
                    link.click();
                });
        }
        else {
            console.log("Scorm property root has a problem");
        }
    })
}

const setVideo = (videoUrl, folderName) => {
    console.log(videoUrl);
    console.log(folderName);
    previewUrl.value = videoUrl;
    sourceFolder.value = folderName;
    folderNameZip.value = folderName;

}


</script>

<style>
.el-row {
    margin-bottom: 20px;
}
</style>
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
                    <Preview />
                </el-col>
            </el-row>
            <el-row>
                <el-col :span="12">
                    <el-form label-width="160px" style="max-width: 460px">
                        <el-form-item label="SCORM パッケージ名">
                            <el-input v-model="scormName" />
                        </el-form-item>
                    </el-form>
                </el-col>
                <el-col :span="3">
                    <el-button @click="scormDownload">ダウンロード</el-button>
                </el-col>
            </el-row>
            <el-row>
                <div v-for="video in videos">
                    <el-col>
                        <span>{{ video.videoName }}</span>
                        <el-image style="height: 200px; padding: 10px;" :src="video.url" />
                    </el-col>
                </div>
            </el-row>
        </el-main>
    </el-container>


    <el-container>
    </el-container>

</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import axios from "axios";
import { userAuthStore } from '../store/auth.store.js';
import router from '../router';
import Preview from "./Preview.vue";

const authStore = userAuthStore();
const file = ref('');
const scormName = ref('');

let urls = ref([]);
let videoNames = ref([]);

let videos = reactive([]);

onMounted(() => {
    const API_URL = "https://localhost:3000/";
    const authStore = userAuthStore();

    axios.get(API_URL + "videoThumbnails", { params: { userID: authStore.$state.userid } }).then(res => {
        if (res.data.success == true) {
            console.log(res.data.objects);

            var objects = res.data.objects;
            // const stemURL = "https://localhost:3000/thumbnails/";
            // videos = objects;

            objects.forEach(object => {
                videos.push(object)
                // videos.urls.push(stemURL + object.file);
                // videos.videoNames.push(object.videoName);

                // urls.value.push(stemURL + object.file);
                // videoNames.value.push(object.videoName)
            })

        }
        else {
            console.log("Response is here: ", res.data)
        }
    })
})



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
                console.log("userid is here", authStore.$state.userid);
                console.log("axios will be sent here to videoDatabase");
                axios(options).then((res) => {
                    console.log(res)
                })
            }
        });
}

const scormDownload = () => {
    const options = {
        url: "https://localhost:3000/scormProperty",
        method: 'POST',
        data: {
            scormName: scormName.value,
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
                    link.download = scormName.value
                    link.href = uri
                    link.click();
                });
        }
        else {
            console.log("Scorm property root has a problem");
        }
    })
}

// const logout = () => {
//     authStore.clearUser();
//     const options = {
//         url: "http://localhost:3000/logout",
//         method: 'GET',
//         withCredentials: true,
//     }

//     axios(options).then(res => {
//         if (res.data) {
//         }
//     });
//     router.push("/login");
// }

</script>

<style>
.el-row {
    margin-bottom: 20px;
}
</style>
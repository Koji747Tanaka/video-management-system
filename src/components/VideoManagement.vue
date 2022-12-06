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
        </el-main>
    </el-container>

</template>

<script setup>
import { ref } from 'vue';
import axios from "axios";
import { userAuthStore } from '../store/auth.store.js';
import router from '../router';
import Preview from "./Preview.vue"

const authStore = userAuthStore();
const file = ref('');
const scormName = ref('');


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
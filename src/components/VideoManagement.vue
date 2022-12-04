<template>
    <el-container>
        <el-main>
            <el-row>
                <el-col :span="8">
                    <input ref="file" v-on:change="handleFileUpload()" type="file" />
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
                    <el-button @click="sendFile()">Convert</el-button>
                </el-col>
            </el-row>






        </el-main>
    </el-container>

</template>

<script setup>
import { ref } from 'vue';
import axios from "axios";
import { userAuthStore } from '../store/auth.store.js';
const authStore = userAuthStore();

const file = ref('');
const scormName = ref('');

const sendFile = async () => {
    const myFiles = file.value.files
    const formData = new FormData();
    const options = {
        url: "http://localhost:3000/scormProperty",
        method: 'POST',
        data: {
            scormName: scormName.value,
        }
    }

    axios(options).then((res) => {
        if (res.data.success == true) {
            Object.keys(myFiles).forEach(key => {
                formData.append(myFiles.item(key).name, myFiles.item(key))
            })
            console.log('This file is gonna be sent', file.value.files[0]);
            console.log("form data", formData);
            const requestData = {
                scormName: scormName.value,
                formData: formData
            }
            console.log(formData);

            axios.post("http://localhost:3000/convert", formData)
                .then((res) => {
                    var file = res;
                    // console.log(res)

                });
        }
        else {
            return res.data;
        }
    });




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

</style>
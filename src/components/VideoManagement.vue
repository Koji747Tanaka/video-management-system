<template>
    <div>
        <button @click="logout()">LOG OUT</button>
    </div>
    <div>
        <input ref="file" v-on:change="handleFileUpload()" type="file">
        <button @click="sendFile()">Convert</button>
    </div>


</template>

<script setup>
import { ref } from 'vue'
import axios from "axios"
import router from '../router';

const file = ref('')

const handleFileUpload = async () => {
    // debugger;
    // console.log("selected file", file.value.files[0])
    //Upload to server
}

const sendFile = async () => {
    const myFiles = file.value.files
    const formData = new FormData()

    Object.keys(myFiles).forEach(key => {
        formData.append(myFiles.item(key).name, myFiles.item(key))
    })

    console.log('This file is gonna be sent', file.value.files[0]);
    console.log("form data", formData);
    // const article = {
    //     file: file.value.files[0]
    // };
    axios.post("http://localhost:3000/convert", formData)
        .then((res) => {
            console.log(res.data)
        });
}

const logout = () => {
    axios.get("http://localhost:3000/logout").then(res => {
        if (res.data) {
            router.push("/login");
        }
    });
}

</script>

<style>

</style>
















<!-- <template>
    <el-header>

    </el-header>

    <el-main>
        <el-upload ref="upload" v-on:change="handleFileUpload()" action="http://localhost:3000/convert" :limit="1"
            :on-exceed="handleExceed" :auto-upload="false" type="file">

            <template #trigger>
                <el-button type="primary">Select File</el-button>
            </template>
            <el-button class="ml-3" type="success" @click="submitUpload">
                Upload to server
            </el-button>

            <template #tip>
                <div class="el-upload__tip text-red">
                    limit 1 file, new file will cover the old file
                </div>
            </template>

        </el-upload>

    </el-main>

</template>

<script setup>
import { ref } from 'vue'
import axios from "axios"
import { genFileId } from 'element-plus'

const API_URL = "http://localhost:3000/";
// const file = ref('')
const upload = ref('')


const handleExceed = (files) => {
    upload.value.clearFiles()
    const file = files[0]
    file.uid = genFileId()
    upload.value = file;
    console.log("file name is here; ", file.name);
    console.log("file id is here; ", file.uid);
    console.log("upload is here; ", upload.value);

}

const handleFileUpload = async () => {
    // debugger;
    console.log("selected file", upload.value.files)
    //Upload to server
}
// const password = ref('')
// const article = {
//     file: file.value
// };

const submitUpload = () => {
    console.log("upload value is here ", upload.value);
    // upload.value = files;

    upload.value.submit();
}

// const sendMP4 = () => {
//     console.log("file", file.value);
//     // axios.post("http://localhost:3000/convert", article)
//     //     .then((res) => {
//     //         console.log(res.data)
//     //     });
// }



</script>

<style>

</style>   -->
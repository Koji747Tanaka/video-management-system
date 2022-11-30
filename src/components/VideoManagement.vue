<template>
    <!-- <div>
        <h1>{{ authStore.$state.username }}</h1>
        <button @click="logout()">LOG OUT</button>
    </div> -->
    <div>
        <input ref="file" v-on:change="handleFileUpload()" type="file">
        <button @click="sendFile()">Convert</button>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import axios from "axios";
import router from '../router';
import { userAuthStore } from '../store/auth.store.js';
const authStore = userAuthStore();

const file = ref('')

const sendFile = async () => {
    const myFiles = file.value.files
    const formData = new FormData();

    Object.keys(myFiles).forEach(key => {
        formData.append(myFiles.item(key).name, myFiles.item(key))
    })
    console.log('This file is gonna be sent', file.value.files[0]);
    console.log("form data", formData);
    axios.post("http://localhost:3000/convert", formData)
        .then((res) => {
            console.log(res.data)
        });
}
const logout = () => {
    authStore.clearUser();
    const options = {
        url: "http://localhost:3000/logout",
        method: 'GET',
        withCredentials: true,
    }

    axios(options).then(res => {
        if (res.data) {
        }
    });
    router.push("/login");
}

</script>

<style>

</style>
<template>
    <el-card id="card">
        <h3>動画管理サイト ログイン</h3>
        <el-container class="margin-top-little">
            <el-form class="login-form" label-width="100px">
                <div id="elButton">
                    <el-button id="elButton" type="primary" plain @click="onClickSubmit()">ログイン</el-button>
                </div>
            </el-form>
        </el-container>

        <el-container class="align-centre margin-top">
            <div class="block-grey">
                <p>------------------------------------</p>
                <p>アカウントを作成する場合はサインアップへ</p>
                <div class="margin-top-little">
                    <router-link to="/login">ログイン</router-link>
                </div>
            </div>

        </el-container>
    </el-card>


</template>

<script setup>
import { ref } from 'vue'
import axios from "axios"
import { userAuthStore } from '../store/auth.store.js'
import router from '../router';

const API_URL = "http://localhost:3000/";
const username = ref('')
const password = ref('')
const authStore = userAuthStore();

const onClickSubmit = () => {
    const article = {
        username: username.value,
        password: password.value
    };
    axios.post(API_URL + "login", article).then((res) => {
        if (res.data.validation == true) {
            // authStore.auth();
            // console.log("Great response is : ", res.data);
            // console.log("cookie is here", document.cookie);
            // console.log("Token is here;", res.data.token)
            router.push("/video");
            return res.data;
        }
        else {
            console.log("Response is here: ", res.data.validation)
            return res.data;
        }
    });
}
</script>
<style>
.login-form {
    width: 290px;
}
</style>
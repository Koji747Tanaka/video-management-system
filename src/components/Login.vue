<template>
    <el-card id="card">
        <h3>動画管理サイト ログイン</h3>
        <el-container class="margin-top-little">
            <el-form class="login-form" label-width="100px">
                <el-form-item label="アカウント名">
                    <el-input v-model="username" placeholder="username" required></el-input>
                </el-form-item>
                <el-form-item label="パスワード">
                    <el-input v-model="password" type="password" placeholder="password" required>
                    </el-input>
                </el-form-item>
                <div id="elButton">
                    <!-- <el-form-item> -->
                    <el-button id="elButton" type="primary" plain @click="onClickSubmit()">ログイン</el-button>
                    <!-- </el-form-item> -->
                </div>
            </el-form>
        </el-container>

        <el-container class="align-centre margin-top">
            <div class="block-grey">
                <p>------------------------------------</p>
                <p>アカウントを作成する場合はサインアップへ</p>
                <div class="margin-top-little">
                    <router-link to="/register">サインアップ </router-link>

                    <router-link to="/loginAgain"> 再ログイン</router-link>
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

const config = {
    headers: { 'Content-Type': 'application/json' },
    withCredentials: true
};

const onClickSubmit = () => {
    const article = {
        username: username.value,
        password: password.value
    };
    const options = {
        url: "http://localhost:3000/login",
        method: 'POST',
        data: {
            username: username.value,
            password: password.value
        },
        withCredentials: true,
    }


    // sessionCookieName=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE2Njk1MzI3NzUsImV4cCI6MTY2OTUzNDU3NX0.f-vIYB0wDvpteOGTtN9JdcA01fMdkBDtd1qeLkv7e_4; Path=/; HttpOnly
    axios(options).then((res) => {
        if (res.data.validation == true) {
            authStore.auth();
            authStore.setUser(res.data.user);
            console.log("authStore is Login", authStore.isLogin)
            console.log("Great response is : ", res.data);
            console.log("cookie is here", res.cookie);
            console.log("Token is here;", res.data.token)
            console.log(res.data.token);
            authStore.setJWT(res.data.token)

            router.push("/video");
            return res.data;
        }
        else {
            console.log("cookie is here", document.cookie);
            console.log("Response is here: ", res.data)
            console.log("res. headers is here ", document.cookie)
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
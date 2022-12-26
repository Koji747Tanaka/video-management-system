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
// import { ref } from 'vue'
import axios from "axios"
import { userAuthStore } from '../store/auth.store.js'
import router from '../router';
import { onBeforeMount, onMounted, onBeforeUpdate, onUpdated, onBeforeUnmount, onUnmounted, ref } from 'vue'


onMounted(() => {
    const API_URL = "https://localhost:3000/";
    const authStore = userAuthStore();

    axios.get(API_URL + "login", { withCredentials: true }).then(res => {
        if (res.data.success == true) {
            const id = res.data.userID;
            const username = res.data.username;
            authStore.auth();
            authStore.setUser(id, username);
            console.log("mounted.")
            router.push("/video");
        }
        else {
            console.log("Response is here: ", res.data)
        }
    })
})

const API_URL = "https://localhost:3000/";
const username = ref('')
const password = ref('')
const authStore = userAuthStore();

const config = {
    headers: { 'Content-Type': 'application/json' },
    withCredentials: true
};

const onClickSubmit = () => {
    const options = {
        url: "https://localhost:3000/login",
        method: 'POST',
        data: {
            username: username.value,
            password: password.value
        },
        withCredentials: true,
    }

    axios(options).then((res) => {
        if (res.data.success == true) {
            const id = res.data.userID;
            const username = res.data.username;

            authStore.auth();
            authStore.setUser(id, username);
            router.push("/video");
        }
        else {
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
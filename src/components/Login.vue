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
                    <router-link to="/register">サインアップ</router-link>
                </div>
            </div>

        </el-container>
    </el-card>


</template>

<script setup>
import { ref } from 'vue'
import axios from "axios"

const API_URL = "http://localhost:3000/";
const username = ref('')
const password = ref('')

const onClickSubmit = async () => {
    const article = {
        username: username.value,
        password: password.value
    };

    await axios.post(API_URL + "login", article).then((res) => {
        // console.log("Response is here: " + res.data);
        if (res.data === "Matched") {
            console.log("Great response is : " + res.data);

            // $store.dispatch("fetch", this.username);
            // $router.push('/video');
        }
        else {
            console.log("Response is here: " + res.data);
        }
    });
}
</script>
<style>
.login-form {
    width: 290px;
}
</style>
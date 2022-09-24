<template>
    <el-config-provider :size="size" :z-index="zIndex">
        <el-card>
            <h2>ログイン</h2>
            <el-form class="login-form">
                <el-form-item>
                    <el-input v-model="username" placeholder="username" required></el-input>
                </el-form-item>
                <el-form-item>
                    <el-input v-model="password" type="password" placeholder="password" required>
                    </el-input>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="onClickSubmit()">ログイン</el-button>
                </el-form-item>
            </el-form>


        </el-card>
    </el-config-provider>


</template>

<script setup>
import { ref } from 'vue'
import axios from "axios"

const username = ref('')
const password = ref('')

const onClickSubmit = () => {
    const article = {
        username: username.value,
        password: password.value
    };
    axios.post("http://localhost:3000/login", article).then((res) => {
        console.log("Response is here: " + res.data);
    });

}


</script>

<style>
.login-form {
    width: 290px;
}
</style>
<template>
    <!-- <el-config-provider> -->

    <el-card id="card">
        <h3>動画管理サイト アカウント作成</h3>
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
                    <el-button id="elButton" type="primary" plain @click="onClickSubmit()">アカウントを作成</el-button>
                    <!-- </el-form-item> -->
                </div>
            </el-form>
        </el-container>

        <el-container class="align-centre margin-top">
            <div class="block-grey">
                <p>------------------------------------</p>
                <p>アカウントを持っている場合はログインページへ</p>
                <div class="margin-top-little">
                    <router-link to="/login">ログイン</router-link>
                </div>
            </div>

        </el-container>
    </el-card>
    <!-- </el-config-provider> -->


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
    axios.post("http://localhost:3000/register", article)
        .then((res) => {
            console.log(res.data)
        });

}

</script>

<style>
#card {
    margin: 50px;
}

#elButton {
    float: right;
}

.block-grey {
    display: block;
    color: grey;
}

.align-centre {
    justify-content: center;
}

.margin-top {
    margin-top: 30px;
}

.margin-top-little {
    margin-top: 10px;
}

.login-form {
    width: 290px;
    margin-top: 10px;
}
</style>
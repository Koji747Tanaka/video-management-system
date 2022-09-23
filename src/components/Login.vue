<template>
    <el-config-provider :size="size" :z-index="zIndex">
        <el-card>
            <h2>動画管理サイトログイン</h2>
            <el-form class="login-form">
                <el-form-item>
                    <el-input v-model="username" placeholder="username"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-input v-model="password" type="password" placeholder="password"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button>ログイン</el-button>
                </el-form-item>
            </el-form>
            <span>Here is username: {{username}}</span><br>
            <span>Here is password: {{password}}</span>

        </el-card>
    </el-config-provider>


</template>

<script setup>
import { ref } from 'vue'
const username = ref('')
const password = ref('')



</script>

<style>
.login-form {
    width: 290px;
}
</style>
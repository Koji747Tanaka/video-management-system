<template>
  <el-card id="card">
    <h3>動画管理サイト ログイン</h3>
    <el-container class="margin-top-little">
      <el-form class="login-form" label-width="100px">
        <div id="elButton">
          <el-button id="elButton" type="primary" plain @click="onClickSubmit()"
            >ログイン</el-button
          >
        </div>
      </el-form>
    </el-container>
    <el-container class="align-centre margin-top">
      <div class="block-grey">
        <p>------------------------------------</p>
        <p>アカウントを作成する場合はサインアップへ</p>
        <div class="margin-top-little">
          <router-link to="/">ログイン</router-link>
        </div>
      </div>
    </el-container>
  </el-card>
</template>

<script setup>
import { ref } from "vue";
import axios from "axios";
import { userAuthStore } from "../store/auth.store.js";
import router from "../router";
import { useCookies } from "vue3-cookies";

const API_URL = "https://localhost:3000/";
const authStore = userAuthStore();

const onClickSubmit = () => {
  axios.get(API_URL + "login", { withCredentials: true }).then((res) => {
    if (res.data.success == true) {
      const id = res.data.userID;
      const username = res.data.username;
      authStore.auth();
      authStore.setUser(id, username);
      router.push("/video");
    } else {
      console.log("Response is here: ", res.data);
    }
  });
};
</script>
<style>
.login-form {
  width: 290px;
}
</style>

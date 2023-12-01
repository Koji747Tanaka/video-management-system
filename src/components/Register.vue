<template>
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
          <el-button id="elButton" type="primary" plain @click="onClickSubmit()">アカウントを作成</el-button>
        </div>
      </el-form>
    </el-container>

    <el-container class="align-centre margin-top">
      <div class="block-grey">
        <p>------------------------------------</p>
        <p>アカウントを持っている場合はログインページへ</p>
        <div class="margin-top-little">
          <router-link to="/">ログイン</router-link>
        </div>
      </div>
    </el-container>
  </el-card>
  <!-- </el-config-provider> -->
</template>

<script setup>
import { ref } from "vue";
import axios from "axios";
import { userAuthStore } from "../store/auth.store.js";
import router from "../router";

// const BASE_URL = "https://13.230.214.179:3000";
const BASE_URL = "https://localhost:3001";
const authStore = userAuthStore();
const username = ref("");
const password = ref("");

const onClickSubmit = () => {
  const options = {
    url: BASE_URL + "/register",

    method: "POST",
    data: {
      username: username.value,
      password: password.value,
    },
    withCredentials: true,
  };

  axios(options).then((res) => {
    if (res.data.success == true) {
      const id = res.data.userID;
      const username = res.data.username;

      authStore.auth();
      authStore.setUser(id, username);
      router.push("/video");
    } else {
      console.log("Response is here: ", res.data);
      return res.data;
    }
  });
};
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

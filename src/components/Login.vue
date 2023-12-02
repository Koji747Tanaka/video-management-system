<template>
  <v-container class="fill-height">
      <v-card
      :title="$t('login')"
      width="80vw"
      rounded="lg"
      elevated>
        <v-card-text>
          <v-form>
            <v-text-field
            v-model="username"
            :label="$t('email')"
            type="email"
            density="compact"
            placeholder="Email address"
            variant="outlined"
            prepend-inner-icon="mdi-email-outline"
            required
            >
            </v-text-field>

            <div class="text-subtitle-1 text-medium-emphasis d-flex align-center justify-space-between">
              Password
              <a
                class="text-caption text-decoration-none text-blue"
                href="#"
                rel="noopener noreferrer"
                target="_blank"
              >
                Forgot login password?</a>
            </div>

            <v-text-field
            v-model="password" 
            :label="$t('password')"
            :append-inner-icon="visible ? 'mdi-eye-off' : 'mdi-eye'"
            :type="visible ? 'text' : 'password'"
            placeholder="Enter your password"
            prepend-inner-icon="mdi-lock-outline"
            density="compact"
            variant="outlined"
            @click:append-inner="visible = !visible"
            required
            >
              
            </v-text-field>
          </v-form>
        </v-card-text>
      </v-card>
  </v-container>

  <!-- <el-card id="card">
    <el-container class="margin-top-little">
      <el-form class="login-form" label-width="100px">
        <el-form-item label="アカウント名">
          <el-input v-model="username" placeholder="username" required></el-input>
        </el-form-item>
        <el-form-item :label="$t('password')">
          <el-input v-model="password" type="password" placeholder="password" required>
          </el-input>
        </el-form-item>
        <div id="elButton">
          <el-button id="elButton" type="primary" plain @click="onClickSubmit()">ログイン</el-button>
        </div>
      </el-form>
    </el-container>

    <el-container class="align-centre margin-top">
      <div class="block-grey">
        <p>アカウントを作成する場合はサインアップへ</p>
        <div class="margin-top-little">
          <router-link to="/register">サインアップa </router-link>
        </div>
      </div>
    </el-container>
  </el-card> -->
</template>

<script setup>
import axios from "axios";
import { userAuthStore } from "../store/auth.store.js";
import router from "../router";
import {
  onMounted,
  ref,
} from "vue";
const BASE_URL = import.meta.env.VITE_SERVER_URL;

onMounted(() => {
  const authStore = userAuthStore();
  axios.get(BASE_URL + "/login", { withCredentials: true }).then((res) => {
    if (res.data.success == true) {
      const id = res.data.userID;
      const username = res.data.username;
      authStore.auth();
      authStore.setUser(id, username);
      console.log("mounted.");
      router.push("/video");
    } 
    // else {
    //   console.log("Response is here: ", res.data);
    // }
  });
});

const visible = ref(false);
const username = ref("");
const password = ref("");
const authStore = userAuthStore();

const config = {
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
};

const onClickSubmit = () => {
  const options = {
    url: BASE_URL + "/login",
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
      return res.data;
    }
  });

};
</script>
<style>
.login-form {
  width: 290px;
}

.fill-height {
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>

<script setup>
import axios from "axios";
import { userAuthStore } from "./store/auth.store.js";
const authStore = userAuthStore();
const BASE_URL = "https://13.230.214.179:3000";
const logout = () => {
  authStore.clearUser();
  const options = {
    url: BASE_URL + "/logout",
    method: "GET",
    withCredentials: true,
  };
  axios(options).then((res) => {
    if (res.data) {
      console.log("logout");
    }
  });
};
</script>

<template>
  <el-menu id="top-menu">
    <el-menu-item index="0">
      <img src="./img/chibalogoside.jpeg" alt="Chiba University Logo" class="logo" width="200" height="50" />
    </el-menu-item>

    <div class="flex-grow" />
    <el-menu-item index="1" class="userStatus">
      {{ authStore.$state.username }}
    </el-menu-item>
    <el-menu-item index="2" v-if="authStore.$state.isLogin" @click="logout()">
      Logout
    </el-menu-item>
  </el-menu>
  <main>
    <router-view />
  </main>
</template>

<style scoped>
header {
  line-height: 1.5;
}

main {
  justify-content: center;
  align-items: center;
  display: flex;
}

#top-menu {
  display: flex;
  border: none;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 30px;
  margin: 30px;
}

#firstContainer {
  border: 1px solid #eee;
  margin: 0%;
}

.userStatus {
  float: right;
}

.flex-grow {
  flex-grow: 1;
}

.logo {
  float: left;
}
</style>

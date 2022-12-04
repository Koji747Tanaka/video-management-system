<script setup>
import axios from "axios";
import { userAuthStore } from './store/auth.store.js';




const authStore = userAuthStore();
const logout = () => {
  authStore.clearUser();
  const options = {
    url: "http://localhost:3000/logout",
    method: 'GET',
    withCredentials: true,
  }
  axios(options).then(res => {
    if (res.data) {
      console.log("logout")
    }
  });

}
</script>

<template>
  <!-- <el-container id="firstContainer"> -->
  <el-menu id="top-menu">
    <el-menu-item index="0">
      <img src="./img/chibalogoside.jpeg" alt="Chiba University Logo" class="logo" width="200" height="50">
    </el-menu-item>

    <div class="flex-grow" />
    <!-- <p>{{ authStore.$state.username }}</p> -->
    <el-menu-item index="1" class="userStatus">
      {{ authStore.$state.username }}
    </el-menu-item>
    <!-- <el-button v-if="authStore.$state.isLogin" @click="logout()">LOG OUT</el-button> -->
    <el-menu-item index="2" v-if="authStore.$state.isLogin" @click="logout()">
      Logout
    </el-menu-item>

  </el-menu>
  <!-- <el-switch v-model="value" size="middle" active-text="English" inactive-text=" 日本語" /> -->
  <!-- </el-container> -->
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

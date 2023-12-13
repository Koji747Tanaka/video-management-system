<script setup>
import axios from "axios";
import { userAuthStore } from "./store/auth.store.js";
const authStore = userAuthStore();
// const BASE_URL = "https://13.230.214.179:3000";
const BASE_URL = import.meta.env.VITE_SERVER_URL;
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
  <v-app>
    <v-app-bar id="top-menu" dense flat elevation="1">
      <v-toolbar-title>
        <img src="./img/chibalogoside.jpeg" alt="Chiba University Logo" class="logo" height="50" />
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-toolbar-items class="userStatus">
        <v-btn text>{{ authStore.$state.username }}</v-btn>
      </v-toolbar-items>

      <v-toolbar-items v-if="authStore.$state.isLogin">
        <v-btn text @click="logout()">Logout</v-btn>
      </v-toolbar-items>
    </v-app-bar>
    <v-main>
      <router-view />
    </v-main>
</v-app>
</template>

<style scoped>
header {
  line-height: 1.5;
}

#top-menu {
  display: flex;
  border: none;
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

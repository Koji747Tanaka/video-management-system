<template>
  <v-container class="fill-height">
      <v-card
      :title="$t('login')"
      width="80vw"
      rounded="lg"
      elevated>
      <v-spacer></v-spacer>
        <v-card-text>
          <v-form ref="form" validate-on="submit" @submit.prevent="submit">
            <div class="text-subtitle-1 text-medium-emphasis d-flex">{{ $t('email') }}</div>
            <v-text-field
            v-model="username"
            density="compact"
            placeholder="Email address"
            :rules="[requiredValidationRule, emailValidationRule]"
            variant="outlined"
            prepend-inner-icon="mdi-email-outline"
            required
            >
            </v-text-field>
            <div class="text-subtitle-1 text-medium-emphasis d-flex align-center justify-space-between">
              {{ $t('password') }}
            </div>

            <v-text-field
            v-model="password" 
            :rules="[requiredValidationRule]"
            :append-inner-icon="visible ? 'mdi-eye-off' : 'mdi-eye'"
            :type="visible ? 'text' : 'password'"
            placeholder="Enter your password"
            prepend-inner-icon="mdi-lock-outline"
            density="compact"
            variant="outlined"
            @click:append-inner="visible = !visible"
            >
            </v-text-field>
            <v-btn
            :loading="loading"
            block
            rounded
            class="mb-8 mt-8"
            color="blue"
            size="large"
            variant="tonal"
            type="submit"
            >
            Log In
            </v-btn>
          </v-form>

          

          <div class="text-center">
            <router-link to="/register">サインアップ<v-icon icon="mdi-chevron-right"></v-icon></router-link>
          </div>
        </v-card-text>
      </v-card>
  </v-container>
</template>

<script setup>
import axios from "axios";
import { userAuthStore } from "../store/auth.store.js";
import router from "../router";
import {emailRule, requiredRule} from '../rules'
import { useI18n } from 'vue-i18n'
import {onMounted, ref} from "vue";

const { t } = useI18n()
const emailValidationRule = emailRule(t);
const requiredValidationRule = requiredRule(t);

const BASE_URL = import.meta.env.VITE_SERVER_URL;

onMounted(() => {
  const authStore = userAuthStore();
  axios.get(BASE_URL + "/login", { withCredentials: true }).then((res) => {
    if (res.data.success == true) {
      const id = res.data.userID;
      const username = res.data.username;
      authStore.auth();
      authStore.setUser(id, username);
      router.push("/video");
    } 
    // else {
    //   console.log("Response is here: ", res.data);
    // }
  });
});

const form = ref(null);
const visible = ref(false);
const loading = ref(false)
const username = ref("");
const password = ref("");
const authStore = userAuthStore();

const config = {
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
};

const submit = async(event) => {
  const isValid = await form.value.validate();
  if (!isValid.valid) {
    return
  }

  loading.value = true
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
  loading.value=false
};
</script>
<style>
.fill-height {
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>

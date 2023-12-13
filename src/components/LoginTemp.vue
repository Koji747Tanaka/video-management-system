<template>
    <v-container class="fill-height">
        <v-card
        width="600px"
        rounded="lg"
        elevated>
        <v-card-title>
            <template v-if="isLogin">
                {{ $t('login_title') }}
            </template>
            <template v-else>
                {{ $t('signup_title') }}
            </template>
        </v-card-title>
        <v-spacer></v-spacer>
        <v-card-text>
            <v-form ref="form" validate-on="submit" @submit.prevent="submit">
            <div class="text-subtitle-1 text-medium-emphasis d-flex">{{ $t('email') }}</div>
            <v-text-field
            v-model="username"
            density="compact"
            :placeholder="$t('email_address')"
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
            :placeholder="$t('enter_password')"
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
            {{ isLogin ? $t('login'): $t('sign_up') }}
            </v-btn>
        </v-form>

        <div class="text-center">
            <router-link :to="goTo">{{ isLogin ? $t('sign_up'): $t('login')  }}<v-icon icon="mdi-chevron-right"></v-icon></router-link>
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
import {onMounted, ref, computed, toRefs} from "vue";
const props = defineProps(['isLogin'])

const { isLogin } = toRefs(props);
const { t } = useI18n()
const emailValidationRule = emailRule(t);
const requiredValidationRule = requiredRule(t);

const BASE_URL = import.meta.env.VITE_SERVER_URL;

const goTo = computed(() => isLogin.value ? '/register': '/')

onMounted(() => {
    const authStore = userAuthStore();
    axios.get(BASE_URL + '/login', { withCredentials: true })
        .then((res) => {
            const username = res.data.username;
            const user_id = res.data.userID;
            authStore.auth();
            authStore.setUser(user_id, username);
            router.push("/video");
            })
        .catch((error) => {
            console.error('Error fetching user information:', error);
        });
    });

const form = ref(null);
const visible = ref(false);
const loading = ref(false)
const username = ref("");
const password = ref("");

const submit = async(event) => {
    const isValid = await form.value.validate();
    if (!isValid.valid) {
        return
    }

    loading.value = true

    const options = {
        url: BASE_URL + (isLogin.value ? "/login" : "/register"),
        method: "POST",
        data: {
        username: username.value,
        password: password.value,
        },
        withCredentials: true,
    };

    axios(options).then((res) => {
        if (res.data.success == true) {
        const username = res.data.username;
        const id = res.data.userID;
        const authStore = userAuthStore();
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

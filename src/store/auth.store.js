import { defineStore } from 'pinia';
import router from '../router';

export const userAuthStore = defineStore({
    id: 'auth',
    state: () => {
        return {
            isLogin: false,
            userid: null,
            username: null,
        }
    },
    actions: {
        auth() {
            this.isLogin = true;
        },
        setJWT(JWT) {
            this.JWT = JWT;
        },
        setUser(id, user) {
            this.userid = id;
            this.username = user;
        },
        clearUser() {
            this.username = "";
            this.isLogin = false;
            router.push("/");
        },
    }
})
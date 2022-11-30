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
    getters: {


    },
    actions: {
        auth() {
            this.isLogin = true;
            console.log("Authentication is now passed.");
            // state.user = user;
        },


        setJWT(JWT) {
            this.JWT = JWT;
        },

        setUser(id, user) {
            this.userid = id;
            this.username = user;

        },

        clearUser() {
            this.user = null;
            this.isLogin = false;
            router.push("/login");
        },
    }
})
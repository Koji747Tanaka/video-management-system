import { defineStore } from 'pinia';

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
        isLoggedIn: (state) => state.user,
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
        },
    }
})
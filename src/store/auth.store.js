import { defineStore } from 'pinia';

export const userAuthStore = defineStore({
    id: 'auth',
    state: () => {
        return {
            isLogin: false,
            user: null,
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

        setUser(user) {
            this.user = user;
        },
        clearUser() {
            this.user = null;
        },
    }
})
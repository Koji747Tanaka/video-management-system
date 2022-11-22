import { defineStore } from 'pinia';

export const userAuthStore = defineStore({
    id: 'auth',
    state: () => {
        return {
            isLogin: true,
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

        setUser(user) {
            this.user = user;
        },
        clearUser() {
            this.user = null;
        },
    }
})
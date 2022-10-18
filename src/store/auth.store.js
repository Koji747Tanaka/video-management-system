import { defineStore } from 'pinia';

export const userAuthStore = defineStore({

    id: 'auth',
    state: () => {
        return {
            isLogin: false,
        }
    },
    actions: {
        auth() {
            this.isLogin = true;
            console.log("Authentication is now passed.");
            // state.user = user;
        }
    }
})
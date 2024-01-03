import { createRouter, createWebHashHistory } from 'vue-router';
import { userAuthStore } from "./store/auth.store.js";
import UploaderLayout from "./components/layouts/UploaderLayout.vue"
const BASE_URL = import.meta.env.VITE_SERVER_URL;
import axios from "axios";

const routes = [
    {
        path: '/',
        name: 'login',
        component: () => import("./components/Login.vue"),
    },
    {
        path: '/register',
        name: 'register',
        component: () => import("./components/Register.vue"),
    },
    {
        path: '/preview',
        name: 'preview',
        component: () => import("./components/Preview.vue"),
    },
    {
        path: '/video',
        name: 'video',
        component: () => import("./components/VideoManagement.vue"),
        meta: {
            layout: UploaderLayout,
            requiresAuth: true, 
        }
    },
    {
        path: '/upload',
        name: 'upload',
        component: () => import("./components/Uploader.vue"),
        meta: {
            layout: UploaderLayout,
            requiresAuth: true, 
        }
    }
]

const router = createRouter({
    history: createWebHashHistory(),
    routes
})

router.beforeEach((to, from, next) => {
    if (to.matched.some(record => record.meta.requiresAuth)) {
            const authStore = userAuthStore();
            axios.get(BASE_URL + '/login', { withCredentials: true })
                .then((res) => {
                    const username = res.data.username;
                    const user_id = res.data.userID;
                    authStore.auth();
                    authStore.setUser(user_id, username);
                    next();
                    })
                .catch((error) => {
                    console.error('Error fetching user information:', error);
                    router.push({ name: 'login' })
                });
            }
    else {
        next();
    }
});


export default router;
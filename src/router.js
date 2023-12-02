import { createRouter, createWebHistory } from 'vue-router';
import { userAuthStore } from "./store/auth.store.js";

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
            requiresAuth: true, 
        }
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

router.beforeEach((to, from, next) => {
    if (to.matched.some(record => record.meta.requiresAuth)) {
        const authStore = userAuthStore();
        console.log("user auth store is here ", authStore.isLogin)
        if (!authStore.isLogin) {
            next({
                path: '/',
                query: {
                    redirect: to.fullPath
                }
            })
        } else {
            next();
        }
    } else {
        next();
    }
});


export default router;
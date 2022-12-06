import { createRouter, createWebHistory } from 'vue-router';
import Register from "./components/Register.vue";
import Login from "./components/Login.vue";
import Video from "./components/VideoManagement.vue";
import Preview from "./components/Preview.vue";
import LoginAgain from "./components/LoginAgain.vue"
import { userAuthStore } from "./store/auth.store.js";

const routes = [
    {
        path: '/login',
        name: 'login',
        component: Login,
    },
    {
        path: '/register',
        name: 'register',
        component: Register,
    },
    {
        path: '/loginAgain',
        name: 'loginAgain',
        component: LoginAgain,
    },
    {
        path: '/preview',
        name: 'preview',
        component: Preview,
    },
    {
        path: '/video',
        name: 'video',
        component: Video,
        meta: {
            requiresAuth: true, //true to require auth
        }
    }
]

const router = createRouter({
    history: createWebHistory(), // This is just an HTML mode.
    routes,
})

router.beforeEach((to, from, next) => {
    if (to.matched.some(record => record.meta.requiresAuth)) {
        const authStore = userAuthStore();
        // console.log("user auth store is here ", authStore.$id)
        console.log("user auth store is here ", authStore.isLogin)
        if (!authStore.isLogin) {
            // 認証されていない時、認証画面へ遷移
            next({
                path: '/login',
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
import { createRouter, createWebHistory } from 'vue-router';
import Register from "./components/Register.vue";
import Login from "./components/Login.vue";
import Video from "./components/VideoManagement.vue";
import store from "./main.js"

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
        path: '/video',
        name: 'video',
        component: Video,
        meta: {
            requiresAuth: true,
        }
    }
]

const router = createRouter({
    history: createWebHistory(), // This is just an HTML mode.
    routes,
})

router.beforeEach((to, from, next) => {
    //https://ky-yk-d.hatenablog.com/entry/2018/07/07/203000
    if (to.matched.some(record => record.meta.requiresAuth)) {
        if (!store.state.isLogin) {
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
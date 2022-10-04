import { createApp } from 'vue'
import { createStore } from 'vuex'
import ElementPlus from 'element-plus'
import router from './router'
import App from './App.vue'
import './assets/main.css'

const app = createApp(App)

const store = createStore({
    state() {
        return {
            isLogin: false,
            userId: ""
        }

    },
    mutations: {
        auth(state, user) {
            state.isLogin = true;
            state.userId = user;
        }
    },
    actions: {
        fetch(context, user) {
            context.commit('auth', user);
        }
    },
    modules: {
    }
})


app.use(store)
app.use(router)
app.use(ElementPlus).mount('#app')

export default store;

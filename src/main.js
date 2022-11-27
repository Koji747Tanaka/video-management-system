import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import router from './router'
import App from './App.vue'
import './assets/main.css'
import vueCookies from 'vue-cookies'

// import { userAuthStore } from "./store/auth.store"
const app = createApp(App)
const pinia = createPinia()

// app.use(vueCookies);
app.use(pinia)
app.use(router)
app.use(ElementPlus).mount('#app')

export default app;

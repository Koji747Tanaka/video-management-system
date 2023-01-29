import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import router from './router'
import App from './App.vue'
import './assets/main.css'

// import { userAuthStore } from "./store/auth.store"
const app = createApp(App)
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}

const pinia = createPinia()
// app.use(vueCookies);
app.use(pinia)
app.use(router)
app.use(ElementPlus).mount('#app')

export default app;

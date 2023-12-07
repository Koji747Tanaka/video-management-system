import { createApp } from 'vue'
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import '@mdi/font/css/materialdesignicons.css'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import './assets/main.css'
import i18n from './plugins/i18n'
import VueVideoPlayer from '@videojs-player/vue'
import 'video.js/dist/video-js.css'

import { userAuthStore } from "./store/auth.store"
const app = createApp(App)
const vuetify = createVuetify({
    components,
    directives,
})

const pinia = createPinia()
// app.use(vueCookies);
app
.use(VueVideoPlayer)
.use(i18n)
.use(pinia)
.use(router)
.use(vuetify)
.mount('#app')

export default app;

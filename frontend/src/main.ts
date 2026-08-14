import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { MotionPlugin } from '@vueuse/motion'
import './fonts.css'
import './style.css'
import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(MotionPlugin)

app.mount('#app')

// Enable the theme cross-fade only after first paint, so the initial unstyled → styled
// transition (and route/motion animations racing it) doesn't visibly fade in on load.
requestAnimationFrame(() => {
  document.documentElement.classList.add('theme-ready')
})

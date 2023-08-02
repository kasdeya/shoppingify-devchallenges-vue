import './assets/main.css'
import './assets/base.css'
import { createApp } from 'vue'
import { VueFire, VueFireAuth } from 'vuefire'
import App from './App.vue'
import { firebaseApp } from './firebase'
import Unicon from 'vue-unicons'
import { uniRedo, uniPen, uniChart, uniListUl, uniTrashAlt, uniPlus, uniMinus } from 'vue-unicons/dist/icons'

Unicon.add([uniRedo, uniPen, uniChart, uniListUl, uniTrashAlt, uniPlus, uniMinus])

const app = createApp(App)
app.use(Unicon).use(VueFire, {
    firebaseApp,
    modules: [
        VueFireAuth(),
    ],
})
app.mount('#app')
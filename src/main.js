import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import i18n from './locales'
import VueFeather from 'vue-feather'
import VueSweetalert2 from 'vue-sweetalert2'
import { VueDatePicker } from '@vuepic/vue-datepicker'
import vSelect from 'vue-select'
import 'moment/locale/tr'
import '@/services/firebase.service'

import 'sweetalert2/dist/sweetalert2.min.css'
import '@vuepic/vue-datepicker/dist/main.css'
import 'vue-select/dist/vue-select.css'
import '@/assets/styles/main.scss'

import toast from '@/plugins/toast'
import { tooltipDirective, clickOutsideDirective } from '@/directives/tooltip.js'
import { applyTheme } from '@/store/modules/ui'

applyTheme(store.state.ui.theme)

createApp(App)
    .use(router)
    .use(store)
    .use(i18n)
    .use(VueSweetalert2)
    .use(toast)
    .component('VueDatePicker', VueDatePicker)
    .component('VSelect', vSelect)
    .component(VueFeather.name, VueFeather)
    .directive('tooltip', tooltipDirective)
    .directive('click-outside', clickOutsideDirective)
    .mount('#app')

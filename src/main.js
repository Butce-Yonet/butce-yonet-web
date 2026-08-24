import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import 'bootstrap/dist/js/bootstrap.bundle'
import '@/assets/scss/app.scss'
import VueFeather from 'vue-feather'
import i18n from './locales'
import VueSweetalert2 from 'vue-sweetalert2'
import 'sweetalert2/dist/sweetalert2.min.css'
import Vue3EasyDataTable from 'vue3-easy-data-table'
import 'vue3-easy-data-table/dist/style.css'
import { VueDatePicker } from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'
import vSelect from 'vue-select'
import 'vue-select/dist/vue-select.css'
import { tooltipDirective } from '@/directives/tooltip.js'
import 'moment/locale/tr'

createApp(App)
    .use(router)
    .use(store)
    .use(i18n)
    .use(VueSweetalert2)
    .component('EasyDataTable', Vue3EasyDataTable)
    .component('VueDatePicker', VueDatePicker)
    .component('VSelect', vSelect)
    .component(VueFeather.name, VueFeather)
    .directive('tooltip', tooltipDirective)
    .mount('#app')

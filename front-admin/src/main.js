import Vue from 'vue'
import request from '@/utils/request'

import 'normalize.css/normalize.css' // A modern alternative to CSS resets

import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import locale from 'element-ui/lib/locale/lang/en' // lang i18n

import '@/styles/index.scss' // global css

import App from './App'
import store from './store'
import router from './router'

import '@/icons' // icon
import '@/permission' // permission control
import VueClipboard from 'vue-clipboard2'
import dayjs from 'dayjs'

Vue.use(VueClipboard)
/**
 * If you don't want to use mock-server
 * you want to use MockJs for mock api
 * you can execute: mockXHR()
 *
 * Currently MockJs will be used in the production environment,
 * please remove it before going online ! ! !
 */
if (process.env.NODE_ENV === 'production') {
  const { mockXHR } = require('../mock')
  mockXHR()
}

// set ElementUI lang to EN
// Vue.use(ElementUI, { locale })
// 如果想要中文版 element-ui，按如下方式声明
Vue.use(ElementUI)

Vue.config.productionTip = false
Vue.prototype.$request = request
Vue.prototype.$dayjs = dayjs

function numberWithCommas(x) {
  if (!x && x !== 0) {
    return ''
  }
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

Vue.prototype.$numberWithCommas = numberWithCommas

new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
})

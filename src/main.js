import Vue from 'vue'

import Cookies from 'js-cookie'

import 'normalize.css/normalize.css' // a modern alternative to CSS resets

import Element from 'element-ui'
import './styles/element-variables.scss'

import i18n from './lang' // internationalization

import '@/styles/index.scss' // global css
import '@/styles/admin.scss'

import VueCodemirror from 'vue-codemirror'
import 'codemirror/lib/codemirror.css'
Vue.use(VueCodemirror)

import App from './App'
import store from './store'
import router from './router'
import permission from './directive/permission'

import { getDicts } from '@/api/admin/dict/data'
import { getItems, setItems } from '@/api/table'
import { getConfigKey } from '@/api/admin/sys-config'
import { parseTime, resetForm, addDateRange, selectDictLabel, /* download,*/ selectItemsLabel } from '@/utils/costum'
import {categoryList, flowTemplateList, flowTemplateListId} from '@/api/smart/flowCenter'
import {getFlowList} from "@/api/smart/flowManage";

import './icons' // icon
import './permission' // permission control
import './utils/error-log' // error log

import Vise from 'viser-vue'
Vue.use(Vise)

import * as filters from './filters' // global filters

import Pagination from '@/components/Pagination'
import BasicLayout from '@/layout/BasicLayout'

import VueParticles from 'vue-particles'
Vue.use(VueParticles)

import iconPicker from 'e-icon-picker'
import 'e-icon-picker/dist/index.css'// 基础样式
import 'e-icon-picker/dist/main.css'

import 'element-ui/lib/theme-chalk/index.css' // 引入element-ui样式
import 'font-awesome/css/font-awesome.min.css'

import vform from '../lib/vform/VFormDesigner.umd.min.js'
import '../lib/vform/VFormDesigner.css'

Vue.use(vform) // 同时注册了v-form-designer、v-form-render等组件
Vue.use(iconPicker, {
  FontAwesome: true,
  ElementUI: true,
  eIcon: true,
  eIconSymbol: true
})

import '@/utils/dialog'

// 全局方法挂载
Vue.prototype.getDicts = getDicts
Vue.prototype.getItems = getItems
Vue.prototype.setItems = setItems
Vue.prototype.getConfigKey = getConfigKey
Vue.prototype.parseTime = parseTime
Vue.prototype.resetForm = resetForm
Vue.prototype.addDateRange = addDateRange
Vue.prototype.selectDictLabel = selectDictLabel
Vue.prototype.selectItemsLabel = selectItemsLabel
Vue.prototype.getCategory = categoryList
Vue.prototype.getFlowTemplate = flowTemplateList
Vue.prototype.flowTemplateListId = flowTemplateListId
Vue.prototype.getFlowList = getFlowList
// Vue.prototype.download = download

// 全局组件挂载
Vue.component('Pagination', Pagination)
Vue.component('BasicLayout', BasicLayout)

Vue.prototype.msgSuccess = function(msg) {
  this.$message({ showClose: true, message: msg, type: 'success' })
}

Vue.prototype.msgError = function(msg) {
  this.$message({ showClose: true, message: msg, type: 'error' })
}

Vue.use(permission)

Vue.use(Element, {
  size: Cookies.get('size') || 'medium', // set element-ui default size
  i18n: (key, value) => i18n.t(key, value)
})

import VueDND from 'awe-dnd'
Vue.use(VueDND)

import 'remixicon/fonts/remixicon.css'

// register global utility filters
Object.keys(filters).forEach(key => {
  Vue.filter(key, filters[key])
})

Vue.config.productionTip = false
Vue.use(Element);

// 定义全局方法
Vue.prototype.$showSuccess = function(message) {
  this.$message.success(message);
};

Vue.prototype.$showError = function(errorMessage) {
  this.$message.error(errorMessage);
};

Vue.prototype.$showInfo = function(message) {
  this.$message.info(message);
};

new Vue({
  el: '#app',
  router,
  store,
  i18n,
  render: h => h(App)
})

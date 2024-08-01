/** When your routing table is too long, you can split it into small modules **/

import Layout from '@/layout'

const flowCenter = {
  path: '/flow',
  component: Layout,
  redirect: '/flow',
  name: 'flowCenter',
  meta: {
    title: '流程中心',
    icon: 'el-icon-s-opportunity',
    noCache: true
  },
  children: [
    {
      path: 'orderCateGory',
      component: () => import('@/views/flow-center/orderCateGory.vue'), // Parent router-view
      name: 'OrderCateGory',
      meta: { title: 'orderCateGory', icon: 'el-icon-bank-card' }
    },
    {
      path: 'templateManage',
      component: () => import('@/views/flow-center/templateManage.vue'), // Parent router-view
      name: 'TemplateManage',
      meta: { title: 'templateMange', icon: 'el-icon-notebook-1' }
    },
    {
      path: 'orderItems',
      component: () => import('@/views/flow-center/orderManage.vue'), // Parent router-view
      name: 'OrderItems',
      meta: { title: 'orderItems', icon: 'el-icon-collection' }
    },
    {
      path: 'list',
      component: () => import('@/views/flow-center/flowManage.vue'), // Parent router-view
      name: 'FlowMange',
      meta: { title: 'flowMange', icon: 'el-icon-s-flag' }
    }
  ]
}

export default flowCenter

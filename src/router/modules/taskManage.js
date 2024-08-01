/** When your routing table is too long, you can split it into small modules **/

import Layout from '@/layout'

const taskCenter = {
  path: '/task',
  component: Layout,
  redirect: '/task',
  name: 'TaskCenter',
  meta: {
    title: '任务管理',
    icon: 'el-icon-files',
    noCache: true
  },
  children: [
    {
      path: 'list',
      component: () => import('@/views/order/index.vue'), // Parent router-view
      name: 'taskList',
      meta: { title: 'taskList', icon: 'el-icon-copy-document' }
    },
    {
      path: 'history',
      component: () => import('@/views/order/index.vue'), // Parent router-view
      name: 'taskHistory',
      meta: { title: 'taskHistory', icon: 'el-icon-reading' }
    },
    {
      path: 'execute',
      component: () => import('@/views/order/index.vue'), // Parent router-view
      name: 'taskExecute',
      meta: { title: 'taskExecute', icon: 'el-icon-magic-stick' }
    }
  ]
}

export default taskCenter

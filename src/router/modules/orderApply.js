/** When your routing table is too long, you can split it into small modules **/

import Layout from '@/layout'
import OrderApply from '@/views/order/index.vue'
import OrderList from '@/views/order/list/workOrderList.vue'
import WorkOrderDetails from '@/views/order/list/workOrderDetails.vue'
import FormRender from '@/views/order/list/formRender.vue'

const orderRouter = {
  path: '/order',
  component: Layout,
  redirect: '/order',
  name: 'OrderCenter',
  meta: {
    title: '工单中心',
    icon: 'el-icon-s-order',
    noCache: true
  },
  children: [
    {
      path: 'apply',
      component: OrderApply, // Parent router-view
      name: 'OrderApply',
      meta: { title: 'orderApply', icon: 'el-icon-s-order' }
    },
    {
      path: 'list',
      name: 'OrderList',
      component: OrderList,
      meta: { title: 'orderList', icon: 'el-icon-tickets' }
    },
    {
      path: '/order/workflow/work-order/details/:id/:title',
      name: 'WorkOrderDetails',
      component: WorkOrderDetails,
      props: true, // 启用路由参数传递给组件
      meta: { title: 'orderDescript' },
      hidden: true
    },
    {
      path: 'ldap-user-register',
      name: 'LdapUserRegister',
      component: () => import('@/views/order/classify/permission/register/index.vue'),
      meta: { title: 'ldap用户注册' },
      hidden: true
    },
    {
      path: 'add-k8s-service',
      name: 'AddK8sService',
      component: () => import('@/views/order/classify/k8s/add-k8s-service/index.vue'),
      meta: { title: 'k8s服务接入' },
      hidden: true
    },
    {
      path: '/order/classify/:templateName',
      component: FormRender,
      name: 'FormRender',
      props: true,
      meta: { title: '' },
      hidden: true
    }
  ]
}

export default orderRouter

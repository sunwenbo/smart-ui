/** When your routing table is too long, you can split it into small modules **/

import Layout from '@/layout'

const systemManage = {
  path: '/system-manage',
  component: Layout,
  redirect: '/manage',
  name: 'SystemManage',
  meta: {
    title: '系统管理',
    icon: 'el-icon-setting',
    noCache: true
  },
  children: [
    {
      path: 'sys-user',
      component: () => import('@/views/admin/sys-user/index.vue'), // Parent router-view
      name: 'SysUserManage',
      meta: { title: 'sysUserManage', icon: 'user' }
    },
    {
      path: 'sys-role',
      component: () => import('@/views/admin/sys-role/index.vue'), // Parent router-view
      name: 'SysRoleManage',
      meta: { title: 'sysRoleManage', icon: 'peoples' }
    },
    {
      path: 'menu',
      name: 'MenuManage',
      component: () => import('@/views/admin/sys-menu/index.vue'), // Parent router-view
      meta: { title: 'menuManage', icon: 'tree-table' }
    },
    {
      path: 'sys-dept',
      name: 'DeptManage',
      component: () => import('@/views/admin/sys-dept/index.vue'), // Parent router-view
      meta: { title: 'deptManage', icon: 'tree' }
    },
    {
      path: 'sys-post',
      name: 'PostManage',
      component: () => import('@/views/admin/sys-post/index.vue'), // Parent router-view
      meta: { title: 'postManage', icon: 'example' }
    },
    {
      path: 'sys-api',
      name: 'ApiMange',
      component: () => import('@/views/admin/sys-api/index.vue'), // Parent router-view
      meta: { title: 'apiManage', icon: 'international' }
    }
  ]
}

export default systemManage

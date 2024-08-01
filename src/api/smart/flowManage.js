import request from '@/utils/request'

// 获取所有流程
export async function getFlowList(params) {
  return request({
    url: '/api/v1/flowManage/list',
    method: 'get',
    params
  })
}
// 流程详情
export function flowDetails(id) {
  return request({
    url: `/api/v1/flowManage/details${id}`,
    method: 'get'
  })
}

// 创建流程
export function createFlow(data) {
  return request({
    url: '/api/v1/flowManage/create',
    method: 'post',
    data
  })
}

// 克隆流程
export function cloneFlow(id) {
  return request({
    url: `/api/v1/flowManage/clone/${id}`,
    method: 'post',
  })
}

// 更新流程
export function updateFlow(data) {
  return request({
    url: '/api/v1/flowManage/update',
    method: 'put',
    data
  })
}

// 删除流程
export function deleteFlow(data) {
  return request({
    url: '/api/v1/flowManage/delete',
    method: 'delete',
    data
  })
}


import request from '@/utils/request'

// 获取所有流程
export async function getFlowList(params) {
  return request({
    url: '/v1/flow-manage',
    method: 'get',
    params
  })
}
// 流程详情
export function flowDetails(id) {
  return request({
    url: `/v1/flow-manage/${id}`,
    method: 'get'
  })
}

// 创建流程
export function createFlow(data) {
  return request({
    url: '/v1/flow-manage',
    method: 'post',
    data
  })
}

// 克隆流程
export function cloneFlow(id) {
  return request({
    url: `/v1/flow-manage/${id}`,
    method: 'post',
  })
}

// 更新流程
export function updateFlow(data) {
  return request({
    url: '/v1/flow-manage',
    method: 'put',
    data
  })
}

// 删除流程
export function deleteFlow(data) {
  return request({
    url: '/v1/flow-manage',
    method: 'delete',
    data
  })
}


import request from '@/utils/request'

// 获取工单列表所有数据，支持分页
export async function orderWorksList(params) {
  return request({
    url: '/api/v1/order/works/list',
    method: 'get',
    params
  })
}
// 根据工单ID获取数据
export async function orderWorksSearch(id) {
  return request({
    url: `/api/v1/order/works/list${id}`,
    method: 'get',
  })
}

// 获取我创建的工单
export async function getCreatedByMeWorks(params) {
  return request({
    url: '/api/v1/order/works/createdByMe',
    method: 'get',
    params
  })
}

// 获取我相关的工单
export async function getRelatedToMeWorks(params) {
  return request({
    url: '/api/v1/order/works/relatedToMe',
    method: 'get',
    params
  })
}

// 获取我待处理的工单
export async function getMyBacklogWorks(params) {
  return request({
    url: '/api/v1/order/works/myBacklog',
    method: 'get',
    params
  })
}

// 创建工单
export async function createOrderWork(data) {
  return request({
    url: '/api/v1/order/works/create',
    method: 'post',
    data
  })
}

// 更新工单信息
export async function updateOrderWork(data) {
  return request({
    url: '/api/v1/order/works/update',
    method: 'put',
    data
  })
}

// 删除工单
export async function deleteOrderWork(data) {
  return request({
    url: '/api/v1/order/works/delete',
    method: 'delete',
    data
  })
}

// 获取工单变更历史记录
export async function orderWorkHistory(params) {
  return request({
    url: '/api/v1/order/works/history',
    method: 'get',
    params
  })
}


// 处理工单
export async function handleOrderWork(data) {
  return request({
    url: '/api/v1/order/works/handle',
    method: 'put',
    data
  })
}

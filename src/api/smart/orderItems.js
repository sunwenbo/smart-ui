import request from '@/utils/request'


// 获取工单列表
export async function itemsList(params) {
  return request({
    url: '/api/v1/order-items',
    method: 'get',
    params
  })
}


// 更新、包含收藏功能
export async function updateItems(data) {
  return request({
    url: '/api/v1/order-items',
    method: 'put',
    data
  })
}

// 创建工单items
export async function createItem(data) {
  return request({
    url: '/api/v1/order-items',
    method: 'post',
    data
  })
}

// 删除orderItems模板
export  function deleteItem(data) {
  return request({
    url: '/api/v1/order-items',
    method: 'delete',
    data
  })
}

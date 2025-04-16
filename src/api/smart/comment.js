import request from '@/utils/request'

// 获取所有留言
export async function getOrderComment(id) {
  return request({
    url: `/api/v1/order-comments/${id}`,
    method: 'get',
    id
  })
}


// 创建留言
export function createOrderComment(data) {
  return request({
    url: '/v1/order-comments',
    method: 'post',
    data
  })
}


// 更新留言
export function updateOrderComment(data) {
  return request({
    url: '/v1/order-comments',
    method: 'put',
    data
  })
}

// 删除留言
export function deleteOrderComment(data) {
  return request({
    url: '/v1/order-comments',
    method: 'delete',
    data
  })
}


// 获取指定工单的评分
export async function getOrderRating(id) {
  return request({
    url: `/api/v1/order-ratings/${id}`,
    method: 'get',
    id
  })
}

// 创建评分
export function createOrderRating(data) {
  return request({
    url: '/v1/order-ratings',
    method: 'post',
    data
  })
}


// 更新评分
export function updateOrderRating(data) {
  return request({
    url: '/v1/order-ratings',
    method: 'put',
    data
  })
}

// 删除评分
export function deleteOrderRating(data) {
  return request({
    url: '/v1/order-ratings',
    method: 'delete',
    data
  })
}




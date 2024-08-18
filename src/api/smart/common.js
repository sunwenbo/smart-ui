import request from '@/utils/request'

// 获取通知消息
export async function getOrderWorkNotify(params) {
  return request({
    url: '/api/v1/order/works/notify',
    method: 'get',
    params
  })
}

// 更新通知消息
export async function updateOrderWorkNotify(data) {
  return request({
    url: '/api/v1/order/works/notify/update',
    method: 'put',
    data
  })
}

// 发送催办通知
export async function createOrderWorkNotify(data) {
  return request({
    url: '/api/v1/order/works/notify/create',
    method: 'post',
    data
  })
}

// 发送催办通知
export async function sendFeishuNotify(data) {
  return request({
    url: '/api/v1/notify',
    method: 'post',
    data
  })
}

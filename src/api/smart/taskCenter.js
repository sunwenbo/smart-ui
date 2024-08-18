import request from '@/utils/request'

// 获取所有任务
export async function getTaskList(params) {
  return request({
    url: '/api/v1/order/task/list',
    method: 'get',
    params
  })
}

// 根据id获取指定的任务
export async function getTaskId(id) {
  return request({
    url: `/api/v1/order/task/list/${id}`,
    method: 'get'
  })
}


// 创建任务
export function createTask(data) {
  return request({
    url: '/api/v1/order/task/create',
    method: 'post',
    data
  })
}


// 更新任务
export function updateTask(data) {
  return request({
    url: '/api/v1/order/task/update',
    method: 'put',
    data
  })
}

// 删除删除
export function deleteTask(data) {
  return request({
    url: '/api/v1/order/task/delete',
    method: 'delete',
    data
  })
}


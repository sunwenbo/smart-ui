import request from '@/utils/request'

// 获取所有任务
export async function getExecMachine(params) {
  return request({
    url: '/api/v1/machine/list',
    method: 'get',
    params
  })
}

// 根据id获取指定的任务
export async function getExecMachineId(id) {
  return request({
    url: `/api/v1/machine/list/${id}`,
    method: 'get'
  })
}


// 创建任务
export function createExecMachine(data) {
  return request({
    url: '/api/v1/machine/create',
    method: 'post',
    data
  })
}


// 更新任务
export function updateExecMachine(data) {
  return request({
    url: '/api/v1/machine/update',
    method: 'put',
    data
  })
}

// 删除删除
export function deleteExecMachine(data) {
  return request({
    url: '/api/v1/machine/delete',
    method: 'delete',
    data
  })
}


// 测试连接
export function testConnExecMachine(data) {
  return request({
    url: '/api/v1/machine/testConnection',
    method: 'post',
    data
  })
}


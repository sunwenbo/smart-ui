import request from '@/utils/request'

// 获取所有执行节点
export async function getExecMachine(params) {
  return request({
    url: '/v1/exec-machine',
    method: 'get',
    params
  })
}

// 根据id获取指定的执行节点
export async function getExecMachineId(id) {
  return request({
    url: `/v1/exec-machine/${id}`,
    method: 'get'
  })
}


// 创建执行节点
export function createExecMachine(data) {
  return request({
    url: '/v1/exec-machine',
    method: 'post',
    data
  })
}


// 更新主机信息
export function updateExecMachine(data) {
  return request({
    url: '/v1/exec-machine',
    method: 'put',
    data
  })
}

// 删除删除
export function deleteExecMachine(data) {
  return request({
    url: '/v1/exec-machine',
    method: 'delete',
    data
  })
}


// 测试连接
export function testConnExecMachine(data) {
  return request({
    url: '/v1/exec-machine/testConnection',
    method: 'post',
    data
  })
}



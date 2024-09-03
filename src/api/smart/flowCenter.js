import request from '@/utils/request'

// 获取所有flow模板列表
export async function flowTemplateList(params) {
  return request({
    url: '/api/v1/flow-templates',
    method: 'get',
    params
  })
}

// 根据模板ID获取模板数据
export async function flowTemplateListId(id) {
  return request({
    url: `/api/v1/flow-templates/${id}`,
    method: 'get',
  })
}

// 创建流程模板
export async function createFlowTemplate(data) {
  return request({
    url: '/api/v1/flow-templates',
    method: 'post',
    data
  })
}

// 复制流程模板
export async function copyFlowTemplate(data) {
  return request({
    url: '/api/v1/flow-templates',
    method: 'post',
    data
  })
}

// 删除流程模板
export async function deleteFlowTemplate(data) {
  return request({
    url: '/api/v1/flow-templates',
    method: 'delete',
    data
  })
}

// 更新flowTemplate
export async function updateFlowTemplate(data) {
  return request({
    url: '/api/v1/flow-templates',
    method: 'put',
    data
  })
}

// 获取工单类别
export async function categoryList(params) {
  return request({
    url: '/api/v1/order-category',
    method: 'get',
    params
  })
}

// 创建工单类别
export async function createCateGory(data) {
  return request({
    url: '/api/v1/order-category',
    method: 'post',
    data
  })
}

// 更新工单类别
export async function updateCateGory(data) {
  return request({
    url: '/api/v1/order-category',
    method: 'put',
    data
  })
}


// 删除工单类别
export async function deleteCateGory(data) {
  return request({
    url: '/api/v1/order-category',
    method: 'delete',
    data
  })
}







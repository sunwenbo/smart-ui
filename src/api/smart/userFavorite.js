import request from '@/utils/request'


// 获取用户收藏的工单
export async function getUserFavoriteList() {
  return request({
    url: '/api/v1/favorite',
    method: 'get'
  })
}



// 收藏工单
export async function createUserFavoriteList(data) {
  return request({
    url: '/api/v1/favorite',
    method: 'post',
    data
  })
}

// 删除工单
export  function deleteUserFavoriteList(data) {
  return request({
    url: '/api/v1/favorite',
    method: 'delete',
    data
  })
}

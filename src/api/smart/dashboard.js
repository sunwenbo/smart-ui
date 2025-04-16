import request from '@/utils/request'

// 获取工单统计
export async function getOrderStatistics(params) {
  return request({
    url: '/v1/statistics/orders',
    method: 'get',
    params
  })
}

// 根据周或月统计工单数量，以及个人提交排行榜
export async function getOrderCountByPeriod(params) {
  return request({
    url: '/v1/statistics/orders/count',
    method: 'get',
    params
  })
}


// 根据周或月统计获取评分统计
export async function getOrderRatingsByPeriod(params) {
  return request({
    url: '/v1/statistics/ratings',
    method: 'get',
    params
  })
}

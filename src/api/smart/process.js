import request from '@/utils/smart-request'

// k8s 服务接入
export async function addK8sSvcPostRequest(data) {
  return request({
    url: '/api/v1/k8s/service/create',
    method: 'post',
    data
  })
}

// LDAP 用户注册
export async function ldapRegister(data) {
  return request({
    url: '/api/v1/ldap/addUser',
    method: 'post',
    data
  })
}

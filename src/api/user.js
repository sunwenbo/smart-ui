import request from '@/utils/request'

// login 登陆
export function login(data) {
  return request({
    url: '/v1/login',
    method: 'post',
    data
  })
}

// Ldap login 登陆
export function ldapLogin(data) {
  return request({
    url: '/v1/ldap/login',
    method: 'post',
    data
  })
}

// logout 退出
export function logout() {
  return request({
    url: '/v1/logout',
    method: 'post'
  })
}

// refreshtoken 刷新token
export function refreshtoken(data) {
  return request({
    url: '/refreshtoken',
    method: 'post',
    data
  })
}

// getInfo 获取用户基本信息
export function getInfo() {
  return request({
    url: '/v1/getinfo',
    method: 'get'
  })
}


import request from '@/utils/request'

// 示例 API
export function getUserInfo() {
  return request({
    url: '/user/info',
    method: 'get'
  })
}

export function login(data) {
  return request({
    url: '/user/login',
    method: 'post',
    data
  })
}

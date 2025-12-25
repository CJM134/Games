import request from './request'

export const login = (data) => {
  return request({ url: '/user/login', method: 'post', data })
}

export const register = (data) => {
  return request({ url: '/user/register', method: 'post', data })
}

export const getUserInfo = (id) => {
  return request({ url: `/user/${id}`, method: 'get' })
}

import request from './request'

export const getCategoryList = () => {
  return request({ url: '/category/list', method: 'get' })
}

export const getCategories = getCategoryList

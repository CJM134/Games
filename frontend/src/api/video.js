import request from './request'

export const getVideoList = (params) => {
  return request({ url: '/video/list', method: 'get', params })
}

export const getVideoDetail = (id) => {
  return request({ url: `/video/${id}`, method: 'get' })
}

export const uploadVideo = (data) => {
  return request({ url: '/video/upload', method: 'post', data })
}

export const searchVideos = (params) => {
  return request({ url: '/video/search', method: 'get', params })
}

export const getRecommendVideos = (params) => {
  return request({ url: '/video/recommend', method: 'get', params })
}

export const updateVideo = (id, data) => {
  return request({ url: `/video/${id}`, method: 'put', data })
}

export const deleteVideo = (id) => {
  return request({ url: `/video/${id}`, method: 'delete' })
}

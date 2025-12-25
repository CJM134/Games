import request from './request'

export const getCommentList = (videoId) => {
  return request({ url: `/comment/list/${videoId}`, method: 'get' })
}

export const addComment = (data) => {
  return request({ url: '/comment/add', method: 'post', data })
}

export const deleteComment = (id) => {
  return request({ url: `/comment/${id}`, method: 'delete' })
}

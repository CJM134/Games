import request from './request'

// 获取动态列表
export const getMomentList = (params) => {
  return request.get('/moment/list', { params })
}

// 发布动态
export const publishMoment = (data) => {
  return request.post('/moment/publish', data)
}

// 点赞动态
export const likeMoment = (id, userId) => {
  return request.post(`/moment/${id}/like`, null, { params: { userId } })
}

// 取消点赞
export const unlikeMoment = (id, userId) => {
  return request.delete(`/moment/${id}/like`, { params: { userId } })
}

// 删除动态
export const deleteMoment = (id) => {
  return request.delete(`/moment/${id}`)
}

// 获取评论
export const getComments = (momentId) => {
  return request.get(`/moment/${momentId}/comments`)
}

// 添加评论
export const addComment = (momentId, data) => {
  return request.post(`/moment/${momentId}/comment`, data)
}

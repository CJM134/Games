import request from './request'

// 获取通知列表
export const getNotifications = (userId, limit = 50) => {
  return request.get('/notification/list', { params: { userId, limit } })
}

// 标记单个通知为已读
export const markAsRead = (id) => {
  return request.put(`/notification/${id}/read`)
}

// 标记所有通知为已读
export const markAllAsRead = (userId) => {
  return request.put('/notification/read-all', null, { params: { userId } })
}

// 获取未读通知数
export const getUnreadCount = (userId) => {
  return request.get('/notification/unread-count', { params: { userId } })
}

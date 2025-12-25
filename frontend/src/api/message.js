import request from './request'

// 发送消息
export const sendMessage = (data) => {
  return request.post('/message/send', null, { params: data })
}

// 获取会话列表
export const getConversations = (userId) => {
  return request.get('/message/conversations', { params: { userId } })
}

// 获取会话消息
export const getConversationMessages = (userId, otherUserId) => {
  return request.get(`/message/conversation/${otherUserId}`, { params: { userId } })
}

// 获取未读消息数
export const getUnreadCount = (userId) => {
  return request.get('/message/unread', { params: { userId } })
}

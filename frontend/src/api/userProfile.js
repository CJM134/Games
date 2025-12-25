import request from './request'

// 获取用户资料
export const getUserProfile = (userId, currentUserId) => {
  return request({ 
    url: `/user/profile/${userId}`, 
    method: 'get',
    params: { currentUserId }
  })
}

// 获取用户投稿视频
export const getUserVideos = (userId) => {
  return request({ 
    url: `/user/profile/${userId}/videos`, 
    method: 'get'
  })
}

// 获取用户收藏视频
export const getUserCollects = (userId) => {
  return request({ 
    url: `/user/profile/${userId}/collects`, 
    method: 'get'
  })
}

// 更新用户资料
export const updateProfile = (userId, data) => {
  return request({ 
    url: `/user/profile/${userId}`, 
    method: 'put',
    data
  })
}

// 上传头像
export const uploadAvatar = (userId, file) => {
  const formData = new FormData()
  formData.append('file', file)
  return request({ 
    url: `/user/profile/${userId}/avatar`, 
    method: 'post',
    data: formData,
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

// 关注用户
export const followUser = (userId, followUserId) => {
  return request({ 
    url: `/user/profile/follow/${followUserId}`, 
    method: 'post',
    params: { userId }
  })
}

// 取消关注
export const unfollowUser = (userId, followUserId) => {
  return request({ 
    url: `/user/profile/follow/${followUserId}`, 
    method: 'delete',
    params: { userId }
  })
}

// 获取关注列表
export const getFollowList = (userId) => {
  return request({ 
    url: `/user/profile/${userId}/follows`, 
    method: 'get'
  })
}

// 获取粉丝列表
export const getFansList = (userId) => {
  return request({ 
    url: `/user/profile/${userId}/fans`, 
    method: 'get'
  })
}

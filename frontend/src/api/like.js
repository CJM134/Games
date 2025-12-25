import request from './request'

// 点赞视频
export const likeVideo = (videoId, userId) => {
  return request({ 
    url: `/video/like/${videoId}`, 
    method: 'post',
    params: { userId }
  })
}

// 取消点赞
export const unlikeVideo = (videoId, userId) => {
  return request({ 
    url: `/video/like/${videoId}`, 
    method: 'delete',
    params: { userId }
  })
}

// 获取点赞状态
export const getLikeStatus = (videoId, userId) => {
  return request({ 
    url: `/video/like/status/${videoId}`, 
    method: 'get',
    params: { userId }
  })
}

// 收藏视频
export const collectVideo = (videoId, userId) => {
  return request({ 
    url: `/video/collect/${videoId}`, 
    method: 'post',
    params: { userId }
  })
}

// 取消收藏
export const uncollectVideo = (videoId, userId) => {
  return request({ 
    url: `/video/collect/${videoId}`, 
    method: 'delete',
    params: { userId }
  })
}

// 获取收藏状态
export const getCollectStatus = (videoId, userId) => {
  return request({ 
    url: `/video/collect/status/${videoId}`, 
    method: 'get',
    params: { userId }
  })
}

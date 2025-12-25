<template>
  <div class="video-detail" v-if="video">
    <div class="video-player">
      <video controls :src="getFullUrl(video.videoUrl)" style="width: 100%; max-height: 600px;"></video>
    </div>

    <div class="video-info-section">
      <h1>{{ video.title }}</h1>
      <div class="video-stats">
        <span>{{ formatCount(video.playCount) }} 播放</span>
        <span>{{ formatDate(video.createTime) }}</span>
      </div>
      
      <!-- UP主信息 -->
      <div class="uploader-info" @click="goToUploader">
        <el-avatar :src="getFullUrl(video.userAvatar)" :size="48" />
        <div class="uploader-details">
          <div class="uploader-name">{{ video.userName }}</div>
          <div class="uploader-stats">UP主</div>
        </div>
      </div>
      
      <div class="video-actions">
        <el-button 
          :type="isLiked ? 'primary' : ''" 
          @click="toggleLike"
          :loading="likeLoading">
          <el-icon><VideoPlay /></el-icon> 
          {{ isLiked ? '已点赞' : '点赞' }} {{ formatCount(likeCount) }}
        </el-button>
        <el-button 
          :type="isCollected ? 'warning' : ''" 
          @click="toggleCollect"
          :loading="collectLoading">
          <el-icon><Star /></el-icon> 
          {{ isCollected ? '已收藏' : '收藏' }} {{ formatCount(collectCount) }}
        </el-button>
        <el-button>
          <el-icon><Share /></el-icon> 
          分享 {{ formatCount(video.shareCount) }}
        </el-button>
      </div>
      <div class="video-description">
        <p>{{ video.description }}</p>
      </div>
    </div>

    <div class="comment-section">
      <h3>评论 {{ totalCommentCount }}</h3>
      <div class="comment-input">
        <el-input
          v-model="commentContent"
          type="textarea"
          :rows="3"
          placeholder="发表评论..." />
        <el-button type="primary" @click="submitComment">发表</el-button>
      </div>
      <div class="comment-list">
        <div 
          v-for="comment in comments" 
          :key="comment.id" 
          class="comment-item"
          :class="{ 'author-comment': comment.userId === video.userId }">
          <el-avatar :src="getFullUrl(comment.userAvatar)" />
          <div class="comment-content">
            <div class="comment-user">
              {{ comment.userName }}
              <span v-if="comment.userId === video.userId" class="author-badge">UP主</span>
            </div>
            <div class="comment-text">{{ comment.content }}</div>
            <div class="comment-actions">
              <span class="comment-time">{{ formatTime(comment.createTime) }}</span>
              <el-button text size="small" @click="showReplyInput(comment.id)">
                回复 {{ comment.replyCount > 0 ? `(${comment.replyCount})` : '' }}
              </el-button>
              <el-button 
                v-if="canDeleteComment(comment.userId)" 
                text 
                size="small" 
                type="danger"
                @click="handleDeleteComment(comment.id)">
                删除
              </el-button>
            </div>
            
            <!-- 回复输入框 -->
            <div v-if="replyingTo === comment.id" class="reply-input">
              <el-input
                v-model="replyContent"
                type="textarea"
                :rows="2"
                :placeholder="`回复 ${comment.userName}...`" />
              <div class="reply-actions">
                <el-button size="small" @click="cancelReply">取消</el-button>
                <el-button type="primary" size="small" @click="submitReply(comment.id)">回复</el-button>
              </div>
            </div>
            
            <!-- 回复列表 -->
            <div v-if="comment.replies && comment.replies.length > 0" class="reply-list">
              <div 
                v-for="reply in comment.replies" 
                :key="reply.id" 
                class="reply-item"
                :class="{ 'author-comment': reply.userId === video.userId }">
                <el-avatar :src="getFullUrl(reply.userAvatar)" size="small" />
                <div class="reply-content">
                  <div class="reply-user">
                    {{ reply.userName }}
                    <span v-if="reply.userId === video.userId" class="author-badge">UP主</span>
                  </div>
                  <div class="reply-text">{{ reply.content }}</div>
                  <div class="reply-actions-row">
                    <span class="reply-time">{{ formatTime(reply.createTime) }}</span>
                    <el-button 
                      v-if="canDeleteComment(reply.userId)" 
                      text 
                      size="small" 
                      type="danger"
                      @click="handleDeleteComment(reply.id, true)">
                      删除
                    </el-button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { VideoPlay, Star, Share } from '@element-plus/icons-vue'
import { getVideoDetail } from '../api/video'
import { getCommentList, addComment, deleteComment } from '../api/comment'
import { getLikeStatus, likeVideo, unlikeVideo, getCollectStatus, collectVideo, uncollectVideo } from '../api/like'
import { useUserStore } from '../stores/user'
import { ElMessage, ElMessageBox } from 'element-plus'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const video = ref(null)
const comments = ref([])
const commentContent = ref('')
const replyingTo = ref(null)
const replyContent = ref('')

// 点赞收藏状态
const isLiked = ref(false)
const isCollected = ref(false)
const likeCount = ref(0)
const collectCount = ref(0)
const likeLoading = ref(false)
const collectLoading = ref(false)

// 计算总评论数（包括回复）
const totalCommentCount = computed(() => {
  let total = comments.value.length
  comments.value.forEach(comment => {
    if (comment.replyCount) {
      total += comment.replyCount
    }
  })
  return total
})

const loadVideo = async () => {
  video.value = await getVideoDetail(route.params.id)
  // 加载点赞收藏状态
  if (userStore.userInfo) {
    loadLikeStatus()
    loadCollectStatus()
  }
}

const loadLikeStatus = async () => {
  try {
    const status = await getLikeStatus(route.params.id, userStore.userInfo.id)
    isLiked.value = status.isLiked
    likeCount.value = status.likeCount
  } catch (error) {
    console.error('加载点赞状态失败:', error)
  }
}

const loadCollectStatus = async () => {
  try {
    const status = await getCollectStatus(route.params.id, userStore.userInfo.id)
    isCollected.value = status.isCollected
    collectCount.value = status.collectCount
  } catch (error) {
    console.error('加载收藏状态失败:', error)
  }
}

const toggleLike = async () => {
  if (!userStore.userInfo) {
    ElMessage.warning('请先登录')
    return
  }
  
  likeLoading.value = true
  try {
    if (isLiked.value) {
      await unlikeVideo(route.params.id, userStore.userInfo.id)
      isLiked.value = false
      likeCount.value--
      ElMessage.success('取消点赞')
    } else {
      await likeVideo(route.params.id, userStore.userInfo.id)
      isLiked.value = true
      likeCount.value++
      ElMessage.success('点赞成功')
    }
  } catch (error) {
    ElMessage.error(error.message || '操作失败')
  } finally {
    likeLoading.value = false
  }
}

const toggleCollect = async () => {
  if (!userStore.userInfo) {
    ElMessage.warning('请先登录')
    return
  }
  
  collectLoading.value = true
  try {
    if (isCollected.value) {
      await uncollectVideo(route.params.id, userStore.userInfo.id)
      isCollected.value = false
      collectCount.value--
      ElMessage.success('取消收藏')
    } else {
      await collectVideo(route.params.id, userStore.userInfo.id)
      isCollected.value = true
      collectCount.value++
      ElMessage.success('收藏成功')
    }
  } catch (error) {
    ElMessage.error(error.message || '操作失败')
  } finally {
    collectLoading.value = false
  }
}

const loadComments = async () => {
  comments.value = await getCommentList(route.params.id)
}

const goToUploader = () => {
  if (video.value && video.value.userId) {
    router.push(`/user/${video.value.userId}`)
  }
}

const submitComment = async () => {
  if (!userStore.userInfo) {
    ElMessage.warning('请先登录')
    return
  }
  if (!commentContent.value.trim()) {
    ElMessage.warning('请输入评论内容')
    return
  }
  await addComment({
    videoId: route.params.id,
    userId: userStore.userInfo.id,
    content: commentContent.value
  })
  commentContent.value = ''
  loadComments()
  ElMessage.success('评论成功')
}

const showReplyInput = (commentId) => {
  if (!userStore.userInfo) {
    ElMessage.warning('请先登录')
    return
  }
  replyingTo.value = commentId
  replyContent.value = ''
}

const cancelReply = () => {
  replyingTo.value = null
  replyContent.value = ''
}

const submitReply = async (parentId) => {
  if (!userStore.userInfo) {
    ElMessage.warning('请先登录')
    return
  }
  if (!replyContent.value.trim()) {
    ElMessage.warning('请输入回复内容')
    return
  }
  await addComment({
    videoId: route.params.id,
    userId: userStore.userInfo.id,
    parentId: parentId,
    content: replyContent.value
  })
  replyContent.value = ''
  replyingTo.value = null
  loadComments()
  ElMessage.success('回复成功')
}

const handleDeleteComment = async (commentId, isReply = false) => {
  try {
    await ElMessageBox.confirm('确定要删除这条评论吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await deleteComment(commentId)
    ElMessage.success('删除成功')
    loadComments()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

const canDeleteComment = (commentUserId) => {
  // 评论作者或视频作者可以删除评论
  return userStore.userInfo && (
    userStore.userInfo.id === commentUserId || 
    userStore.userInfo.id === video.value?.userId
  )
}

const formatCount = (count) => {
  if (count >= 10000) return (count / 10000).toFixed(1) + '万'
  return count
}

const getFullUrl = (url) => {
  if (!url) return ''
  if (url.startsWith('http')) return url
  return 'http://localhost:8080' + url
}

const formatDate = (time) => {
  if (!time) return ''
  const date = new Date(time)
  return date.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' })
}

const formatTime = (time) => {
  if (!time) return ''
  const date = new Date(time)
  const now = new Date()
  const diff = now - date
  
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  
  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 7) return `${days}天前`
  
  return date.toLocaleDateString('zh-CN')
}

onMounted(() => {
  loadVideo()
  loadComments()
})
</script>

<style scoped>
.video-detail {
  max-width: 1200px;
  margin: 0 auto;
}

.video-player {
  background: #000;
  margin-bottom: 20px;
}

.video-info-section {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.video-info-section h1 {
  font-size: 20px;
  margin-bottom: 10px;
}

.video-stats {
  display: flex;
  gap: 20px;
  color: #999;
  margin-bottom: 15px;
}

.uploader-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 8px;
  margin-bottom: 15px;
  cursor: pointer;
  transition: all 0.2s;
}

.uploader-info:hover {
  background: #e6f4ff;
  transform: translateX(4px);
}

.uploader-details {
  flex: 1;
}

.uploader-name {
  font-size: 15px;
  font-weight: bold;
  color: #333;
  margin-bottom: 2px;
}

.uploader-stats {
  font-size: 12px;
  color: #00a1d6;
}

.video-actions {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.video-description {
  padding-top: 20px;
  border-top: 1px solid #e5e5e5;
}

.comment-section {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
}

.comment-input {
  margin: 20px 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.comment-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.comment-item {
  display: flex;
  gap: 12px;
  padding: 15px;
  border-radius: 8px;
  transition: background 0.2s;
}

.comment-item:hover {
  background: #f5f7fa;
}

.author-comment {
  background: #f0f9ff;
  border-left: 3px solid #00a1d6;
}

.author-comment:hover {
  background: #e6f4ff;
}

.comment-content {
  flex: 1;
}

.comment-user {
  font-weight: bold;
  margin-bottom: 5px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.author-badge {
  background: linear-gradient(135deg, #00a1d6 0%, #0084ff 100%);
  color: white;
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 10px;
  font-weight: normal;
}

.comment-actions {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-top: 5px;
}

.comment-time {
  font-size: 12px;
  color: #999;
}

.reply-input {
  margin-top: 10px;
  padding: 10px;
  background: #f5f7fa;
  border-radius: 8px;
}

.reply-actions {
  margin-top: 8px;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.reply-list {
  margin-top: 15px;
  padding-left: 20px;
  border-left: 2px solid #e5e5e5;
}

.reply-item {
  display: flex;
  gap: 10px;
  padding: 10px;
  margin-bottom: 10px;
  border-radius: 6px;
  background: #fafafa;
}

.reply-item.author-comment {
  background: #f0f9ff;
}

.reply-content {
  flex: 1;
}

.reply-user {
  font-weight: bold;
  font-size: 13px;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.reply-text {
  font-size: 14px;
  line-height: 1.6;
  margin-bottom: 4px;
}

.reply-time {
  font-size: 11px;
  color: #999;
}

.reply-actions-row {
  display: flex;
  align-items: center;
  gap: 10px;
}
</style>

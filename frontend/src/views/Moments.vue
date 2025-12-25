<template>
  <div class="moments-page">
    <div class="moments-layout">
      <!-- 左侧排行榜 -->
      <div class="rank-sidebar">
        <el-card class="rank-card">
          <template #header>
            <div class="rank-header">
              <span>🏆 热门排行</span>
            </div>
          </template>
          <div class="rank-list">
            <div v-for="(item, index) in topMoments" :key="item.id" class="rank-item" @click="scrollToMoment(item.id)">
              <div class="rank-number" :class="'rank-' + (index + 1)">{{ index + 1 }}</div>
              <div class="rank-content">
                <div class="rank-user">{{ item.userName }}</div>
                <div class="rank-text">{{ item.content.substring(0, 30) }}...</div>
                <div class="rank-stats">
                  <span>❤️ {{ item.likeCount }}</span>
                  <span>💬 {{ item.commentCount }}</span>
                </div>
              </div>
            </div>
          </div>
        </el-card>
      </div>

      <!-- 中间动态区域 -->
      <div class="moments-container">
      <!-- 发布动态区域 -->
      <div class="publish-section" v-if="userStore.userInfo">
        <el-card>
          <div class="publish-header">
            <el-avatar :src="getFullUrl(userStore.userInfo.avatar)" :size="48" />
            <h3>分享新鲜事...</h3>
          </div>
          <el-input
            v-model="newMoment"
            type="textarea"
            :rows="4"
            placeholder="分享你的日常、学习心得、生活感悟..."
            maxlength="500"
            show-word-limit />
          <div class="publish-actions">
            <el-button type="primary" @click="publishMoment" :loading="publishing">
              <el-icon><Promotion /></el-icon>
              发布动态
            </el-button>
          </div>
        </el-card>
      </div>

      <!-- 动态列表 -->
      <div class="moments-list">
        <el-card v-for="moment in moments" :key="moment.id" :id="`moment-${moment.id}`" class="moment-card">
          <div class="moment-header">
            <el-avatar :src="getFullUrl(moment.userAvatar)" :size="48" @click="goToUser(moment.userId)" style="cursor: pointer;" />
            <div class="moment-user-info">
              <div class="moment-username" @click="goToUser(moment.userId)" style="cursor: pointer;">{{ moment.userName }}</div>
              <div class="moment-time">{{ formatTime(moment.createTime) }}</div>
            </div>
            <el-button 
              v-if="userStore.userInfo && userStore.userInfo.id === moment.userId"
              text 
              type="danger"
              @click="deleteMoment(moment.id)">
              删除
            </el-button>
          </div>
          
          <div class="moment-content">
            {{ moment.content }}
          </div>
          
          <div class="moment-actions">
            <el-button 
              text 
              :type="moment.isLiked ? 'primary' : ''"
              @click="toggleLike(moment)">
              <el-icon><Star /></el-icon>
              {{ moment.likeCount || 0 }}
            </el-button>
            <el-button 
              text
              @click="toggleComments(moment)">
              <el-icon><ChatDotRound /></el-icon>
              {{ moment.commentCount || 0 }}
            </el-button>
            <el-button text>
              <el-icon><Share /></el-icon>
              {{ moment.shareCount || 0 }}
            </el-button>
          </div>
          
          <!-- 评论区域 -->
          <div v-if="moment.showComments" class="comments-section">
            <div class="comment-input-box">
              <el-input
                v-model="moment.newComment"
                placeholder="说点什么..."
                @keyup.enter="submitComment(moment)" />
              <el-button type="primary" size="small" @click="submitComment(moment)">发送</el-button>
            </div>
            
            <div class="comments-list">
              <div v-for="comment in moment.comments" :key="comment.id" class="comment-item">
                <el-avatar :src="getFullUrl(comment.userAvatar)" :size="32" />
                <div class="comment-content">
                  <div class="comment-user">{{ comment.userName }}</div>
                  <div class="comment-text">{{ comment.content }}</div>
                  <div class="comment-time">{{ formatTime(comment.createTime) }}</div>
                </div>
              </div>
              <div v-if="!moment.comments || moment.comments.length === 0" class="no-comments">
                暂无评论，快来抢沙发吧~
              </div>
            </div>
          </div>
        </el-card>
        
        <el-empty v-if="moments.length === 0" description="还没有动态，快来发布第一条吧！" />
      </div>
    </div>

      <!-- 分页 -->
      <div class="pagination" v-if="total > 0">
        <el-pagination
          v-model:current-page="currentPage"
          :page-size="pageSize"
          :total="total"
          layout="total, prev, pager, next"
          @current-change="loadMoments" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Promotion, Star, ChatDotRound, Share } from '@element-plus/icons-vue'
import { useUserStore } from '../stores/user'
import { getMomentList, publishMoment as publishMomentApi, likeMoment, unlikeMoment, deleteMoment as deleteMomentApi, getComments, addComment } from '../api/moment'
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()
const userStore = useUserStore()

const moments = ref([])
const topMoments = ref([])
const newMoment = ref('')
const publishing = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

const loadMoments = async () => {
  try {
    const result = await getMomentList({
      page: currentPage.value,
      size: pageSize.value,
      userId: userStore.userInfo?.id
    })
    moments.value = result.records.map(m => ({
      ...m,
      showComments: false,
      newComment: '',
      comments: []
    }))
    total.value = result.total
    
    // 更新排行榜（取点赞数最多的前5个）
    topMoments.value = [...result.records]
      .sort((a, b) => (b.likeCount + b.commentCount * 2) - (a.likeCount + a.commentCount * 2))
      .slice(0, 5)
  } catch (error) {
    console.error('加载动态失败:', error)
  }
}

const publishMoment = async () => {
  if (!userStore.userInfo) {
    ElMessage.warning('请先登录')
    return
  }
  
  if (!newMoment.value.trim()) {
    ElMessage.warning('请输入动态内容')
    return
  }
  
  publishing.value = true
  try {
    await publishMomentApi({
      userId: userStore.userInfo.id,
      content: newMoment.value
    })
    ElMessage.success('发布成功')
    newMoment.value = ''
    currentPage.value = 1
    loadMoments()
  } catch (error) {
    ElMessage.error('发布失败')
  } finally {
    publishing.value = false
  }
}

const toggleLike = async (moment) => {
  if (!userStore.userInfo) {
    ElMessage.warning('请先登录')
    return
  }
  
  try {
    if (moment.isLiked) {
      await unlikeMoment(moment.id, userStore.userInfo.id)
      moment.isLiked = false
      moment.likeCount--
    } else {
      await likeMoment(moment.id, userStore.userInfo.id)
      moment.isLiked = true
      moment.likeCount++
    }
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

const deleteMoment = async (momentId) => {
  try {
    await ElMessageBox.confirm('确定要删除这条动态吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await deleteMomentApi(momentId)
    ElMessage.success('删除成功')
    loadMoments()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

const toggleComments = async (moment) => {
  moment.showComments = !moment.showComments
  
  if (moment.showComments && (!moment.comments || moment.comments.length === 0)) {
    try {
      moment.comments = await getComments(moment.id)
    } catch (error) {
      ElMessage.error('加载评论失败')
    }
  }
}

const submitComment = async (moment) => {
  if (!userStore.userInfo) {
    ElMessage.warning('请先登录')
    return
  }
  
  if (!moment.newComment.trim()) {
    ElMessage.warning('请输入评论内容')
    return
  }
  
  try {
    await addComment(moment.id, {
      userId: userStore.userInfo.id,
      content: moment.newComment
    })
    ElMessage.success('评论成功')
    moment.newComment = ''
    moment.commentCount++
    // 重新加载评论
    moment.comments = await getComments(moment.id)
  } catch (error) {
    ElMessage.error('评论失败')
  }
}

const scrollToMoment = (momentId) => {
  // 滚动到指定动态
  const element = document.getElementById(`moment-${momentId}`)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }
}

const goToUser = (userId) => {
  router.push(`/user/${userId}`)
}

const getFullUrl = (url) => {
  if (!url) return 'http://localhost:8080/images/default.png'
  if (url.startsWith('http')) return url
  return 'http://localhost:8080' + url
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
  loadMoments()
})
</script>

<style scoped>
.moments-page {
  padding: 20px;
}

.moments-layout {
  display: flex;
  gap: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.rank-sidebar {
  width: 300px;
  flex-shrink: 0;
}

.rank-card {
  position: sticky;
  top: 80px;
}

.rank-header {
  font-weight: bold;
  font-size: 16px;
}

.rank-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.rank-item {
  display: flex;
  gap: 10px;
  padding: 10px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
}

.rank-item:hover {
  background: #f5f7fa;
}

.rank-number {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 14px;
  flex-shrink: 0;
  background: #e5e5e5;
  color: #666;
}

.rank-number.rank-1 {
  background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
  color: #fff;
}

.rank-number.rank-2 {
  background: linear-gradient(135deg, #c0c0c0 0%, #e8e8e8 100%);
  color: #fff;
}

.rank-number.rank-3 {
  background: linear-gradient(135deg, #cd7f32 0%, #daa520 100%);
  color: #fff;
}

.rank-content {
  flex: 1;
  min-width: 0;
}

.rank-user {
  font-weight: bold;
  font-size: 13px;
  margin-bottom: 4px;
}

.rank-text {
  font-size: 12px;
  color: #666;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-bottom: 4px;
}

.rank-stats {
  display: flex;
  gap: 10px;
  font-size: 11px;
  color: #999;
}

.moments-container {
  flex: 1;
  min-width: 0;
}

.publish-section {
  margin-bottom: 20px;
}

.publish-header {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 15px;
}

.publish-header h3 {
  margin: 0;
  color: #666;
}

.publish-actions {
  margin-top: 15px;
  display: flex;
  justify-content: flex-end;
}

.moments-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.moment-card {
  transition: box-shadow 0.2s;
}

.moment-card:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.moment-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 15px;
}

.moment-user-info {
  flex: 1;
}

.moment-username {
  font-weight: bold;
  font-size: 15px;
  color: #333;
}

.moment-username:hover {
  color: #00a1d6;
}

.moment-time {
  font-size: 12px;
  color: #999;
  margin-top: 2px;
}

.moment-content {
  font-size: 15px;
  line-height: 1.6;
  color: #333;
  margin-bottom: 15px;
  white-space: pre-wrap;
  word-break: break-word;
}

.moment-actions {
  display: flex;
  gap: 20px;
  padding-top: 15px;
  border-top: 1px solid #f0f0f0;
}

.comments-section {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #f0f0f0;
}

.comment-input-box {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.comment-item {
  display: flex;
  gap: 10px;
}

.comment-content {
  flex: 1;
}

.comment-user {
  font-weight: bold;
  font-size: 13px;
  margin-bottom: 4px;
}

.comment-text {
  font-size: 14px;
  color: #333;
  margin-bottom: 4px;
}

.comment-time {
  font-size: 11px;
  color: #999;
}

.no-comments {
  text-align: center;
  color: #999;
  font-size: 13px;
  padding: 20px;
}

.pagination {
  margin-top: 30px;
  display: flex;
  justify-content: center;
}
</style>

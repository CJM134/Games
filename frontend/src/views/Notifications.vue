<template>
  <div class="notifications-page">
    <div class="notifications-container">
      <div class="notifications-header">
        <h2>通知</h2>
        <el-button 
          v-if="notifications.some(n => !n.isRead)" 
          type="text" 
          @click="handleMarkAllRead">
          全部已读
        </el-button>
      </div>

      <div class="notifications-list">
        <div 
          v-for="notif in notifications" 
          :key="notif.id"
          class="notification-item"
          :class="{ unread: !notif.isRead }"
          @click="handleNotificationClick(notif)">
          <el-avatar :src="getFullUrl(notif.fromUserAvatar)" :size="48" />
          <div class="notif-content">
            <div class="notif-text">
              <span class="user-name">{{ notif.fromUserName }}</span>
              <span class="action-text">{{ getActionText(notif.type) }}</span>
              <span v-if="notif.relatedTitle" class="related-title">《{{ notif.relatedTitle }}》</span>
            </div>
            <div class="notif-time">{{ formatTime(notif.createTime) }}</div>
          </div>
          <div v-if="!notif.isRead" class="unread-dot"></div>
        </div>
        <el-empty v-if="notifications.length === 0" description="暂无通知" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import { getNotifications, markAsRead, markAllAsRead } from '../api/notification'
import { ElMessage } from 'element-plus'

const router = useRouter()
const userStore = useUserStore()
const notifications = ref([])

const loadNotifications = async () => {
  if (!userStore.userInfo) return
  try {
    notifications.value = await getNotifications(userStore.userInfo.id)
  } catch (error) {
    console.error('加载通知失败:', error)
  }
}

const handleNotificationClick = async (notif) => {
  // 标记为已读
  if (!notif.isRead) {
    try {
      await markAsRead(notif.id)
      notif.isRead = true
      // 通知父组件更新未读数
      window.dispatchEvent(new CustomEvent('update-notification-count'))
    } catch (error) {
      console.error('标记已读失败:', error)
    }
  }

  // 根据通知类型跳转
  if (notif.type === 'follow') {
    router.push(`/user/${notif.fromUserId}`)
  } else if (notif.relatedId) {
    router.push(`/video/${notif.relatedId}`)
  }
}

const handleMarkAllRead = async () => {
  try {
    await markAllAsRead(userStore.userInfo.id)
    notifications.value.forEach(n => n.isRead = true)
    ElMessage.success('已全部标记为已读')
    // 通知父组件更新未读数
    window.dispatchEvent(new CustomEvent('update-notification-count'))
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

const getActionText = (type) => {
  const actions = {
    'follow': '关注了你',
    'like': '点赞了你的视频',
    'collect': '收藏了你的视频',
    'comment': '评论了你的视频'
  }
  return actions[type] || ''
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
  loadNotifications()
})
</script>

<style scoped>
.notifications-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.notifications-container {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
}

.notifications-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e5e5e5;
}

.notifications-header h2 {
  margin: 0;
  font-size: 20px;
}

.notifications-list {
  max-height: calc(100vh - 200px);
  overflow-y: auto;
}

.notification-item {
  display: flex;
  align-items: center;
  padding: 15px 20px;
  cursor: pointer;
  position: relative;
  transition: background 0.2s;
  border-bottom: 1px solid #f5f5f5;
}

.notification-item:hover {
  background: #f5f7fa;
}

.notification-item.unread {
  background: #f0f9ff;
}

.notif-content {
  flex: 1;
  margin-left: 12px;
  overflow: hidden;
}

.notif-text {
  font-size: 14px;
  line-height: 1.6;
  margin-bottom: 4px;
}

.user-name {
  font-weight: bold;
  color: #00a1d6;
}

.action-text {
  color: #333;
  margin: 0 4px;
}

.related-title {
  color: #666;
}

.notif-time {
  font-size: 12px;
  color: #999;
}

.unread-dot {
  width: 8px;
  height: 8px;
  background: #ff6b6b;
  border-radius: 50%;
  position: absolute;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
}
</style>

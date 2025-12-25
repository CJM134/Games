<template>
  <div class="layout">
    <header class="header">
      <div class="header-content">
        <div class="logo" @click="$router.push('/')">
          <span class="logo-text">哔哩哔哩</span>
        </div>
        <div class="search">
          <el-input v-model="searchKeyword" placeholder="搜索视频" @keyup.enter="handleSearch">
            <template #append>
              <el-button :icon="Search" @click="handleSearch" />
            </template>
          </el-input>
        </div>
        <div class="user-actions">
          <el-button type="primary" @click="$router.push('/upload')">
            <el-icon><Upload /></el-icon>
            投稿
          </el-button>
          <el-button @click="$router.push('/messages')">
            <el-icon><ChatDotRound /></el-icon>
            消息
            <el-badge v-if="unreadMessageCount > 0" :value="unreadMessageCount" class="message-badge" />
          </el-button>
          <el-button @click="$router.push('/notifications')">
            <el-icon><Bell /></el-icon>
            通知
            <el-badge v-if="unreadNotificationCount > 0" :value="unreadNotificationCount" class="notification-badge" />
          </el-button>
        </div>
        <div class="user-section">
          <div v-if="userStore.userInfo" class="user-info">
            <el-avatar :src="userAvatar" @click="goToProfile" style="cursor: pointer;" />
            <span class="username" @click="goToProfile" style="cursor: pointer;">{{ userStore.userInfo.nickname }}</span>
            <el-button type="danger" size="small" @click="handleLogout">退出</el-button>
          </div>
          <el-button v-else @click="$router.push('/login')">登录</el-button>
        </div>
      </div>
    </header>
    
    <main class="main">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { Search, Upload, ChatDotRound, Bell } from '@element-plus/icons-vue'
import { useUserStore } from '../stores/user'
import { getUnreadCount } from '../api/message'
import { getUnreadCount as getNotificationUnreadCount } from '../api/notification'

const router = useRouter()
const userStore = useUserStore()
const searchKeyword = ref('')
const unreadMessageCount = ref(0)
const unreadNotificationCount = ref(0)

const getFullUrl = (url) => {
  if (!url) return 'http://localhost:8080/images/default.png'
  if (url.startsWith('http')) return url
  return 'http://localhost:8080' + url
}

const userAvatar = computed(() => {
  return userStore.userInfo ? getFullUrl(userStore.userInfo.avatar) : ''
})

const loadUnreadCount = async () => {
  if (userStore.userInfo) {
    try {
      const result = await getUnreadCount(userStore.userInfo.id)
      unreadMessageCount.value = result.unreadCount
    } catch (error) {
      console.error('加载未读消息数失败:', error)
    }
  }
}

const loadNotificationUnreadCount = async () => {
  if (userStore.userInfo) {
    try {
      const result = await getNotificationUnreadCount(userStore.userInfo.id)
      unreadNotificationCount.value = result.unreadCount
    } catch (error) {
      console.error('加载未读通知数失败:', error)
    }
  }
}

const handleSearch = () => {
  if (searchKeyword.value.trim()) {
    router.push({ name: 'Home', query: { keyword: searchKeyword.value } })
  }
}

const handleLogout = () => {
  userStore.clearUserInfo()
  router.push('/login')
}

const goToProfile = () => {
  if (userStore.userInfo) {
    router.push(`/user/${userStore.userInfo.id}`)
  }
}

onMounted(() => {
  loadUnreadCount()
  loadNotificationUnreadCount()
  // 每30秒刷新一次未读消息数和通知数
  setInterval(() => {
    loadUnreadCount()
    loadNotificationUnreadCount()
  }, 30000)
  
  // 监听未读消息更新事件
  window.addEventListener('update-unread-count', loadUnreadCount)
  // 监听未读通知更新事件
  window.addEventListener('update-notification-count', loadNotificationUnreadCount)
})

onUnmounted(() => {
  window.removeEventListener('update-unread-count', loadUnreadCount)
  window.removeEventListener('update-notification-count', loadNotificationUnreadCount)
})
</script>

<style scoped>
.layout {
  min-height: 100vh;
}

.header {
  background: #fff;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;
  height: 60px;
  display: flex;
  align-items: center;
  gap: 20px;
}

.logo {
  cursor: pointer;
  font-size: 24px;
  font-weight: bold;
  color: #00a1d6;
}

.search {
  flex: 1;
  max-width: 500px;
}

.user-actions {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-left: auto;
  position: relative;
}

.message-badge,
.notification-badge {
  position: absolute;
  top: -5px;
  right: -5px;
}

.user-section {
  display: flex;
  align-items: center;
  margin-left: 20px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  background: #f5f5f5;
  border-radius: 20px;
}

.username {
  font-size: 14px;
  color: #333;
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.main {
  max-width: 1400px;
  margin: 20px auto;
  padding: 0 20px;
}
</style>

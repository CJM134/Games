<template>
  <div class="study-room">
    <div class="room-container">
      <!-- 左侧视频区域 -->
      <div class="video-section">
        <div class="video-player">
          <div class="camera-view">
            <div class="camera-placeholder">
              <el-icon :size="80"><VideoCamera /></el-icon>
              <p>自习直播间</p>
              <p class="subtitle">专注学习，共同进步</p>
            </div>
            <!-- 模拟摄像头画面 -->
            <div class="study-animation">
              <div class="book-icon">📚</div>
              <div class="timer-display">{{ formatTime(studyTime) }}</div>
            </div>
          </div>
        </div>
        
        <!-- 房间信息 -->
        <div class="room-info">
          <div class="room-header">
            <h2>🎓 自习直播间</h2>
            <div class="room-stats">
              <span class="online-count">
                <el-icon><User /></el-icon>
                {{ onlineUsers }} 人在线
              </span>
              <span class="study-count">
                <el-icon><Clock /></el-icon>
                今日学习 {{ totalStudyMinutes }} 分钟
              </span>
            </div>
          </div>
          
          <!-- 控制按钮 -->
          <div class="control-buttons">
            <el-button 
              :type="isStudying ? 'danger' : 'primary'" 
              size="large"
              @click="toggleStudy">
              <el-icon><component :is="isStudying ? 'VideoPause' : 'VideoPlay'" /></el-icon>
              {{ isStudying ? '结束学习' : '开始学习' }}
            </el-button>
            <el-button size="large" @click="resetTimer">
              <el-icon><RefreshRight /></el-icon>
              重置计时
            </el-button>
          </div>
          
          <!-- 学习目标 -->
          <div class="study-goals">
            <h3>今日目标</h3>
            <el-progress 
              :percentage="studyProgress" 
              :color="progressColor"
              :stroke-width="20">
              <span class="progress-text">{{ studyTime }} / {{ goalTime }} 秒</span>
            </el-progress>
          </div>
        </div>
      </div>
      
      <!-- 右侧聊天区域 -->
      <div class="chat-section">
        <div class="chat-header">
          <h3>💬 学习交流</h3>
          <span class="chat-count">{{ messages.length }} 条消息</span>
        </div>
        
        <div class="chat-messages" ref="chatMessages">
          <div 
            v-for="msg in messages" 
            :key="msg.id"
            class="chat-message"
            :class="{ 'my-message': msg.isMine }">
            <div class="message-avatar">
              <el-avatar :src="msg.avatar" :size="32" />
            </div>
            <div class="message-content">
              <div class="message-header">
                <span class="message-user">{{ msg.username }}</span>
                <span class="message-time">{{ msg.time }}</span>
              </div>
              <div class="message-text">{{ msg.content }}</div>
            </div>
          </div>
        </div>
        
        <div class="chat-input">
          <el-input
            v-model="messageInput"
            placeholder="说点什么鼓励大家..."
            @keyup.enter="sendMessage">
            <template #append>
              <el-button @click="sendMessage">
                <el-icon><Promotion /></el-icon>
              </el-button>
            </template>
          </el-input>
        </div>
        
        <!-- 在线用户列表 -->
        <div class="online-users">
          <h4>📋 在线学习</h4>
          <div class="user-list">
            <div v-for="user in onlineUserList" :key="user.id" class="user-item">
              <el-avatar :src="user.avatar" :size="24" />
              <span class="user-name">{{ user.name }}</span>
              <span class="user-status">{{ user.status }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { VideoCamera, User, Clock, VideoPlay, VideoPause, RefreshRight, Promotion } from '@element-plus/icons-vue'
import { useUserStore } from '../stores/user'
import { ElMessage } from 'element-plus'

const userStore = useUserStore()

// 学习状态
const isStudying = ref(false)
const studyTime = ref(0)
const goalTime = ref(3600) // 1小时目标
const totalStudyMinutes = ref(0)
let studyTimer = null

// 在线用户
const onlineUsers = ref(Math.floor(Math.random() * 50) + 20)
const onlineUserList = ref([
  { id: 1, name: '努力学习的小明', avatar: 'http://localhost:8080/images/default.png', status: '学习中 25分钟' },
  { id: 2, name: '考研加油鸭', avatar: 'http://localhost:8080/images/default.png', status: '学习中 1小时' },
  { id: 3, name: '代码小能手', avatar: 'http://localhost:8080/images/default.png', status: '学习中 45分钟' },
  { id: 4, name: '英语四级冲刺', avatar: 'http://localhost:8080/images/default.png', status: '学习中 30分钟' },
  { id: 5, name: '数学大神', avatar: 'http://localhost:8080/images/default.png', status: '学习中 2小时' }
])

// 聊天消息
const messages = ref([
  { id: 1, username: '系统', avatar: 'http://localhost:8080/images/default.png', content: '欢迎来到自习直播间！', time: '10:00', isMine: false },
  { id: 2, username: '努力学习的小明', avatar: 'http://localhost:8080/images/default.png', content: '大家一起加油！', time: '10:05', isMine: false },
  { id: 3, username: '考研加油鸭', avatar: 'http://localhost:8080/images/default.png', content: '今天要学习5个小时！', time: '10:10', isMine: false }
])
const messageInput = ref('')
const chatMessages = ref(null)

// 计算属性
const studyProgress = computed(() => {
  return Math.min((studyTime.value / goalTime.value) * 100, 100)
})

const progressColor = computed(() => {
  if (studyProgress.value < 30) return '#f56c6c'
  if (studyProgress.value < 70) return '#e6a23c'
  return '#67c23a'
})

// 方法
const toggleStudy = () => {
  if (!userStore.userInfo) {
    ElMessage.warning('请先登录')
    return
  }
  
  isStudying.value = !isStudying.value
  
  if (isStudying.value) {
    startStudy()
    ElMessage.success('开始学习，加油！')
    addSystemMessage('开始了学习计时')
  } else {
    stopStudy()
    ElMessage.info('学习结束，休息一下吧')
    addSystemMessage('结束了学习，共学习 ' + formatTime(studyTime.value))
  }
}

const startStudy = () => {
  studyTimer = setInterval(() => {
    studyTime.value++
    totalStudyMinutes.value = Math.floor(studyTime.value / 60)
  }, 1000)
}

const stopStudy = () => {
  if (studyTimer) {
    clearInterval(studyTimer)
    studyTimer = null
  }
}

const resetTimer = () => {
  if (isStudying.value) {
    ElMessage.warning('请先结束学习再重置')
    return
  }
  studyTime.value = 0
  totalStudyMinutes.value = 0
  ElMessage.success('计时器已重置')
}

const formatTime = (seconds) => {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

const sendMessage = () => {
  if (!userStore.userInfo) {
    ElMessage.warning('请先登录')
    return
  }
  
  if (!messageInput.value.trim()) {
    return
  }
  
  const newMessage = {
    id: Date.now(),
    username: userStore.userInfo.nickname || userStore.userInfo.username,
    avatar: userStore.userInfo.avatar || 'http://localhost:8080/images/default.png',
    content: messageInput.value,
    time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    isMine: true
  }
  
  messages.value.push(newMessage)
  messageInput.value = ''
  
  // 滚动到底部
  nextTick(() => {
    if (chatMessages.value) {
      chatMessages.value.scrollTop = chatMessages.value.scrollHeight
    }
  })
}

const addSystemMessage = (content) => {
  const username = userStore.userInfo?.nickname || userStore.userInfo?.username || '用户'
  messages.value.push({
    id: Date.now(),
    username: username,
    avatar: userStore.userInfo?.avatar || 'http://localhost:8080/images/default.png',
    content: content,
    time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    isMine: false
  })
  
  nextTick(() => {
    if (chatMessages.value) {
      chatMessages.value.scrollTop = chatMessages.value.scrollHeight
    }
  })
}

// 模拟在线人数变化
const simulateOnlineUsers = () => {
  setInterval(() => {
    const change = Math.floor(Math.random() * 5) - 2
    onlineUsers.value = Math.max(10, onlineUsers.value + change)
  }, 10000)
}

onMounted(() => {
  simulateOnlineUsers()
})

onUnmounted(() => {
  stopStudy()
})
</script>

<style scoped>
.study-room {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
}

.room-container {
  display: flex;
  gap: 20px;
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0,0,0,0.1);
}

.video-section {
  flex: 1;
  padding: 20px;
}

.video-player {
  width: 100%;
  aspect-ratio: 16/9;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  overflow: hidden;
  position: relative;
  margin-bottom: 20px;
}

.camera-view {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  position: relative;
}

.camera-placeholder {
  text-align: center;
  opacity: 0.3;
}

.camera-placeholder p {
  margin: 10px 0 0 0;
  font-size: 24px;
  font-weight: bold;
}

.subtitle {
  font-size: 14px !important;
  opacity: 0.8;
}

.study-animation {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.book-icon {
  font-size: 80px;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-20px); }
}

.timer-display {
  font-size: 48px;
  font-weight: bold;
  margin-top: 20px;
  text-shadow: 0 2px 10px rgba(0,0,0,0.3);
}

.room-info {
  background: #f5f7fa;
  padding: 20px;
  border-radius: 8px;
}

.room-header {
  margin-bottom: 20px;
}

.room-header h2 {
  margin: 0 0 10px 0;
  font-size: 24px;
}

.room-stats {
  display: flex;
  gap: 20px;
  font-size: 14px;
  color: #666;
}

.room-stats span {
  display: flex;
  align-items: center;
  gap: 5px;
}

.online-count {
  color: #67c23a;
  font-weight: bold;
}

.study-count {
  color: #409eff;
  font-weight: bold;
}

.control-buttons {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.study-goals h3 {
  margin: 0 0 15px 0;
  font-size: 16px;
}

.progress-text {
  font-size: 12px;
  color: #666;
}

.chat-section {
  width: 360px;
  display: flex;
  flex-direction: column;
  border-left: 1px solid #e5e5e5;
}

.chat-header {
  padding: 20px;
  border-bottom: 1px solid #e5e5e5;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chat-header h3 {
  margin: 0;
  font-size: 16px;
}

.chat-count {
  font-size: 12px;
  color: #999;
}

.chat-messages {
  flex: 1;
  padding: 15px;
  overflow-y: auto;
  max-height: 400px;
}

.chat-message {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}

.message-content {
  flex: 1;
  min-width: 0;
}

.message-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
}

.message-user {
  font-size: 13px;
  font-weight: bold;
  color: #333;
}

.message-time {
  font-size: 11px;
  color: #999;
}

.message-text {
  background: #f5f7fa;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 14px;
  word-break: break-word;
}

.my-message .message-text {
  background: #e6f4ff;
}

.chat-input {
  padding: 15px;
  border-top: 1px solid #e5e5e5;
  border-bottom: 1px solid #e5e5e5;
}

.online-users {
  padding: 15px;
  max-height: 200px;
  overflow-y: auto;
}

.online-users h4 {
  margin: 0 0 10px 0;
  font-size: 14px;
}

.user-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.user-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px;
  border-radius: 6px;
  transition: background 0.2s;
}

.user-item:hover {
  background: #f5f7fa;
}

.user-name {
  flex: 1;
  font-size: 13px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-status {
  font-size: 11px;
  color: #67c23a;
}

@media (max-width: 1024px) {
  .room-container {
    flex-direction: column;
  }
  
  .chat-section {
    width: 100%;
    border-left: none;
    border-top: 1px solid #e5e5e5;
  }
}
</style>

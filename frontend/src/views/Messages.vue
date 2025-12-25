<template>
  <div class="messages-page">
    <div class="messages-container">
      <!-- 会话列表 -->
      <div class="conversation-list">
        <h2>消息</h2>
        <div class="conversation-items">
          <div 
            v-for="conv in conversations" 
            :key="conv.id"
            class="conversation-item"
            :class="{ active: selectedConv && selectedConv.otherUserId === conv.otherUserId }"
            @click="selectConversation(conv)">
            <el-avatar :src="getFullUrl(conv.otherUserAvatar)" :size="48" />
            <div class="conv-info">
              <div class="conv-header">
                <span class="conv-name">{{ conv.otherUserName }}</span>
                <span class="conv-time">{{ formatTime(conv.lastMessageTime) }}</span>
              </div>
              <div class="conv-last-message">
                {{ conv.lastMessage }}
              </div>
            </div>
            <el-badge v-if="conv.unreadCount > 0" :value="conv.unreadCount" class="unread-badge" />
          </div>
          <el-empty v-if="conversations.length === 0" description="暂无消息" />
        </div>
      </div>

      <!-- 聊天窗口 -->
      <div class="chat-window">
        <div v-if="selectedConv" class="chat-content">
          <div class="chat-header">
            <el-avatar :src="getFullUrl(selectedConv.otherUserAvatar)" :size="40" />
            <span class="chat-name">{{ selectedConv.otherUserName }}</span>
          </div>
          
          <div class="message-list" ref="messageList">
            <div 
              v-for="msg in messages" 
              :key="msg.id"
              class="message-item"
              :class="{ 'is-mine': msg.fromUserId === userStore.userInfo.id }">
              <el-avatar :src="getFullUrl(msg.fromUserAvatar)" :size="36" />
              <div class="message-content">
                <div class="message-text">{{ msg.content }}</div>
                <div class="message-time">{{ formatTime(msg.createTime) }}</div>
              </div>
            </div>
          </div>

          <div class="message-input">
            <el-input
              v-model="messageContent"
              type="textarea"
              :rows="3"
              placeholder="输入消息..."
              @keydown.enter.ctrl="handleSend" />
            <el-button type="primary" @click="handleSend">发送</el-button>
          </div>
        </div>
        <el-empty v-else description="选择一个会话开始聊天" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '../stores/user'
import { getConversations, getConversationMessages, sendMessage } from '../api/message'
import { getUserProfile } from '../api/userProfile'
import { ElMessage } from 'element-plus'
import SockJS from 'sockjs-client'
import { Client } from '@stomp/stompjs'

const route = useRoute()
const userStore = useUserStore()
const conversations = ref([])
const selectedConv = ref(null)
const messages = ref([])
const messageContent = ref('')
const messageList = ref(null)
let stompClient = null

const connectWebSocket = () => {
  const socket = new SockJS('http://localhost:8080/ws')
  stompClient = new Client({
    webSocketFactory: () => socket,
    reconnectDelay: 5000,
    heartbeatIncoming: 4000,
    heartbeatOutgoing: 4000,
  })

  stompClient.onConnect = () => {
    console.log('WebSocket连接成功')
    // 订阅个人消息队列
    stompClient.subscribe(`/user/${userStore.userInfo.id}/queue/messages`, (message) => {
      const newMessage = JSON.parse(message.body)
      console.log('收到新消息:', newMessage)
      
      // 如果是当前会话的消息，添加到消息列表
      if (selectedConv.value && 
          ((newMessage.fromUserId === selectedConv.value.otherUserId && newMessage.toUserId === userStore.userInfo.id) ||
           (newMessage.fromUserId === userStore.userInfo.id && newMessage.toUserId === selectedConv.value.otherUserId))) {
        messages.value.push(newMessage)
        nextTick(() => scrollToBottom())
      }
      
      // 刷新会话列表
      loadConversations()
    })
  }

  stompClient.onStompError = (frame) => {
    console.error('WebSocket错误:', frame)
  }

  stompClient.activate()
}

const loadConversations = async () => {
  if (!userStore.userInfo) return
  conversations.value = await getConversations(userStore.userInfo.id)
}

const selectConversation = async (conv) => {
  selectedConv.value = conv
  messages.value = await getConversationMessages(userStore.userInfo.id, conv.otherUserId)
  // 清空未读数
  conv.unreadCount = 0
  
  // 通知父组件更新未读消息总数
  window.dispatchEvent(new CustomEvent('update-unread-count'))
  
  // 滚动到底部
  await nextTick()
  scrollToBottom()
}

const handleSend = async () => {
  if (!messageContent.value.trim()) {
    ElMessage.warning('请输入消息内容')
    return
  }
  
  await sendMessage({
    fromUserId: userStore.userInfo.id,
    toUserId: selectedConv.value.otherUserId,
    content: messageContent.value
  })
  
  messageContent.value = ''
  // 重新加载消息
  messages.value = await getConversationMessages(userStore.userInfo.id, selectedConv.value.otherUserId)
  await nextTick()
  scrollToBottom()
  
  // 刷新会话列表
  loadConversations()
}

const scrollToBottom = () => {
  if (messageList.value) {
    messageList.value.scrollTop = messageList.value.scrollHeight
  }
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

onMounted(async () => {
  await loadConversations()
  connectWebSocket()
  
  // 如果URL中有userId参数，自动打开与该用户的会话
  if (route.query.userId) {
    const otherUserId = parseInt(route.query.userId)
    
    // 检查是否已有会话
    const existingConv = conversations.value.find(c => c.otherUserId === otherUserId)
    
    if (existingConv) {
      selectConversation(existingConv)
    } else {
      // 创建新会话
      try {
        const userProfile = await getUserProfile(otherUserId, userStore.userInfo.id)
        selectedConv.value = {
          otherUserId: otherUserId,
          otherUserName: userProfile.nickname || userProfile.username,
          otherUserAvatar: userProfile.avatar,
          lastMessage: '',
          lastMessageTime: new Date(),
          unreadCount: 0
        }
        messages.value = []
      } catch (error) {
        ElMessage.error('无法打开会话')
      }
    }
  }
})

onUnmounted(() => {
  if (stompClient) {
    stompClient.deactivate()
  }
})
</script>

<style scoped>
.messages-page {
  max-width: 1200px;
  margin: 0 auto;
}

.messages-container {
  display: flex;
  height: calc(100vh - 100px);
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
}

.conversation-list {
  width: 300px;
  border-right: 1px solid #e5e5e5;
  display: flex;
  flex-direction: column;
}

.conversation-list h2 {
  padding: 20px;
  margin: 0;
  border-bottom: 1px solid #e5e5e5;
}

.conversation-items {
  flex: 1;
  overflow-y: auto;
}

.conversation-item {
  display: flex;
  align-items: center;
  padding: 15px;
  cursor: pointer;
  position: relative;
  transition: background 0.2s;
}

.conversation-item:hover {
  background: #f5f7fa;
}

.conversation-item.active {
  background: #e6f4ff;
}

.conv-info {
  flex: 1;
  margin-left: 12px;
  overflow: hidden;
}

.conv-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
}

.conv-name {
  font-weight: bold;
  font-size: 14px;
}

.conv-time {
  font-size: 12px;
  color: #999;
}

.conv-last-message {
  font-size: 13px;
  color: #666;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.unread-badge {
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
}

.chat-window {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.chat-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.chat-header {
  display: flex;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #e5e5e5;
  gap: 12px;
}

.chat-name {
  font-size: 16px;
  font-weight: bold;
}

.message-list {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 15px;
  max-height: calc(100vh - 300px);
  min-height: 400px;
}

.message-item {
  display: flex;
  gap: 10px;
}

.message-item.is-mine {
  flex-direction: row-reverse;
}

.message-content {
  max-width: 60%;
}

.message-item.is-mine .message-content {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.message-text {
  background: #f5f7fa;
  padding: 10px 15px;
  border-radius: 8px;
  word-break: break-word;
}

.message-item.is-mine .message-text {
  background: #00a1d6;
  color: #fff;
}

.message-time {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

.message-input {
  padding: 15px 20px;
  border-top: 1px solid #e5e5e5;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
</style>

<template>
  <div class="user-profile" v-if="userProfile">
    <!-- 用户信息卡片 -->
    <div class="profile-header">
      <div class="profile-info">
        <el-avatar :src="getFullUrl(userProfile.avatar)" :size="120" />
        <div class="info-content">
          <h2>{{ userProfile.nickname || userProfile.username }}</h2>
          <p class="signature">{{ userProfile.signature || '这个人很懒，什么都没留下' }}</p>
          <div class="stats">
            <span @click="showFollowList">关注 {{ userProfile.followCount }}</span>
            <span @click="showFansList">粉丝 {{ userProfile.fansCount }}</span>
            <span>投稿 {{ userProfile.videoCount }}</span>
          </div>
        </div>
        <div class="actions">
          <el-button 
            v-if="!isCurrentUser" 
            :type="userProfile.isFollowed ? '' : 'primary'"
            @click="toggleFollow"
            :loading="followLoading">
            {{ userProfile.isFollowed ? '已关注' : '+ 关注' }}
          </el-button>
          <el-button 
            v-if="!isCurrentUser"
            @click="goToMessage">
            发消息
          </el-button>
          <el-button v-else @click="showEditDialog">编辑资料</el-button>
        </div>
      </div>
    </div>

    <!-- 标签页 -->
    <el-tabs v-model="activeTab" @tab-change="handleTabChange">
      <el-tab-pane label="投稿视频" name="videos">
        <div class="video-grid">
          <div v-for="video in videos" :key="video.id" class="video-card">
            <div class="video-cover" @click="goToDetail(video.id)">
              <img :src="getFullUrl(video.coverUrl)" :alt="video.title">
              <div class="video-duration">{{ formatDuration(video.duration) }}</div>
            </div>
            <div class="video-info">
              <h3 class="video-title" @click="goToDetail(video.id)">{{ video.title }}</h3>
              <div class="video-stats">
                <span>{{ formatCount(video.playCount) }} 播放</span>
              </div>
              <div v-if="isCurrentUser" class="video-actions">
                <el-button size="small" @click="handleEditVideo(video)">编辑</el-button>
                <el-button size="small" type="danger" @click="handleDeleteVideo(video.id)">删除</el-button>
              </div>
            </div>
          </div>
        </div>
        <el-empty v-if="videos.length === 0" description="还没有投稿视频" />
      </el-tab-pane>

      <el-tab-pane label="收藏视频" name="collects" v-if="isCurrentUser">
        <div class="video-grid">
          <div v-for="video in collects" :key="video.id" class="video-card" @click="goToDetail(video.id)">
            <div class="video-cover">
              <img :src="getFullUrl(video.coverUrl)" :alt="video.title">
              <div class="video-duration">{{ formatDuration(video.duration) }}</div>
            </div>
            <div class="video-info">
              <h3 class="video-title">{{ video.title }}</h3>
              <div class="video-stats">
                <span>{{ formatCount(video.playCount) }} 播放</span>
              </div>
            </div>
          </div>
        </div>
        <el-empty v-if="collects.length === 0" description="还没有收藏视频" />
      </el-tab-pane>
    </el-tabs>

    <!-- 编辑资料对话框 -->
    <el-dialog v-model="editDialogVisible" title="编辑资料" width="500px">
      <el-form :model="editForm" label-width="80px">
        <el-form-item label="头像">
          <el-upload
            class="avatar-uploader"
            :action="uploadAvatarUrl"
            :show-file-list="false"
            :on-success="handleAvatarSuccess"
            :before-upload="beforeAvatarUpload">
            <img v-if="editForm.avatar" :src="getFullUrl(editForm.avatar)" class="avatar">
            <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
          </el-upload>
        </el-form-item>
        <el-form-item label="昵称">
          <el-input v-model="editForm.nickname" />
        </el-form-item>
        <el-form-item label="签名">
          <el-input v-model="editForm.signature" type="textarea" :rows="3" />
        </el-form-item>
        <el-form-item label="性别">
          <el-radio-group v-model="editForm.gender">
            <el-radio :label="0">保密</el-radio>
            <el-radio :label="1">男</el-radio>
            <el-radio :label="2">女</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveProfile">保存</el-button>
      </template>
    </el-dialog>

    <!-- 关注列表对话框 -->
    <el-dialog v-model="followListVisible" title="关注列表" width="600px">
      <div class="user-list">
        <div v-for="user in followList" :key="user.id" class="user-item" @click="goToUserProfile(user.id)">
          <el-avatar :src="getFullUrl(user.avatar)" />
          <div class="user-info">
            <div class="user-name">{{ user.nickname || user.username }}</div>
            <div class="user-stats">粉丝 {{ user.fansCount }}</div>
          </div>
        </div>
      </div>
      <el-empty v-if="followList.length === 0" description="还没有关注任何人" />
    </el-dialog>

    <!-- 粉丝列表对话框 -->
    <el-dialog v-model="fansListVisible" title="粉丝列表" width="600px">
      <div class="user-list">
        <div v-for="user in fansList" :key="user.id" class="user-item" @click="goToUserProfile(user.id)">
          <el-avatar :src="getFullUrl(user.avatar)" />
          <div class="user-info">
            <div class="user-name">{{ user.nickname || user.username }}</div>
            <div class="user-stats">粉丝 {{ user.fansCount }}</div>
          </div>
        </div>
      </div>
      <el-empty v-if="fansList.length === 0" description="还没有粉丝" />
    </el-dialog>

    <!-- 编辑视频对话框 -->
    <el-dialog v-model="editVideoDialogVisible" title="编辑视频" width="600px">
      <el-form :model="editVideoForm" label-width="80px">
        <el-form-item label="标题">
          <el-input v-model="editVideoForm.title" placeholder="请输入视频标题" />
        </el-form-item>
        <el-form-item label="简介">
          <el-input v-model="editVideoForm.description" type="textarea" :rows="4" placeholder="请输入视频简介" />
        </el-form-item>
        <el-form-item label="分类">
          <el-select v-model="editVideoForm.categoryId" placeholder="请选择分类">
            <el-option
              v-for="category in categories"
              :key="category.id"
              :label="category.name"
              :value="category.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="封面">
          <div class="upload-section">
            <img v-if="editVideoForm.coverUrl" :src="getFullUrl(editVideoForm.coverUrl)" class="cover-preview">
            <el-upload
              class="cover-uploader"
              :show-file-list="false"
              :before-upload="beforeCoverUpload"
              :http-request="handleCoverUpload"
              :disabled="uploadingCover">
              <el-button :loading="uploadingCover" size="small">
                {{ uploadingCover ? '上传中...' : '重新上传封面' }}
              </el-button>
            </el-upload>
          </div>
        </el-form-item>
        <el-form-item label="视频">
          <div class="upload-section">
            <div v-if="editVideoForm.videoUrl" class="video-info">
              <span>当前视频时长: {{ formatDuration(editVideoForm.duration) }}</span>
            </div>
            <el-upload
              class="video-uploader"
              :show-file-list="false"
              :before-upload="beforeVideoUpload"
              :http-request="handleVideoUpload"
              :disabled="uploadingVideo">
              <el-button :loading="uploadingVideo" size="small" type="primary">
                {{ uploadingVideo ? '上传中...' : '重新上传视频' }}
              </el-button>
            </el-upload>
            <div class="upload-tip">
              <el-text type="info" size="small">上传新视频会自动生成新封面（如果不手动上传封面）</el-text>
            </div>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editVideoDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveVideoEdit">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '../stores/user'
import { 
  getUserProfile, 
  getUserVideos, 
  getUserCollects,
  updateProfile,
  uploadAvatar,
  followUser,
  unfollowUser,
  getFollowList,
  getFansList
} from '../api/userProfile'
import { updateVideo, deleteVideo } from '../api/video'
import { getCategories } from '../api/category'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const userProfile = ref(null)
const videos = ref([])
const collects = ref([])
const activeTab = ref('videos')
const followLoading = ref(false)
const editDialogVisible = ref(false)
const editVideoDialogVisible = ref(false)
const currentEditVideo = ref(null)
const followListVisible = ref(false)
const fansListVisible = ref(false)
const followList = ref([])
const fansList = ref([])
const categories = ref([])

const editForm = ref({
  nickname: '',
  signature: '',
  gender: 0,
  avatar: ''
})

const editVideoForm = ref({
  id: null,
  title: '',
  description: '',
  categoryId: null,
  videoUrl: '',
  coverUrl: '',
  duration: 0
})

const uploadingVideo = ref(false)
const uploadingCover = ref(false)

const uploadAvatarUrl = computed(() => {
  return `http://localhost:8080/api/user/profile/${route.params.userId}/avatar`
})

const isCurrentUser = computed(() => {
  return userStore.userInfo && userStore.userInfo.id === parseInt(route.params.userId)
})

const loadUserProfile = async () => {
  const currentUserId = userStore.userInfo?.id
  userProfile.value = await getUserProfile(route.params.userId, currentUserId)
}

const loadVideos = async () => {
  videos.value = await getUserVideos(route.params.userId)
}

const loadCollects = async () => {
  if (isCurrentUser.value) {
    collects.value = await getUserCollects(route.params.userId)
  }
}

const handleTabChange = (tab) => {
  if (tab === 'collects' && collects.value.length === 0) {
    loadCollects()
  }
}

const toggleFollow = async () => {
  if (!userStore.userInfo) {
    ElMessage.warning('请先登录')
    return
  }
  
  followLoading.value = true
  try {
    if (userProfile.value.isFollowed) {
      await unfollowUser(userStore.userInfo.id, route.params.userId)
      userProfile.value.isFollowed = false
      userProfile.value.fansCount--
      ElMessage.success('取消关注成功')
    } else {
      await followUser(userStore.userInfo.id, route.params.userId)
      userProfile.value.isFollowed = true
      userProfile.value.fansCount++
      ElMessage.success('关注成功')
    }
  } catch (error) {
    ElMessage.error(error.message || '操作失败')
  } finally {
    followLoading.value = false
  }
}

const showEditDialog = () => {
  editForm.value = {
    nickname: userProfile.value.nickname,
    signature: userProfile.value.signature,
    gender: userProfile.value.gender || 0,
    avatar: userProfile.value.avatar
  }
  editDialogVisible.value = true
}

const saveProfile = async () => {
  try {
    await updateProfile(route.params.userId, editForm.value)
    ElMessage.success('保存成功')
    editDialogVisible.value = false
    loadUserProfile()
  } catch (error) {
    ElMessage.error('保存失败')
  }
}

const beforeAvatarUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isImage) {
    ElMessage.error('只能上传图片文件!')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB!')
    return false
  }
  return true
}

const handleAvatarSuccess = (response) => {
  if (response.code === 200) {
    editForm.value.avatar = response.data.avatarUrl
    ElMessage.success('头像上传成功')
  }
}

const showFollowList = async () => {
  followList.value = await getFollowList(route.params.userId)
  followListVisible.value = true
}

const showFansList = async () => {
  fansList.value = await getFansList(route.params.userId)
  fansListVisible.value = true
}

const goToDetail = (videoId) => {
  router.push(`/video/${videoId}`)
}

const goToMessage = () => {
  // 跳转到消息页面，并传递对方用户ID
  router.push({
    path: '/messages',
    query: { userId: route.params.userId }
  })
}

const goToUserProfile = (userId) => {
  followListVisible.value = false
  fansListVisible.value = false
  router.push(`/user/${userId}`)
  loadUserProfile()
  loadVideos()
}

const handleEditVideo = (video) => {
  editVideoForm.value = {
    id: video.id,
    title: video.title,
    description: video.description,
    categoryId: video.categoryId,
    videoUrl: video.videoUrl,
    coverUrl: video.coverUrl,
    duration: video.duration
  }
  editVideoDialogVisible.value = true
}

const handleVideoUpload = async (options) => {
  uploadingVideo.value = true
  const formData = new FormData()
  formData.append('file', options.file)
  
  try {
    const response = await fetch('http://localhost:8080/api/file/upload/video', {
      method: 'POST',
      body: formData
    })
    const result = await response.json()
    
    if (result.code === 200) {
      editVideoForm.value.videoUrl = result.data.videoUrl
      editVideoForm.value.duration = parseInt(result.data.duration)
      // 如果自动生成了封面，也更新封面
      if (result.data.coverUrl) {
        editVideoForm.value.coverUrl = result.data.coverUrl
      }
      ElMessage.success('视频上传成功')
    } else {
      ElMessage.error(result.message || '视频上传失败')
    }
  } catch (error) {
    ElMessage.error('视频上传失败')
  } finally {
    uploadingVideo.value = false
  }
}

const handleCoverUpload = async (options) => {
  uploadingCover.value = true
  const formData = new FormData()
  formData.append('file', options.file)
  
  try {
    const response = await fetch('http://localhost:8080/api/file/upload/cover', {
      method: 'POST',
      body: formData
    })
    const result = await response.json()
    
    if (result.code === 200) {
      editVideoForm.value.coverUrl = result.data.url
      ElMessage.success('封面上传成功')
    } else {
      ElMessage.error(result.message || '封面上传失败')
    }
  } catch (error) {
    ElMessage.error('封面上传失败')
  } finally {
    uploadingCover.value = false
  }
}

const beforeVideoUpload = (file) => {
  const isVideo = file.type.startsWith('video/')
  const isLt500M = file.size / 1024 / 1024 < 500

  if (!isVideo) {
    ElMessage.error('只能上传视频文件!')
    return false
  }
  if (!isLt500M) {
    ElMessage.error('视频大小不能超过 500MB!')
    return false
  }
  return true
}

const beforeCoverUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt5M = file.size / 1024 / 1024 < 5

  if (!isImage) {
    ElMessage.error('只能上传图片文件!')
    return false
  }
  if (!isLt5M) {
    ElMessage.error('图片大小不能超过 5MB!')
    return false
  }
  return true
}

const handleDeleteVideo = async (videoId) => {
  try {
    await ElMessageBox.confirm('确定要删除这个视频吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await deleteVideo(videoId)
    ElMessage.success('删除成功')
    loadVideos()
    loadUserProfile()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

const saveVideoEdit = async () => {
  try {
    await updateVideo(editVideoForm.value.id, {
      title: editVideoForm.value.title,
      description: editVideoForm.value.description,
      categoryId: editVideoForm.value.categoryId,
      videoUrl: editVideoForm.value.videoUrl,
      coverUrl: editVideoForm.value.coverUrl,
      duration: editVideoForm.value.duration
    })
    ElMessage.success('更新成功')
    editVideoDialogVisible.value = false
    loadVideos()
  } catch (error) {
    ElMessage.error('更新失败')
  }
}

const loadCategories = async () => {
  try {
    categories.value = await getCategories()
  } catch (error) {
    console.error('加载分类失败:', error)
  }
}

const getFullUrl = (url) => {
  if (!url) return 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'
  if (url.startsWith('http')) return url
  return 'http://localhost:8080' + url
}

const formatDuration = (seconds) => {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

const formatCount = (count) => {
  if (count >= 10000) return (count / 10000).toFixed(1) + '万'
  return count
}

onMounted(() => {
  loadUserProfile()
  loadVideos()
  loadCategories()
})
</script>

<style scoped>
.user-profile {
  max-width: 1200px;
  margin: 0 auto;
}

.profile-header {
  background: #fff;
  padding: 30px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.profile-info {
  display: flex;
  align-items: center;
  gap: 30px;
}

.info-content {
  flex: 1;
}

.info-content h2 {
  margin-bottom: 10px;
}

.signature {
  color: #666;
  margin-bottom: 15px;
}

.stats {
  display: flex;
  gap: 30px;
}

.stats span {
  cursor: pointer;
  color: #666;
}

.stats span:hover {
  color: #00a1d6;
}

.video-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  padding: 20px 0;
}

.video-card {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s;
}

.video-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.video-cover {
  position: relative;
  padding-top: 56.25%;
  background: #f0f0f0;
}

.video-cover img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.video-duration {
  position: absolute;
  bottom: 8px;
  right: 8px;
  background: rgba(0,0,0,0.7);
  color: #fff;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
}

.video-info {
  padding: 12px;
}

.video-title {
  font-size: 14px;
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  cursor: pointer;
}

.video-title:hover {
  color: #00a1d6;
}

.video-stats {
  font-size: 12px;
  color: #999;
  margin-bottom: 8px;
}

.video-actions {
  display: flex;
  gap: 8px;
}

.avatar-uploader {
  width: 120px;
  height: 120px;
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  overflow: hidden;
}

.avatar-uploader:hover {
  border-color: #409eff;
}

.avatar {
  width: 120px;
  height: 120px;
  display: block;
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 120px;
  height: 120px;
  text-align: center;
  line-height: 120px;
}

.user-list {
  max-height: 400px;
  overflow-y: auto;
}

.user-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  cursor: pointer;
  border-radius: 8px;
}

.user-item:hover {
  background: #f5f7fa;
}

.user-info {
  flex: 1;
}

.user-name {
  font-weight: bold;
  margin-bottom: 5px;
}

.user-stats {
  font-size: 12px;
  color: #999;
}

.upload-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.cover-preview {
  width: 200px;
  height: 112px;
  object-fit: cover;
  border-radius: 4px;
  margin-bottom: 10px;
}

.video-info {
  padding: 8px 12px;
  background: #f5f7fa;
  border-radius: 4px;
  font-size: 14px;
  color: #666;
}

.upload-tip {
  margin-top: 5px;
}
</style>

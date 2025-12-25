<template>
  <div class="home">
    <div class="home-container">
      <!-- 左侧轮播图 -->
      <div class="carousel-section">
        <el-carousel height="240px" :interval="4000" arrow="hover">
          <el-carousel-item v-for="video in recommendVideos.slice(0, 5)" :key="video.id">
            <div class="carousel-item" @click="goToDetail(video.id)">
              <img :src="getFullUrl(video.coverUrl)" :alt="video.title">
              <div class="carousel-overlay">
                <div class="carousel-info">
                  <h3 class="carousel-title">{{ video.title }}</h3>
                  <div class="carousel-stats">
                    <span><el-icon><VideoPlay /></el-icon> {{ formatCount(video.playCount) }}</span>
                    <span><el-icon><Star /></el-icon> {{ formatCount(video.likeCount) }}</span>
                  </div>
                </div>
              </div>
              <div class="hot-badge">🔥 热门推荐</div>
            </div>
          </el-carousel-item>
        </el-carousel>
        
        <!-- 自习直播间入口 -->
        <div class="study-room-entry" @click="goToStudyRoom">
          <div class="study-room-bg">
            <div class="study-room-content">
              <div class="study-icon">📚</div>
              <div class="study-info">
                <h3>自习直播间</h3>
                <p>{{ onlineCount }} 人正在学习</p>
              </div>
              <div class="study-badge">
                <span class="live-dot"></span>
                LIVE
              </div>
            </div>
          </div>
        </div>
        
        <!-- 社区动态入口 -->
        <div class="moment-entry" @click="goToMoments">
          <div class="moment-bg">
            <div class="moment-content">
              <div class="moment-icon">💬</div>
              <div class="moment-info">
                <h3>社区动态</h3>
                <p>分享你的日常</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧内容区 -->
      <div class="content-section">
        <div class="categories">
          <el-button 
            :type="selectedCategory === null ? 'primary' : ''"
            @click="selectCategory(null)">
            <span class="category-icon">📺</span>
            <span>全部</span>
          </el-button>
          <el-button 
            v-for="cat in categories.slice(1)" 
            :key="cat.id"
            :type="selectedCategory === cat.id ? 'primary' : ''"
            @click="selectCategory(cat.id)">
            <span class="category-icon">{{ cat.icon }}</span>
            <span>{{ cat.name }}</span>
          </el-button>
        </div>

        <div class="video-grid">
          <div v-for="video in videos" :key="video.id" class="video-card" @click="goToDetail(video.id)">
            <div class="video-cover">
              <img :src="getFullUrl(video.coverUrl)" :alt="video.title">
              <div class="video-duration">{{ formatDuration(video.duration) }}</div>
            </div>
            <div class="video-info">
              <div class="user-info">
                <img :src="getFullUrl(video.userAvatar)" class="user-avatar" :alt="video.userName">
                <span class="user-name">{{ video.userName }}</span>
              </div>
              <h3 class="video-title">{{ video.title }}</h3>
              <div class="video-stats">
                <span><el-icon><VideoPlay /></el-icon> {{ formatCount(video.playCount) }}</span>
                <span><el-icon><ChatDotRound /></el-icon> {{ formatCount(video.commentCount) }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="pagination">
          <el-pagination
            v-model:current-page="currentPage"
            :page-size="pageSize"
            :total="total"
            layout="total, prev, pager, next, jumper"
            @current-change="loadVideos" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { VideoPlay, ChatDotRound, Star } from '@element-plus/icons-vue'
import { getVideoList, searchVideos, getRecommendVideos } from '../api/video'
import { getCategoryList } from '../api/category'
import { useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

// 图标映射表（备用方案）
const iconMap = {
  '动画': '🎬',
  '游戏': '🎮',
  '音乐': '🎵',
  '科技': '💻',
  '生活': '🏠',
  '美食': '🍔'
}

const categories = ref([{ id: null, name: '全部', icon: '📺' }])
const selectedCategory = ref(null)
const videos = ref([])
const recommendVideos = ref([])
const currentPage = ref(1)
const pageSize = ref(6)
const total = ref(0)
const onlineCount = ref(Math.floor(Math.random() * 50) + 20)

const loadCategories = async () => {
  try {
    const data = await getCategoryList()
    console.log('分类数据:', data) // 调试信息
    // 确保图标正确显示，如果后端没有图标，使用映射表
    const categoriesWithIcons = data.map(cat => {
      const icon = cat.icon || iconMap[cat.name] || '📁'
      console.log('分类图标:', cat.name, icon) // 调试每个分类的图标
      return {
        ...cat,
        icon: icon
      }
    })
    categories.value = [{ id: null, name: '全部', icon: '📺' }, ...categoriesWithIcons]
  } catch (error) {
    console.error('加载分类失败:', error)
    // 如果API失败，使用默认分类
    categories.value = [
      { id: null, name: '全部', icon: '📺' },
      { id: 1, name: '动画', icon: '🎬' },
      { id: 2, name: '游戏', icon: '🎮' },
      { id: 3, name: '音乐', icon: '🎵' },
      { id: 4, name: '科技', icon: '💻' },
      { id: 5, name: '生活', icon: '🏠' },
      { id: 6, name: '美食', icon: '🍔' }
    ]
  }
}

const loadVideos = async () => {
  const keyword = route.query.keyword
  let result
  if (keyword) {
    result = await searchVideos({ keyword, page: currentPage.value, size: pageSize.value })
  } else {
    result = await getVideoList({ page: currentPage.value, size: pageSize.value, categoryId: selectedCategory.value })
  }
  console.log('视频数据:', result.records) // 调试：查看返回的数据
  console.log('总数:', result.total, '当前页:', currentPage.value, '每页:', pageSize.value) // 调试分页信息
  videos.value = result.records
  total.value = result.total
}

const loadRecommendVideos = async () => {
  try {
    const result = await getRecommendVideos({ page: 1, size: 10 })
    recommendVideos.value = result.records
  } catch (error) {
    console.error('加载推荐视频失败:', error)
  }
}

const selectCategory = (id) => {
  selectedCategory.value = id
  currentPage.value = 1
  loadVideos()
}

const goToDetail = (id) => {
  router.push(`/video/${id}`)
}

const goToStudyRoom = () => {
  router.push('/study-room')
}

const goToMoments = () => {
  router.push('/moments')
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

const getFullUrl = (url) => {
  if (!url) return 'http://localhost:8080/images/default.png'
  if (url.startsWith('http')) return url
  return 'http://localhost:8080' + url
}

watch(() => route.query.keyword, () => {
  currentPage.value = 1
  loadVideos()
})

// 监听路由变化，从详情页返回时刷新数据
watch(() => route.path, (newPath, oldPath) => {
  if (newPath === '/' && oldPath && oldPath.startsWith('/video/')) {
    loadVideos()
  }
})

onMounted(() => {
  loadCategories()
  loadVideos()
  loadRecommendVideos()
  
  // 模拟在线人数变化
  setInterval(() => {
    onlineCount.value = Math.floor(Math.random() * 50) + 20
  }, 5000)
})
</script>

<style scoped>
.home {
  width: 100%;
}

.home-container {
  display: flex;
  gap: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.carousel-section {
  flex-shrink: 0;
  width: 420px;
}

.study-room-entry {
  margin-top: 15px;
  cursor: pointer;
  border-radius: 8px;
  overflow: hidden;
  transition: transform 0.2s;
}

.study-room-entry:hover,
.moment-entry:hover {
  transform: translateY(-2px);
}

.moment-entry {
  margin-top: 15px;
  cursor: pointer;
  border-radius: 8px;
  overflow: hidden;
  transition: transform 0.2s;
}

.moment-bg {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  padding: 20px;
}

.moment-content {
  display: flex;
  align-items: center;
  gap: 15px;
  color: white;
}

.moment-icon {
  font-size: 40px;
  animation: bounce 2s ease-in-out infinite;
}

.moment-info {
  flex: 1;
}

.moment-info h3 {
  margin: 0 0 5px 0;
  font-size: 18px;
  font-weight: bold;
}

.moment-info p {
  margin: 0;
  font-size: 13px;
  opacity: 0.9;
}

.study-room-bg {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  position: relative;
}

.study-room-content {
  display: flex;
  align-items: center;
  gap: 15px;
  color: white;
}

.study-icon {
  font-size: 40px;
  animation: bounce 2s ease-in-out infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}

.study-info {
  flex: 1;
}

.study-info h3 {
  margin: 0 0 5px 0;
  font-size: 18px;
  font-weight: bold;
}

.study-info p {
  margin: 0;
  font-size: 13px;
  opacity: 0.9;
}

.study-badge {
  display: flex;
  align-items: center;
  gap: 5px;
  background: rgba(255, 255, 255, 0.2);
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: bold;
}

.live-dot {
  width: 8px;
  height: 8px;
  background: #ff4d4f;
  border-radius: 50%;
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(1.2); }
}

.carousel-item {
  width: 100%;
  height: 240px;
  position: relative;
  cursor: pointer;
  overflow: hidden;
  border-radius: 8px;
}

.carousel-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.carousel-item:hover img {
  transform: scale(1.05);
}

.carousel-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%);
  padding: 20px;
  color: white;
}

.carousel-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.carousel-title {
  font-size: 16px;
  font-weight: bold;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  text-shadow: 0 2px 4px rgba(0,0,0,0.5);
}

.carousel-stats {
  display: flex;
  gap: 15px;
  font-size: 13px;
  opacity: 0.9;
}

.carousel-stats span {
  display: flex;
  align-items: center;
  gap: 4px;
}

.hot-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  background: linear-gradient(135deg, #ff6b6b 0%, #ff8e53 100%);
  color: white;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: bold;
  box-shadow: 0 2px 8px rgba(255, 107, 107, 0.4);
}

.content-section {
  flex: 1;
  min-width: 0;
}

.categories {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.recommend-btn {
  background: linear-gradient(135deg, #ff6b6b 0%, #ff8e53 100%) !important;
  border: none !important;
  color: white !important;
}

.recommend-btn:hover {
  background: linear-gradient(135deg, #ff5252 0%, #ff7043 100%) !important;
}

.recommend-btn.active {
  box-shadow: 0 4px 12px rgba(255, 107, 107, 0.5) !important;
  transform: translateY(-2px);
}

.category-icon {
  font-size: 18px;
  margin-right: 5px;
  display: inline-block;
  font-family: "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
}

.video-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 30px;
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

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.user-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  object-fit: cover;
}

.user-name {
  font-size: 12px;
  color: #666;
}

.video-title {
  font-size: 14px;
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.video-stats {
  display: flex;
  gap: 15px;
  font-size: 12px;
  color: #999;
}

.video-stats span {
  display: flex;
  align-items: center;
  gap: 4px;
}

.pagination {
  display: flex;
  justify-content: center;
  padding: 30px 0;
  background: #fff;
  border-radius: 8px;
  margin-top: 20px;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .home-container {
    flex-direction: column;
  }
  
  .carousel-section {
    width: 100%;
  }
  
  .video-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .video-grid {
    grid-template-columns: 1fr;
  }
}
</style>

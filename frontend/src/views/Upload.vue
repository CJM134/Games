<template>
  <div class="upload-page">
    <el-card>
      <h2>视频投稿</h2>
      <el-form :model="form" label-width="100px">
        <el-form-item label="视频文件">
          <el-upload
            class="upload-demo"
            :action="uploadVideoUrl"
            :on-success="handleVideoSuccess"
            :on-progress="handleVideoProgress"
            :before-upload="beforeVideoUpload"
            :show-file-list="false"
            accept="video/*">
            <el-button type="primary" :loading="videoUploading">
              {{ videoUploading ? '上传中...' : '选择视频文件' }}
            </el-button>
            <template #tip>
              <div class="el-upload__tip">支持mp4、avi、mov等格式，大小不超过100MB</div>
            </template>
          </el-upload>
          <div v-if="form.videoUrl" class="upload-success">
            ✓ 视频上传成功
          </div>
        </el-form-item>

        <el-form-item label="封面图片">
          <div class="upload-section">
            <div v-if="form.coverUrl" class="cover-preview">
              <img :src="getFullUrl(form.coverUrl)" alt="封面预览">
              <p class="preview-label">当前封面（自动生成）</p>
            </div>
            <el-upload
              class="upload-demo"
              :action="uploadCoverUrl"
              :on-success="handleCoverSuccess"
              :before-upload="beforeCoverUpload"
              :show-file-list="false"
              accept="image/*">
              <el-button type="default" :loading="coverUploading" size="small">
                {{ coverUploading ? '上传中...' : form.coverUrl ? '更换封面' : '手动上传封面' }}
              </el-button>
              <template #tip>
                <div class="el-upload__tip">
                  {{ form.coverUrl ? '如不满意自动生成的封面，可手动上传' : '上传视频后会自动生成封面，也可手动上传' }}
                </div>
              </template>
            </el-upload>
          </div>
        </el-form-item>

        <el-form-item label="标题" required>
          <el-input v-model="form.title" placeholder="请输入视频标题" />
        </el-form-item>

        <el-form-item label="分类" required>
          <el-select v-model="form.categoryId" placeholder="请选择分类" style="width: 100%">
            <el-option v-for="cat in categories" :key="cat.id" :label="cat.name" :value="cat.id" />
          </el-select>
        </el-form-item>

        <el-form-item label="简介">
          <el-input v-model="form.description" type="textarea" :rows="4" placeholder="介绍一下你的视频吧" />
        </el-form-item>

        <el-form-item label="时长(秒)">
          <el-input-number v-model="form.duration" :min="0" placeholder="视频时长" />
          <span style="margin-left: 10px; color: #999;">提示: 上传视频后会自动获取</span>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleUpload" :disabled="!canSubmit">提交</el-button>
          <el-button @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { uploadVideo } from '../api/video'
import { getCategoryList } from '../api/category'
import { useUserStore } from '../stores/user'

const router = useRouter()
const userStore = useUserStore()
const categories = ref([])
const videoUploading = ref(false)
const coverUploading = ref(false)

const uploadVideoUrl = ref('http://localhost:8080/api/file/upload/video')
const uploadCoverUrl = ref('http://localhost:8080/api/file/upload/cover')

const form = ref({
  title: '',
  categoryId: null,
  description: '',
  coverUrl: '',
  videoUrl: '',
  duration: 0
})

const canSubmit = computed(() => {
  return form.value.title && form.value.categoryId && form.value.videoUrl
})

const getFullUrl = (url) => {
  if (url.startsWith('http')) return url
  return 'http://localhost:8080' + url
}

const loadCategories = async () => {
  try {
    categories.value = await getCategoryList()
  } catch (error) {
    ElMessage.error('加载分类失败')
  }
}

const beforeVideoUpload = (file) => {
  const isVideo = file.type.startsWith('video/')
  const isLt100M = file.size / 1024 / 1024 < 100

  if (!isVideo) {
    ElMessage.error('只能上传视频文件!')
    return false
  }
  if (!isLt100M) {
    ElMessage.error('视频大小不能超过 100MB!')
    return false
  }
  videoUploading.value = true
  return true
}

const handleVideoProgress = (event, file, fileList) => {
  console.log('上传进度:', event.percent)
}

const handleVideoSuccess = (response, file) => {
  videoUploading.value = false
  if (response.code === 200) {
    form.value.videoUrl = response.data.videoUrl
    
    // 自动设置时长
    if (response.data.duration) {
      form.value.duration = parseInt(response.data.duration)
    }
    
    // 自动设置封面（如果后端生成了）
    if (response.data.coverUrl) {
      form.value.coverUrl = response.data.coverUrl
      ElMessage.success('视频上传成功，已自动生成封面')
    } else {
      ElMessage.success('视频上传成功')
    }
  } else {
    ElMessage.error(response.message || '视频上传失败')
  }
}

const beforeCoverUpload = (file) => {
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
  coverUploading.value = true
  return true
}

const handleCoverSuccess = (response, file) => {
  coverUploading.value = false
  if (response.code === 200) {
    form.value.coverUrl = response.data.url
    ElMessage.success('封面上传成功')
  } else {
    ElMessage.error(response.message || '封面上传失败')
  }
}

const handleUpload = async () => {
  if (!userStore.userInfo) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }
  
  if (!form.value.title) {
    ElMessage.warning('请输入视频标题')
    return
  }
  
  if (!form.value.categoryId) {
    ElMessage.warning('请选择分类')
    return
  }
  
  if (!form.value.videoUrl) {
    ElMessage.warning('请上传视频文件')
    return
  }
  
  try {
    form.value.userId = userStore.userInfo.id
    await uploadVideo(form.value)
    ElMessage.success('投稿成功')
    router.push('/')
  } catch (error) {
    ElMessage.error('投稿失败: ' + error.message)
  }
}

const resetForm = () => {
  form.value = {
    title: '',
    categoryId: null,
    description: '',
    coverUrl: '',
    videoUrl: '',
    duration: 0
  }
}

onMounted(() => {
  loadCategories()
})
</script>

<style scoped>
.upload-page {
  max-width: 800px;
  margin: 0 auto;
}

h2 {
  margin-bottom: 20px;
}

.upload-section {
  width: 100%;
}

.upload-success {
  margin-top: 10px;
  color: #67c23a;
  font-weight: bold;
}

.cover-preview {
  margin-top: 15px;
  padding: 10px;
  background: #f5f7fa;
  border-radius: 8px;
  max-width: 100%;
}

.cover-preview img {
  width: 100%;
  max-width: 500px;
  height: auto;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  display: block;
}

.preview-label {
  margin-top: 8px;
  font-size: 12px;
  color: #909399;
  text-align: center;
}

.el-upload__tip {
  font-size: 12px;
  color: #999;
  margin-top: 5px;
  line-height: 1.5;
}

:deep(.el-form-item__label) {
  font-weight: 500;
  line-height: 32px;
}

:deep(.el-form-item__content) {
  line-height: normal;
}
</style>

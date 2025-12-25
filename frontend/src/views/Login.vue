<template>
  <div class="login-page">
    <div class="login-box">
      <h2>{{ isLogin ? '登录' : '注册' }}</h2>
      <el-form :model="form" label-width="80px">
        <el-form-item label="用户名">
          <el-input v-model="form.username" />
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="form.password" type="password" />
        </el-form-item>
        <el-form-item v-if="!isLogin" label="昵称">
          <el-input v-model="form.nickname" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSubmit" style="width: 100%">
            {{ isLogin ? '登录' : '注册' }}
          </el-button>
        </el-form-item>
      </el-form>
      <div class="switch-mode">
        <el-button text @click="isLogin = !isLogin">
          {{ isLogin ? '没有账号？去注册' : '已有账号？去登录' }}
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { login, register } from '../api/user'
import { useUserStore } from '../stores/user'

const router = useRouter()
const userStore = useUserStore()
const isLogin = ref(true)
const form = ref({
  username: '',
  password: '',
  nickname: ''
})

const handleSubmit = async () => {
  try {
    if (isLogin.value) {
      const user = await login(form.value)
      userStore.setUserInfo(user)
      ElMessage.success('登录成功')
      router.push('/')
    } else {
      await register(form.value)
      ElMessage.success('注册成功，请登录')
      isLogin.value = true
      form.value.password = ''
    }
  } catch (error) {
    ElMessage.error(error.message)
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-box {
  background: #fff;
  padding: 40px;
  border-radius: 12px;
  width: 400px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.2);
}

.login-box h2 {
  text-align: center;
  margin-bottom: 30px;
  color: #333;
}

.switch-mode {
  text-align: center;
  margin-top: 20px;
}
</style>

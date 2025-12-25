import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserStore = defineStore('user', () => {
  const userInfo = ref(JSON.parse(localStorage.getItem('userInfo') || 'null'))
  
  const setUserInfo = (info) => {
    userInfo.value = info
    localStorage.setItem('userInfo', JSON.stringify(info))
  }
  
  const clearUserInfo = () => {
    userInfo.value = null
    localStorage.removeItem('userInfo')
    localStorage.removeItem('token')
  }
  
  return { userInfo, setUserInfo, clearUserInfo }
})

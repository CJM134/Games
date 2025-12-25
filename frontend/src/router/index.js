import { createRouter, createWebHistory } from 'vue-router'
import Layout from '../views/Layout.vue'
import Home from '../views/Home.vue'
import VideoDetail from '../views/VideoDetail.vue'
import Login from '../views/Login.vue'
import Upload from '../views/Upload.vue'
import UserProfile from '../views/UserProfile.vue'
import Messages from '../views/Messages.vue'
import Notifications from '../views/Notifications.vue'
import StudyRoom from '../views/StudyRoom.vue'
import Moments from '../views/Moments.vue'

const routes = [
  {
    path: '/',
    component: Layout,
    children: [
      { path: '', name: 'Home', component: Home },
      { path: 'video/:id', name: 'VideoDetail', component: VideoDetail },
      { path: 'upload', name: 'Upload', component: Upload },
      { path: 'user/:userId', name: 'UserProfile', component: UserProfile },
      { path: 'messages', name: 'Messages', component: Messages },
      { path: 'notifications', name: 'Notifications', component: Notifications },
      { path: 'study-room', name: 'StudyRoom', component: StudyRoom },
      { path: 'moments', name: 'Moments', component: Moments }
    ]
  },
  { path: '/login', name: 'Login', component: Login }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router

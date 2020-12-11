import Vue from 'vue'
import VueRouter from 'vue-router'
import Signup from '../views/Signup.vue'
import Login from '../views/Login.vue'
import ViewPost from '../views/ViewPost.vue'
import CreateProfile from '../views/CreateProfile.vue'
import Profile from '../views/Profile.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/signup',
    name: 'Signup',
    component: Signup
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/allpost',
    name: 'AllPost',
    component: ViewPost
  },
  {
    path: '/create',
    name: 'Create',
    component: CreateProfile
  },
  {
    path: '/profil',
    name: 'Profil',
    component: Profile
  }
]

const router = new VueRouter({
  routes
})

export default router

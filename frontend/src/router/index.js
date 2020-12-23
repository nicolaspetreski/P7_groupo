import Vue from 'vue'
import Router from 'vue-router'
import auth from '../components/LoginSignup'
import wall from '../view/wall'
import profile from '../view/profile'
import faq from '../view/faq'
import admin from '../view/admin'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'auth',
      component: auth
    },
    {
      path: '/wall',
      name: 'wall',
      component: wall
    },
    {
      path: '/profile/:id',
      name: 'profile',
      component: profile
    },
    {
      path: '/faq',
      name: 'faq',
      component: faq
    },
    {
      path: '/admin',
      name: 'admin',
      component: admin
    }
  ]
})

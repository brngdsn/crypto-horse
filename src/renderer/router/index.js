import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/quick-worth',
      name: 'landing-page',
      component: require('@/components/LandingPage').default
    },
    {
      path: '/sniffer',
      name: 'sniffer',
      component: require('@/components/SnifferPage').default
    },
    {
      path: '*',
      redirect: '/quick-worth'
    }
  ]
})

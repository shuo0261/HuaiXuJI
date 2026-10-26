<template>
  <!-- 原 Aurora App.vue 的根 <div id="app"> 由 VitePress 挂载根节点承担，此处不再嵌套重复 id -->
  <div id="bg" :style="backgroundStyle" aria-hidden="true"></div>
  <VueProgress />
  <Transition name="header-transform" mode="out-in">
    <Header v-show="showHeader || page.isNotFound" :class="{ 'post-page-header': isPostPage }" />
  </Transition>
  <main class="main">
    <!-- 原 Vue2 版此处为 <Transition mode="out-in">；Vue 3.5 下 out-in 包裹动态组件
         在 Suspense 边界内会死锁 leave 过渡（.leave-active 永不结束），故去掉 mode，
         过渡类名与动画时长保持原样 -->
    <Transition name="fade-transform">
      <component :is="currentView" :key="route.path" />
    </Transition>
  </main>
  <Footer />
  <Panel />
  <ScrollTop />
</template>

<script setup>
/**
 * Layout，移植自 aurora-master/src/App.vue + router.js
 * Vue2 Options API → Vue3 <script setup>，DOM 结构原样保留
 * vue-router 路由表（/ /post/:number /archive /category /tag /friend /about）
 * 改为基于 VitePress route.path 的视图分发；Inspiration/Book 页面未列入需求范围
 */
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useData, useRoute, withBase } from 'vitepress'
import backgroundImages from 'virtual:background-images'
import Header from './components/Header.vue'
import Footer from './components/Footer.vue'
import Panel from './components/Panel.vue'
import ScrollTop from './components/ScrollTop.vue'
import VueProgress from './components/VueProgress.vue'
import Home from './views/Home.vue'
import Post from './views/Post.vue'
import Archive from './views/Archive.vue'
import Category from './views/Category.vue'
import Tag from './views/Tag.vue'
import Friend from './views/Friend.vue'
import About from './views/About.vue'
import NotFound from './views/NotFound.vue'
import { store, updateMobileState, progressStart, progressFinish, queuePageTips } from './store'

const route = useRoute()
const { page } = useData()

// Layout 在服务端与浏览器首帧都能确定文章路由；尺寸仍交给 CSS 判断，避免依赖挂载后的手机状态。
const isPostPage = computed(() => !page.value.isNotFound && /^\/post\//.test(String(route.path || '')))
const showHeader = ref(true)
const backgroundStyle = ref({})
let lastResizeTimer = ''
let lastResizeAt = new Date()

// 视图分发（对应原 router.js 路由表）
const currentView = computed(() => {
  // VitePress 在 SSR 404 和站内找不到页面时都提供此标记；先分流，避免未知路径误显示首页或文章加载框。
  if (page.value.isNotFound) return NotFound
  try {
    const path = String(route.path || '').replace(/\.html$/, '')
    if (/^\/post\//.test(path)) return Post
    if (path === '/archive') return Archive
    if (path === '/category') return Category
    if (path === '/tag') return Tag
    if (path === '/friend') return Friend
    if (path === '/about') return About
    return Home
  } catch (e) {
    return Home
  }
})

// 路由监听（对应原 App.vue watch $route）
watch(
  () => route.path,
  (val) => {
    const path = String(val || '').replace(/\.html$/, '')
    if (store.isMobile) {
      showHeader.value = !/^\/post\//.test(path)
    }
    if (/^\/post\//.test(path)) {
      setTimeout(scrollTop, 500)
    }
    queuePageTips(path)
  },
  { immediate: true }
)

// 移动端状态监听（对应原 App.vue watch $isMobile.value）
watch(
  () => store.isMobile,
  (val) => {
    if (val) {
      const path = String(route.path || '').replace(/\.html$/, '')
      showHeader.value = !/^\/post\//.test(path)
    } else {
      showHeader.value = true
    }
  },
  { immediate: true }
)

// 对应原 created：注册顶部进度条 + 初始化
progressStart()

onMounted(() => {
  // 全局 Layout 只在本次完整打开时选一次；路由只替换 main 内视图，不重复抽图或启动轮播。
  // 直接交给 CSS 请求选中的 URL；空池、下载中或失败时，#bg 的现有底色与柔光层自然兜底。
  if (backgroundImages.length) {
    const selected = backgroundImages[Math.floor(Math.random() * backgroundImages.length)]
    backgroundStyle.value = { backgroundImage: `url("${withBase(selected)}")` }
  }
  updateMobileState()
  progressFinish()
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
})

// 窗口监听（对应原 App.vue handleResize）
function handleResize() {
  const now = new Date()
  if (now - lastResizeAt <= 150) return
  lastResizeAt = now
  updateMobileState()

  clearTimeout(lastResizeTimer)
  lastResizeTimer = setTimeout(updateMobileState, 300)
}

// 滚动到顶部
function scrollTop() {
  // 延迟任务真正执行时再判断 hash，用户在这 500ms 内点击目录也不会被旧任务拉回页顶。
  if (typeof window === 'undefined' || window.location.hash) return
  // 页面回顶阶段同时检查系统偏好，避免显式 smooth 绕过 CSS 的减少动画设置。
  window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
}

</script>

<style>
/* App.vue 布局样式（原 scoped，此处保持全局以命中 #app） */
#app {
  position: relative;
}
@media screen and (min-width: 768px) {
  #app {
    padding-bottom: 100px;
  }
}
@media screen and (max-width: 767px) {
  /* 手机文章原本就隐藏导航；首屏先按路由类隐藏，避免挂载后收起导航让正文整体上跳。
     保留 showHeader 的路由/缩放监听，使返回首页和桌面导航仍沿用现有交互。 */
  header.post-page-header {
    display: none !important;
  }
  #app {
    padding-bottom: 60px;
  }
}
#app .main {
  margin: 0 auto;
  max-width: var(--page-desktop);
  user-select: text;
}
</style>

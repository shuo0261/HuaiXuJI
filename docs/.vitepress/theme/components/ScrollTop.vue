<template>
  <div class="wrapper" :style="backTopStyle">
    <div v-if="!isMobileValue" @click="scrollTop" :class="['back-to-top', 'cursor']"></div>
  </div>
</template>

<script setup>
/**
 * ScrollTop，移植自 aurora-master/src/components/ScrollTop/index.vue
 * Vue2 Options API → Vue3 <script setup>，模板原样保留
 * 原组件同时驱动 vue-progressbar 的进度（顶部进度条改由独立 VueProgress 组件承担）
 */
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { store, progressSet } from '../store'

const showBackTop = ref(false)
const topDistance = ref(-950)
const clientHeight = ref(0)
let lastScrollTimer = ''
let lastScrollAt = new Date()

const isMobileValue = computed(() => store.isMobile)

const backTopStyle = computed(() => ({ transform: `translateY(${topDistance.value}px)` }))

onMounted(() => {
  if (!isMobileValue.value) {
    window.addEventListener('scroll', handleScroll)
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll)
})

// 滚动到顶部
const scrollTop = () => {
  // 页面回顶阶段同时检查系统偏好，避免显式 smooth 绕过 CSS 的减少动画设置。
  window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
}

// 监听页面滚动
const handleScroll = () => {
  const now = new Date()
  if (now - lastScrollAt <= 150) return
  lastScrollAt = now
  handleTop()

  clearTimeout(lastScrollTimer)
  lastScrollTimer = setTimeout(handleTop, 300)
}

// 处理滚动事件
const handleTop = () => {
  // 更新顶部进度条（原 $Progress.set）
  const clientHeightValue = document.documentElement.clientHeight
  const scrollRange = document.body.clientHeight - clientHeightValue - 50
  const pageYOffset = window.pageYOffset
  if (scrollRange > 0) {
    progressSet((pageYOffset / scrollRange) * 100)
  }

  // 判断位置，控制滚动到顶部
  const showBackTopValue = pageYOffset >= 200
  if (showBackTopValue !== showBackTop.value || clientHeight.value !== clientHeightValue) {
    topDistance.value = -950 + (showBackTopValue ? clientHeightValue : 0)
    clientHeight.value = clientHeightValue
    showBackTop.value = showBackTopValue
  }
  void store
}
</script>

<style scoped>
.wrapper {
  position: fixed;
  top: 0;
  right: 20px;
  width: 70px;
  height: 900px;
  z-index: var(--zindex-3);
  will-change: transform;
  transition: transform 0.3s ease-out;
}
@media screen and (max-width: 767px) {
  .wrapper {
    display: none;
  }
}
.back-to-top {
  width: 100%;
  height: 100%;
  background-image: var(--backtop-bg);
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center center;
  animation: float 3s linear infinite;
}
</style>

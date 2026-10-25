<template>
  <div id="panel" v-show="showPanel">
    <div class="mask" @click="hidePanel"></div>
    <div class="container">
      <div class="wrapper">
        <div class="short-line">
          <div></div>
          <div></div>
        </div>
        <div class="main">
          <div class="header">
            <div class="inner">{{ panelTitle }}</div>
          </div>
          <div class="body" v-if="showPanel">
            <div class="swiper-wrapper">
              <ul ref="swiper" id="swiper" class="swiper animate" :style="containerStyle">
                <li>
                  <Qrcode @zoom="setZoomSrc" />
                </li>
                <li>
                  <Theme />
                </li>
                <li>
                  <Qrcode @zoom="setZoomSrc" />
                </li>
                <li>
                  <Theme />
                </li>
              </ul>
            </div>
            <button class="cursor btn left-btn" @click="swiperTo(-1)">
              <i class="icon icon-left-open-outline"></i>
            </button>
            <button class="cursor btn right-btn" @click="swiperTo(1)">
              <i class="icon icon-right-open-outline"></i>
            </button>
            <div class="like">
              <p>
                已有
                <span>{{ likeTimes }}</span> 人点赞了哦！
              </p>
            </div>
          </div>
          <div class="footer">
            <div class="cursor" :data-title="likeBtnText" @click="likeSite"></div>
          </div>
        </div>
        <div class="long-line">
          <div></div>
          <div></div>
        </div>
      </div>
    </div>
    <div v-if="!!zoomSrc" class="zoom" @click="setZoomSrc()">
      <img class="cursor" :src="zoomSrc" alt />
    </div>
  </div>
</template>

<script setup>
/**
 * Panel，移植自 aurora-master/src/components/Panel/index.vue
 * Vue2 Options API → Vue3 <script setup>，模板结构与 DOM 嵌套原样保留
 * 点赞、面板翻页与二维码保留；背景统一由 Layout 在完整打开时选择，面板不再改写全局背景。
 */
import { ref, computed } from 'vue'
import Theme from './Theme.vue'
import Qrcode from './Qrcode.vue'
import { store, setShowPanel } from '../store'
import { localRead, localSave } from '../utils'
import './Panel.css'

const likeTimes = ref(0)
const isLikeSite = ref(localRead('isLikeSite', false))
const currentInx = ref(1)
const lockSwiper = ref(false)
const zoomSrc = ref('')
const swiper = ref(null)

const showPanel = computed(() => store.showPanel)
const panelTitle = computed(() => {
  const inx = (currentInx.value + 1) % 2
  return ['背景主题', '赛钱箱'][inx]
})
const distance = computed(() => [0, -600, -1200, -1800][currentInx.value])
const containerStyle = computed(() => ({ transform: `translate3d(${distance.value}px, 0, 0)` }))
const likeBtnText = computed(() => (isLikeSite.value ? "谢谢点赞 (●'◡'●)" : '点赞一下 (<ゝω・)☆'))

// 本地点赞计数
const savedLike = Number(localRead('likeTimes', 0))
likeTimes.value = savedLike || 1

// 点赞
const likeSite = () => {
  if (isLikeSite.value) return
  likeTimes.value += 1
  isLikeSite.value = true
  localSave('isLikeSite', true)
  localSave('likeTimes', likeTimes.value)
}

// 关闭面板
const hidePanel = () => {
  setShowPanel(false)
  setTimeout(() => {
    currentInx.value = 1
  }, 0)
}

// 滑动面板
const swiperTo = (direction) => {
  if (lockSwiper.value) return
  lockSwiper.value = true
  const el = swiper.value
  if (el) el.classList.add('animate')

  currentInx.value += direction
  setTimeout(() => {
    lockSwiper.value = false
    if (currentInx.value === 0) {
      if (el) el.classList.remove('animate')
      currentInx.value = 2
    }
    if (currentInx.value === 3) {
      if (el) el.classList.remove('animate')
      currentInx.value = 1
    }
  }, 500)
}

// 设置缩放二维码
const setZoomSrc = (src = '') => {
  zoomSrc.value = src
}
</script>


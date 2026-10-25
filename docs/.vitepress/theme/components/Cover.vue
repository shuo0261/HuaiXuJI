<template>
  <div class="wrapper">
    <img class="placeholder" :src="placeholderSrc" alt="封面占位" @error="placeholderSrc = fallbackCover" />
    <img :class="['cover', visible && (reused ? 'ready' : 'fadeIn')]" :src="imgSrc" :alt="alt" loading="lazy" @error="imgSrc = fallbackCover" />
  </div>
</template>

<script setup>
/**
 * Cover，移植自 aurora-master/src/components/Cover/index.vue
 * Vue2 Options API → Vue3 <script setup>，模板原样保留
 * 图片相关增强：容器固定 16:9 宽高比 + object-fit: cover，避免封面图把卡片撑变形；
 * 可见封面图增加 loading="lazy"
 */
import { ref, watch, onMounted } from 'vue'
import { withBase } from 'vitepress'
import config from '../config'
import { fileCDN } from '../utils'
import { isRandomCover, resolveArticleCover, cachedArticleCover } from '../article-covers.js'

const props = defineProps({
  src: {
    type: String,
    default: '',
  },
  alt: {
    type: String,
    default: '',
  },
  loadCover: {
    type: Boolean,
    default: false,
  },
  coverKey: { type: String, default: '' },
  coverIndex: { type: Number, default: 0 },
  fallback: { type: String, default: '' },
})

const emit = defineEmits(['loadNext'])

const fallbackCover = withBase(props.fallback || config.defaultShareImage)
// 低成本本地占位不再请求一张所有卡片共享的随机图；路由返回时先使用本次已经选好的地址。
const placeholderSrc = ref(fallbackCover)
const cached = cachedArticleCover(props.src, props.coverKey)
const reused = Boolean(cached)
const imgSrc = ref(cached || (!isRandomCover(props.src) && props.loadCover ? fileCDN(props.src) : fallbackCover))
const visible = ref(props.loadCover)

const loadImg = async () => {
  // SSR 不请求外部接口；普通显式封面直接输出，随机封面以对应的本地封面占位。
  if (typeof Image === 'undefined') {
    imgSrc.value = isRandomCover(props.src) ? fallbackCover : fileCDN(props.src)
    visible.value = true
    return
  }

  const cdnUrl = fileCDN(await resolveArticleCover(props.src, props.coverKey, props.coverIndex))

  const img = new Image()
  img.onload = img.onerror = (event) => {
    // 首页/文章共用的封面在浏览器加载阶段失败时，改用已有本地图片；随机接口不能同时充当唯一兜底。
    const failed = event.type === 'error'
    imgSrc.value = failed ? fallbackCover : cdnUrl
    if (failed) placeholderSrc.value = fallbackCover
    emit('loadNext')
    // 等待 DOM 更新后展示
    setTimeout(() => (visible.value = true), 0)
  }
  img.src = cdnUrl
}

watch(
  () => props.loadCover,
  (val) => {
    if (val) loadImg()
  },
  { immediate: true }
)
</script>

<style scoped>
.wrapper {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  overflow: hidden;
}
.wrapper .placeholder,
.wrapper .cover {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.cover {
  opacity: 0;
}
.fadeIn {
  animation: coverIn 0.8s ease-out forwards;
}
.ready { opacity: 1; }
</style>

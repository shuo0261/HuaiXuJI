<template>
  <div class="wrapper">
    <img class="placeholder" :src="placeholderSrc" alt="封面占位" @error="placeholderFailed = true" />
    <img ref="image" :class="['cover', loaded && 'ready']" :src="imgSrc" :alt="alt" loading="lazy" decoding="async" @load="loaded = true" @error="useFallback" />
  </div>
</template>

<script setup>
/**
 * Cover，移植自 aurora-master/src/components/Cover/index.vue
 * Vue2 Options API → Vue3 <script setup>，模板原样保留
 * 首页和文章详情共用：固定 16:9，原生懒加载；远程地址直接用于实际 img，不额外预取或跨域探测。
 */
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { withBase } from 'vitepress'
import { fileCDN } from '../utils'
import { coverFallback, resolveArticleCover } from '../article-covers.js'

const props = defineProps({
  src: {
    type: String,
    default: '',
  },
  alt: {
    type: String,
    default: '',
  },
  coverKey: { type: String, default: '' },
  fallback: { type: String, default: '' },
})

const image = ref(null)
const loaded = ref(false)
const failed = ref(false)
const placeholderFailed = ref(false)
const source = computed(() => withBase(fileCDN(resolveArticleCover(props.src, props.coverKey))))
const localDefault = computed(() => withBase(props.fallback || coverFallback(props.coverKey)))
// 显式封面本身也可能就是默认 SVG；失败时必须换一个地址，不能回退到同一张坏图。
const fallbackCover = computed(() => localDefault.value === source.value ? withBase('/assets/apple-touch-icon.png') : localDefault.value)
// 本地封面可直接作为 SSR 占位，水合时不闪换其他图；外链加载期间仍显示小体积本地图。
const placeholderSrc = computed(() => placeholderFailed.value ? fallbackCover.value
  : source.value.startsWith('/') && !source.value.startsWith('//') ? source.value : localDefault.value)
const imgSrc = computed(() => failed.value ? fallbackCover.value : source.value)

function useFallback() {
  loaded.value = false
  // 实际 img 的失败事件只回退一次；本地兜底也失败时不反复改 src，不形成重试循环。
  failed.value = true
  placeholderFailed.value = true
}
function syncImage() {
  // SSR 图片可能在 Vue 水合前完成或失败；只读取现有 img 状态补齐展示，不创建新请求。
  if (!image.value?.complete) return
  if (image.value.naturalWidth) loaded.value = true
  else useFallback()
}
onMounted(syncImage)
watch(source, async () => {
  failed.value = false
  loaded.value = false
  placeholderFailed.value = false
  await nextTick()
  syncImage()
})
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
.ready { opacity: 1; }
</style>

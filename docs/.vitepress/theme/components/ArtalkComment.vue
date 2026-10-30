<template>
  <section ref="region" class="article-comments" aria-label="文章评论">
    <h2>评论</h2>
    <p v-if="message" role="status">{{ message }}</p>
    <div ref="container"></div>
  </section>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import config from '../config.js'
const props = defineProps({ pageKey: String, title: String })
const region = ref(null)
const container = ref(null)
const message = ref('滚动至此加载评论')
let observer, instance, disposed = false, started = false
let loadTimeout
let expired = false

// 文章页开启后才挂载本组件；接近视口才加载本站打包的客户端和 CSS，SSR 不接触 DOM。
async function initialize() {
  if (started || disposed) return
  started = true
  observer?.disconnect()
  message.value = '正在加载评论…'
  // 官方客户端在服务配置请求失败时未必触发 list-failed；单次超时兜底，不轮询或无限重试。
  loadTimeout = setTimeout(() => {
    if (disposed) return
    expired = true
    message.value = '评论服务暂时无法连接，请稍后再试。'
    instance?.destroy()
    instance = undefined
  }, 8000)
  try {
    const [{ default: Artalk }] = await Promise.all([import('artalk'), import('artalk/dist/Artalk.css')])
    if (disposed || expired) return
    instance = Artalk.init({ el: container.value, server: config.artalkConfig.server,
      site: config.artalkConfig.site, pageKey: props.pageKey, pageTitle: props.title,
      // 评论独立于统计；禁用 PV 和远程表情资源，失败后由读者自行决定是否刷新页面。
      pvAdd: false, pvEl: '', countEl: '', emoticons: false,
    })
    instance.on('list-loaded', () => { clearTimeout(loadTimeout); if (!disposed) message.value = '' })
    instance.on('list-failed', () => { clearTimeout(loadTimeout); if (!disposed) message.value = '评论服务暂时无法连接，请稍后再试。' })
  } catch {
    clearTimeout(loadTimeout)
    if (!disposed) message.value = '评论暂时无法加载，请稍后再试。'
  }
}
onMounted(() => {
  if (!('IntersectionObserver' in window)) return initialize()
  observer = new IntersectionObserver(entries => {
    if (entries.some(entry => entry.isIntersecting)) initialize()
  }, { rootMargin: '200px' })
  observer.observe(region.value)
})
// Post 使用稳定 permalink 作 key，路由切换卸载旧组件；异步导入完成后也不会复活旧实例。
onBeforeUnmount(() => { disposed = true; clearTimeout(loadTimeout); observer?.disconnect(); instance?.destroy() })
</script>

<style>
.article-comments { margin: 24px 0; padding: 24px; border: 1px solid #c5d7c380; border-radius: 16px; background: #eef5e9c9; backdrop-filter: blur(12px); overflow-wrap: anywhere; }
.article-comments h2 { font-size: 1.25rem; margin: 0 0 18px; }
.article-comments .artalk { --at-color-main: #64875d; --at-color-bg: #f0f6ed; --at-color-bg-transl: #eef5e9cc; --at-color-bg-grey: #e5eedf; --at-color-border: #c5d7c3; --at-color-font: #354a38; --at-border-radius: 10px; }
.article-comments .atk-main-editor { background: #f0f6ed; border-color: #c5d7c3; border-radius: 12px; }
.article-comments .atk-main-editor textarea { background: transparent; }
.article-comments .atk-send-btn:hover { filter: brightness(.96); }
@media(max-width: 767px) { .article-comments { padding: 16px; } }
</style>

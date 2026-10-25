<template>
  <a
    v-if="isExternal"
    :href="to"
    rel="noopener noreferrer"
  >
    <slot />
  </a>
  <a
    v-else
    :href="href"
    :class="{
      'router-link-active': isActive,
      'router-link-exact-active': isExactActive,
    }"
    @click="navigate"
  >
    <slot />
  </a>
</template>

<script setup>
/**
 * RouterLink 垫片组件
 * VitePress 不暴露 vue-router 的 RouterLink；为守住「不改模板红线」，
 * 提供同名组件渲染 <a> 并复刻 vue-router 的 active 类名输出，
 * 导航行为委托 VitePress Router（SPA 切换；修饰键/中键走浏览器默认行为）
 */
import { computed } from 'vue'
import { useRoute, useRouter, withBase } from 'vitepress'

const props = defineProps({
  to: {
    type: [String, Object],
    default: '',
  },
})

const route = useRoute()
const router = useRouter()

const target = computed(() => {
  if (typeof props.to === 'string') return normalize(props.to)
  if (props.to && typeof props.to === 'object' && props.to.params) {
    // 对应原 vue-router 用法 { name: 'post', params: { number } }
    return normalize(`/post/${props.to.params.number}`)
  }
  return normalize('/')
})

// VitePress 默认非 cleanUrls：内部页面路径统一补 .html
function normalize(path) {
  if (path === '/') return path
  return path.endsWith('.html') ? path : `${path}.html`
}

const isExternal = computed(() => /^(https?:|mailto:|tel:|#)/.test(props.to))

const href = computed(() => (isExternal.value ? props.to : withBase(target.value)))

// 归一化：去 .html 后缀与尾斜杠；根路径回退为 '/'（避免变成空串导致 startsWith('/') 恒真）
const currentPath = computed(
  () => String(route.path || '').replace(/\.html$/, '').replace(/\/$/, '') || '/'
)
const targetPath = computed(() => target.value.replace(/\.html$/, '').replace(/\/$/, '') || '/')

const isExactActive = computed(() => currentPath.value === targetPath.value)
const isActive = computed(
  () =>
    isExactActive.value ||
    (targetPath.value !== '/' && currentPath.value.startsWith(targetPath.value + '/'))
)

const navigate = (event) => {
  if (
    event.defaultPrevented ||
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey
  ) {
    return // 交给浏览器默认行为（新标签页打开）
  }
  event.preventDefault()
  router.go(target.value)
}
</script>

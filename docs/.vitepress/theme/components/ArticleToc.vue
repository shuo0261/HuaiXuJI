<template>
  <template v-if="items.length >= 2">
    <aside class="toc-desktop">
      <!-- VitePress 在捕获阶段接管锚点；vp-raw 让目录自己处理一次滚动，避免默认定位再次覆盖偏移。 -->
      <nav class="vp-raw" aria-label="文章目录">
        <p class="toc-title">文章目录</p>
        <ul>
          <li v-for="item in items" :key="item.id" :class="{ sub: item.level === 3 }">
            <a :href="`#${encodeURIComponent(item.id)}`" :aria-current="activeId === item.id ? 'location' : undefined" @click.prevent="goTo(item.id)">{{ item.title }}</a>
          </li>
        </ul>
      </nav>
    </aside>
    <details ref="mobile" class="toc-mobile">
      <summary>文章目录</summary>
      <nav class="vp-raw" aria-label="文章目录">
        <ul>
          <li v-for="item in items" :key="item.id" :class="{ sub: item.level === 3 }">
            <a :href="`#${encodeURIComponent(item.id)}`" :aria-current="activeId === item.id ? 'location' : undefined" @click.prevent="goTo(item.id)">{{ item.title }}</a>
          </li>
        </ul>
      </nav>
    </details>
  </template>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick, watch } from 'vue'
const props = defineProps({ items: { type: Array, default: () => [] } })
const mobile = ref(null)
const activeId = ref(props.items[0]?.id || '')
let observer
let disposed = false

// Post 正文挂载后观察标题，按已越过阅读起点的最后一节高亮；不在每个滚动帧执行计算。
function updateActive() {
  const headings = props.items.map((item) => document.getElementById(item.id)).filter(Boolean)
  const passed = headings.filter((heading) => heading.getBoundingClientRect().top <= 96)
  activeId.value = (passed[passed.length - 1] || headings[0])?.id || ''
}
async function observeHeadings() {
  observer?.disconnect()
  activeId.value = props.items[0]?.id || ''
  await nextTick()
  if (disposed || props.items.length < 2 || !window.IntersectionObserver) return
  // 同时观察完整进入/开始离开：仅观察相交会在标题顶端抵达 80px 时漏掉高亮更新。
  observer = new IntersectionObserver(updateActive, { rootMargin: '-96px 0px -60% 0px', threshold: [0, 1] })
  props.items.forEach((item) => {
    const heading = document.getElementById(item.id)
    if (heading) observer.observe(heading)
  })
  updateActive()
}
function goTo(id) {
  if (mobile.value) mobile.value.open = false
  const heading = document.getElementById(id)
  if (!heading) return
  activeId.value = id
  // 先收起流内目录再滚动；标题的 scroll-margin 为固定返回入口/导航留出位置，保留浏览历史状态。
  history.replaceState(history.state, '', `#${encodeURIComponent(id)}`)
  heading.scrollIntoView({ block: 'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
}
onMounted(observeHeadings)
watch(() => props.items, observeHeadings)
onBeforeUnmount(() => { disposed = true; observer?.disconnect() })
</script>

<style scoped>
.toc-desktop { display: none; }
.toc-mobile { margin: 0 24px 20px; border: 1px solid var(--surface-border); border-radius: var(--card-radius); background: var(--bg-white-dim); }
.toc-mobile summary { padding: 10px 14px; cursor: pointer; color: var(--heading-color); }
nav { font-size: 13px; line-height: 1.65; color: var(--text-muted); }
nav ul { margin: 0; padding: 8px 14px 12px; list-style: none; }
nav li { margin: 4px 0; }
nav li.sub { padding-left: 14px; }
nav a { display: block; color: inherit; overflow-wrap: anywhere; text-decoration: none; }
nav a:hover, nav a[aria-current] { color: var(--link-color); }
nav a[aria-current] { font-weight: 700; }
nav a:focus-visible { outline: 2px solid var(--link-color); outline-offset: 2px; }
@media (max-width: 767px) { .toc-mobile { margin-left: 16px; margin-right: 16px; } }
/* 仅在主栏外确有侧边空间时放目录，不挤压已有 876px 正文；平板沿用流内折叠入口。 */
@media (min-width: 1380px) {
  /* 桌面文章目录挂载时保留横向裁切；hidden 会令 #app 成为不滚动的容器，导致内部 sticky 随正文消失。 */
  :global(#app:has(.toc-desktop)) { overflow-x: clip; }
  .toc-mobile { display: none; }
  .toc-desktop { display: block; position: absolute; left: calc(100% + 16px); top: 0; height: 100%; width: min(220px, calc((100vw - var(--page-desktop)) / 2 - 32px)); }
  .toc-desktop nav { position: sticky; top: 24px; max-height: calc(100vh - 48px); overflow: auto; border-left: 1px solid var(--surface-border); }
  .toc-title { margin: 0; padding: 0 14px 4px; color: var(--heading-color); }
}
@media (prefers-reduced-motion: reduce) { nav a { transition: none; } }
</style>

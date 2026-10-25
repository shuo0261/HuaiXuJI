<template>
  <header>
    <RouterLink class="title" to="/">{{ config.title }}</RouterLink>
    <span class="subtitle">{{ config.subtitle }}</span>
    <nav>
      <RouterLink
        v-for="menu in displayMenu"
        :key="menu.path"
        :to="menu.path"
        :class="{ active: isActiveMenu(menu.path) }"
      >
        <i :class="['icon', `icon-${menu.icon}`]" />
        {{ menu.title }}
      </RouterLink>
    </nav>
  </header>
</template>

<script setup>
/**
 * Header，移植自 aurora-master/src/components/Header/index.vue
 * Vue2 Options API → Vue3 <script setup>，模板原样保留
 * 激活态：原版仅移动端有 .router-link-exact-active 紫色高亮；
 * 应需求为当前路由菜单项动态添加 .active 类（PC/移动端统一生效）
 */
import { computed } from 'vue'
import { useRoute } from 'vitepress'
import config from '../config'
import RouterLink from './RouterLink.vue'
import './Header.css'

const route = useRoute()

const menu = [
  { path: '/', display: true, icon: 'shop', title: '首页' },
  { path: '/archive.html', display: config.archiveOpts.display, icon: 'inbox', title: '归档' },
  { path: '/category.html', display: config.categoryOpts.display, icon: 'bookmark-empty', title: '分类' },
  { path: '/tag.html', display: config.tagOpts.display, icon: 'tag', title: '标签' },
  { path: '/friend.html', display: config.friendOpts.display, icon: 'heart', title: '友链' },
  { path: '/about.html', display: config.aboutOpts.display, icon: 'universal-access', title: '关于' },
]

const displayMenu = computed(() => menu.filter((o) => o.display))

// 当前路由是否命中某菜单项（归一化 .html 后缀与尾斜杠，根路径回退 '/'；
// 文章详情 /post/... 不归属「首页」）
const isActiveMenu = (path) => {
  const current = String(route.path || '').replace(/\.html$/, '').replace(/\/$/, '') || '/'
  const target = String(path).replace(/\.html$/, '').replace(/\/$/, '') || '/'
  return current === target || (target !== '/' && current.startsWith(target + '/'))
}
</script>

<template>
  <div id="home">
    <Transition name="fade-transform" mode="out-in">
      <div v-if="posts.length">
        <div class="content">
          <article
            class="cursor"
            data-aos="fade-up"
            v-for="(post, index) in posts"
            :key="post.id"
            @mouseenter="showTipsPost(post)"
          >
            <RouterLink :to="{ name: 'post', params: { number: post.number, post } }">
              <div class="post-header">
                <!-- 当前三种尺寸实测第二张卡片为 LCP：首两张直接加载，只提升第二张，后续封面交给浏览器懒加载。 -->
                <Cover
                  :src="post.cover.src"
                  :cover-key="post.cover.key"
                  :fallback="post.cover.fallback"
                  :alt="post.cover.title"
                  :loading="index < 2 ? 'eager' : 'lazy'"
                  :fetchpriority="index === 1 ? 'high' : 'auto'"
                />
                <div class="post-head">
                  <h3>{{ post.title }}</h3>
                  <span>{{ post.cover.title }}</span>
                </div>
              </div>
              <div class="post-body">
                <MarkDown :content="post.description" />
              </div>
              <div class="post-meta">
                <span>
                  <i class="icon icon-calendar"></i>
                  {{ post.created_at }}
                </span>
                <span>
                  <i class="icon icon-fire"></i>
                  热度{{ times[post.id] || 1 }}℃
                </span>
                <span>
                  <i class="icon icon-bookmark-empty"></i>
                  {{ post.milestone ? post.milestone.title : '未分类' }}
                </span>
                <span>
                  <i class="icon icon-tag"></i>
                  <span v-for="label in post.labels.slice(0, 2)" :key="label.id">{{ label.name }}</span>
                </span>
              </div>
            </RouterLink>
          </article>
        </div>
        <div class="btn-group" v-if="!isDisabledPrev || !isDisabledNext">
          <Pagination
            :loading="loading"
            :isDisabledPrev="isDisabledPrev"
            :isDisabledNext="isDisabledNext"
            @handlePage="queryPostsPage"
          />
        </div>
      </div>
      <Loading v-else />
    </Transition>
  </div>
</template>

<script setup>
/**
 * Home，移植自 aurora-master/src/views/Home/index.vue
 * Vue2 Options API → Vue3 <script setup>，模板原样保留
 * 数据源：Vuex + GitHub Issues → 本地 Markdown（posts.js）
 */
import { ref, computed } from 'vue'
import MarkDown from '../components/MarkDown.vue'
import Loading from '../components/Loading.vue'
import Pagination from '../components/Pagination.vue'
import Cover from '../components/Cover.vue'
import RouterLink from '../components/RouterLink.vue'
import { store, showTips, setTotalCount } from '../store'
import { queryPosts, queryArchivesCount, queryHot } from '../posts'
import { isMobile } from '../utils'
import './Home.css'

const loading = ref(false)
const page = ref(0)
const pageSize = 10
const posts = ref([])
const list = ref([])
const times = ref({})

const totalCount = computed(() => store.totalCount)
const maxPage = computed(() => Math.ceil(totalCount.value / pageSize))
const isDisabledPrev = computed(() => page.value <= 1)
const isDisabledNext = computed(() => page.value >= maxPage.value)

// 初始化（原 created）
if (!totalCount.value) {
  setTotalCount(queryArchivesCount())
}
queryPostsPage()

// 获取文章列表（原 queryPosts，翻页事件名改为 queryPostsPage 避免与导入重名）
async function queryPostsPage(type = 'next') {
  if (loading.value) return
  const queryPage = type === 'prev' ? page.value - 1 : page.value + 1
  page.value = queryPage

  if (list.value[queryPage]) {
    posts.value = list.value[queryPage]
    scrollTop()
    return
  }

  loading.value = true
  const result = queryPosts({ page: queryPage, pageSize })
  loading.value = false

  // 同步赋值，保证与 SSR 首屏一致，避免水合不匹配
  posts.value = result
  list.value[queryPage] = result
  scrollTop()

  // 获取文章热度
  const ids = result.map((o) => o.id)
  const hot = queryHot(ids)
  times.value = { ...times.value, ...hot }
}

// 滚动到顶部
function scrollTop() {
  if (typeof window === 'undefined') return
  // 页面回顶阶段同时检查系统偏好，避免显式 smooth 绕过 CSS 的减少动画设置。
  window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
}

// 看板娘
function showTipsPost(post) {
  const tips = `要去看看<span style="color: #b854d4"> ${post.title} </span>吗？`
  showTips({ tips })
}
</script>


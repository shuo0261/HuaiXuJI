<template>
  <div id="category">
    <Transition name="fade-transform" mode="out-in">
      <div class="page" v-if="category.length">
        <Quote :quote="config.categoryOpts.qoute" />
        <Transition name="fade-transform" mode="out-in">
          <div v-if="posts.length">
            <div class="clean">
              <span>Category:</span>
              <span class="clean-btn cursor" @click="reset">
                {{ milestone.title }}
                <i class="icon icon-cancel-outline"></i>
              </span>
            </div>
            <ArchiveCard
              :posts="posts"
              :times="times"
              :loading="loading"
              :isDisabledPrev="isDisabledPrev"
              :isDisabledNext="isDisabledNext"
              @handlePage="filterPosts"
            />
          </div>
          <Loading v-else-if="milestone" />
          <ul v-else class="content">
            <li class="cursor" v-for="item in category" :key="item.id" @click="handleFilter(item)">
              <img class="bg" :src="item.cover" alt @error="handleCoverError" />
              <div class="meta">
                <div>
                  <img class="avatar" :src="item.cover" alt @error="handleCoverError" />
                  <span>{{ item.title }} ({{ item.open_issues }})</span>
                </div>
                <p>{{ item.summary }}</p>
              </div>
            </li>
          </ul>
        </Transition>
      </div>
      <Loading v-else />
    </Transition>
  </div>
</template>

<script setup>
/**
 * Category，移植自 aurora-master/src/views/Category/index.vue
 * Vue2 Options API → Vue3 <script setup>，模板原样保留
 * 数据源：Vuex + GitHub milestones → 本地 Markdown front-matter 的 category 字段
 */
import { ref, computed, onMounted } from 'vue'
import { withBase } from 'vitepress'
import Loading from '../components/Loading.vue'
import Quote from '../components/Quote.vue'
import ArchiveCard from '../components/ArchiveCard.vue'
import config from '../config'
import { store } from '../store'
import { queryPosts, queryArchivesCount, queryCategory, queryHot } from '../posts'
import './Category.css'

// 分类列表直接使用默认封面而不经过 Cover；接口失败时复用同一本地图标，避免新分类出现破图，失败兜底本身不重试。
function handleCoverError(event) {
  const fallback = withBase(config.defaultShareImage)
  if (event.target.getAttribute('src') !== fallback) event.target.src = fallback
}

// 首次访问的 SSR 图片可能先于 Vue 水合失败，error 事件已错过；分类页挂载时仅补查这些破图，不重新请求接口。
onMounted(() => {
  document.querySelectorAll('#category img').forEach((image) => {
    if (image.complete && !image.naturalWidth) handleCoverError({ target: image })
  })
})

const loading = ref(false)
const initComment = ref(false)
const category = ref([])
const milestone = ref('')
const totalCount = ref(0)
const page = ref(0)
const pageSize = 10
const posts = ref([])
const list = ref([])
const times = ref({})

const maxPage = computed(() => Math.ceil(totalCount.value / pageSize))
const isDisabledPrev = computed(() => page.value <= 1)
const isDisabledNext = computed(() => page.value >= maxPage.value)

// 初始化（原 created）
queryCategoryList()
initComment.value = true

// 获取分类列表
function queryCategoryList() {
  category.value = queryCategory()
}

// 筛选条件
async function handleFilter(item) {
  if (milestone.value && milestone.value.number === item.number) return
  reset()
  milestone.value = item
  totalCount.value = queryArchivesCount({ milestone: item.title })
  filterPosts()
}

// 重置
function reset() {
  milestone.value = ''
  totalCount.value = 0
  page.value = 0
  list.value = []
  posts.value = []
}

// 查找文章
async function filterPosts(type = 'next') {
  if (loading.value) return
  const queryPage = type === 'prev' ? page.value - 1 : page.value + 1
  page.value = queryPage

  if (list.value[queryPage]) {
    // 同步赋值，保证与 SSR 首屏一致，避免水合不匹配
    posts.value = list.value[queryPage]
    return
  }

  loading.value = true
  const result = queryPosts({ page: queryPage, pageSize, filter: { milestone: milestone.value.title } })

  // 同步赋值，保证与 SSR 首屏一致，避免水合不匹配
  loading.value = false
  posts.value = result
  list.value[queryPage] = result

  // 获取文章热度
  const ids = result.map((o) => o.id)
  const hot = queryHot(ids)
  times.value = { ...times.value, ...hot }
}

// 滚动到顶部
function scrollTop() {
  if (typeof window === 'undefined') return
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>


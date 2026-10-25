<template>
  <div id="archive">
    <Transition name="fade-transform" mode="out-in">
      <div class="page" v-if="posts.length">
        <Quote :quote="config.archiveOpts.qoute" />
        <ArchiveCard
          :posts="posts"
          :times="times"
          :loading="loading"
          :isDisabledPrev="isDisabledPrev"
          :isDisabledNext="isDisabledNext"
          @handlePage="queryPostsPage"
        />
      </div>
      <Loading v-else />
    </Transition>
  </div>
</template>

<script setup>
/**
 * Archive，移植自 aurora-master/src/views/Archive/index.vue
 * Vue2 Options API → Vue3 <script setup>，模板原样保留
 * 数据源：Vuex + GitHub Issues → 本地 Markdown（posts.js）
 */
import { ref, computed } from 'vue'
import Loading from '../components/Loading.vue'
import Quote from '../components/Quote.vue'
import ArchiveCard from '../components/ArchiveCard.vue'
import config from '../config'
import { store, setTotalCount } from '../store'
import { queryPosts, queryArchivesCount, queryHot } from '../posts'
import './Archive.css'

const loading = ref(false)
const initComment = ref(false)
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
initComment.value = true

// 获取文章列表
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


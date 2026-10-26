<template>
  <div id="tag">
    <Transition name="fade-transform" mode="out-in">
      <div class="page" v-if="tag.length">
        <Quote :quote="config.tagOpts.qoute" />
        <Transition name="fade-transform" mode="out-in">
          <div v-if="posts.length">
            <div class="clean">
              <span>Tag:</span>
              <button type="button" class="clean-btn cursor" aria-label="清除标签筛选" @click="reset">
                {{ label.name }}
                <i class="icon icon-cancel-outline"></i>
              </button>
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
          <Loading v-else-if="label" />
          <ul v-else class="content">
            <li v-for="item in tag" :key="item.id">
              <!-- 标签列表直接用原生按钮调用既有筛选逻辑，键盘与鼠标共用 click，不另写按键事件。 -->
              <button type="button" class="cursor" @click="handleFilter(item)">{{ item.name }}</button>
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
 * Tag，移植自 aurora-master/src/views/Tag/index.vue
 * Vue2 Options API → Vue3 <script setup>，模板原样保留
 * 数据源：Vuex + GitHub labels → 本地 Markdown front-matter 的 tags 字段
 */
import { ref, computed } from 'vue'
import Loading from '../components/Loading.vue'
import Quote from '../components/Quote.vue'
import ArchiveCard from '../components/ArchiveCard.vue'
import config from '../config'
import { store } from '../store'
import { queryPosts, queryArchivesCount, queryTag, queryHot } from '../posts'
import './Tag.css'

const loading = ref(false)
const initComment = ref(false)
const tag = ref([])
const label = ref('')
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
queryTagList()
initComment.value = true

// 获取标签列表
function queryTagList() {
  tag.value = queryTag()
}

// 筛选条件
function handleFilter(item) {
  if (label.value && label.value.name === item.name) return
  reset()
  label.value = item
  totalCount.value = queryArchivesCount({ label: item.name })
  filterPosts()
}

// 重置
function reset() {
  label.value = ''
  totalCount.value = 0
  page.value = 0
  list.value = []
  posts.value = []
}

// 查找文章
function filterPosts(type = 'next') {
  if (loading.value) return
  const queryPage = type === 'prev' ? page.value - 1 : page.value + 1
  page.value = queryPage

  if (list.value[queryPage]) {
    // 同步赋值，保证与 SSR 首屏一致，避免水合不匹配
    posts.value = list.value[queryPage]
    return
  }

  loading.value = true
  const result = queryPosts({ page: queryPage, pageSize, filter: { label: label.value.name } })

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


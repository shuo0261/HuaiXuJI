<template>
  <div id="post">
    <!-- 移动端返回按钮（原版无此元素；移动端文章页隐藏 header 后需要返回入口，仅 <=767px 显示） -->
    <button class="back-btn cursor" aria-label="返回" @click="goBack">
      <i class="icon icon-left-open-outline"></i>
    </button>
    <Transition name="fade-transform" mode="out-in">
      <article v-if="post">
        <div class="post-header">
          <!-- 文章首屏封面是实测 LCP；SSR 即发起高优先级请求，保留 Cover 原有 16:9 占位。 -->
          <Cover :src="post.cover.src" :cover-key="post.cover.key" :fallback="post.cover.fallback" :alt="post.cover.title" loading="eager" fetchpriority="high" maskHeight="0.8rem" />
          <div class="post-head">
            <div class="post-title">
              <h1>{{ post.title }}</h1>
              <span>{{ post.cover.title }}</span>
            </div>
            <div class="post-meta">
              <span>
                <i class="icon icon-calendar"></i>
                {{ post.created_at }}
              </span>
              <span>
                <i class="icon icon-fire"></i>
                热度{{ post.times || 1 }}℃
              </span>
              <span>
                <i class="icon icon-bookmark-empty"></i>
                {{ post.milestone ? post.milestone.title : '未分类' }}
              </span>
              <span>
                <i class="icon icon-tag"></i>
                <span v-for="label in post.labels" :key="label.id">{{ label.name }}</span>
              </span>
            </div>
          </div>
        </div>
        <div class="post-body">
          <ArticleToc :items="toc" />
          <MarkDown :content="post.body" target="#post" />
        </div>
      </article>
      <Loading v-else />
    </Transition>

    <!-- 评论占位：Artalk 待接入 -->
    <div v-if="initComment && post" id="artalk-comments"></div>

    <!--
      阅读量占位：Artalk 待接入
      后续计划：通过 Artalk 的页面统计 API（GET /api/v2/stats/page 或 Artalk.init 后
      调用其 PV 查询接口，以页面 URL 作为 pageKey）获取真实阅读量，
      写入本元素的 textContent，例如「阅读 1024 次」。
      在此之前不渲染任何数据，避免出现写死的假数字。
    -->
    <span v-if="initComment && post" id="artalk-page-view"></span>
  </div>
</template>

<script setup>
/**
 * Post，移植自 aurora-master/src/views/Post/index.vue
 * Vue2 Options API → Vue3 <script setup>，模板原样保留
 * 数据源：Vuex + GitHub Issues → 本地 Markdown（posts.js）
 * 评论：Gitalk 剥离，仅保留 <div id="artalk-comments"></div> 占位符
 * 阅读量：预留 <span id="artalk-page-view"></span> 占位符，待接入 Artalk 统计 API（不写死数据）
 */
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vitepress'
import MarkDown from '../components/MarkDown.vue'
import Loading from '../components/Loading.vue'
import Cover from '../components/Cover.vue'
import ArticleToc from '../components/ArticleToc.vue'
import { articleHeadings } from '../article-headings.js'
import { queryPost } from '../posts'
import { progressStart, progressFinish } from '../store'
import './Post.css'

const route = useRoute()
const router = useRouter()

const post = ref('')
// Post 和 MarkDown 使用同一解析规则，目录首屏即可 SSR 输出，不等待浏览器扫描正文。
const toc = computed(() => articleHeadings(post.value?.body || ''))
const initComment = ref(false)
// 从路由路径提取文章标识（VitePress 中 /post/:number → /post/<number>.html）
const postNumber = computed(() => {
  const match = String(route.path || '').match(/\/post\/([^/.]+)/)
  return match ? match[1] : ''
})

// 返回上一级（有历史则后退，直接打开文章页时回首页）
const goBack = () => {
  if (typeof window !== 'undefined' && window.history.length > 1) {
    window.history.back()
  } else {
    router.go('/')
  }
}

// 获取文章详情（原 created）
progressStart()
const found = queryPost(postNumber.value)
post.value = found || ''
progressFinish()
// 评论占位符随首屏渲染（原为 nextTick 后挂载 Gitalk）
initComment.value = true
</script>


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
              <!-- 详情页只展示显式、有效的更新时间；不从文件修改时间推测，也不替换发布日期。 -->
              <span v-if="post.updated_at" class="updated-date">
                最后更新：<time :datetime="post.updated_at">{{ post.updated_at }}</time>
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
        <nav v-if="adjacentPosts.previous || adjacentPosts.next" class="post-navigation" aria-label="文章导航">
          <RouterLink v-if="adjacentPosts.previous" class="previous" rel="prev" :to="{ name: 'post', params: { number: adjacentPosts.previous.number } }">
            <span>上一篇</span>
            <strong>{{ adjacentPosts.previous.title }}</strong>
          </RouterLink>
          <RouterLink v-if="adjacentPosts.next" class="next" rel="next" :to="{ name: 'post', params: { number: adjacentPosts.next.number } }">
            <span>下一篇</span>
            <strong>{{ adjacentPosts.next.title }}</strong>
          </RouterLink>
        </nav>
      </article>
      <Loading v-else />
    </Transition>

    <!-- 默认关闭时不创建组件或占位；permalink 与标题无关，切换文章时销毁旧实例。 -->
    <ArtalkComment v-if="config.artalkConfig.enable && post" :key="post.number"
      :page-key="'/post/' + post.number + '.html'" :title="post.title" />
  </div>
</template>

<script setup>
/**
 * Post，移植自 aurora-master/src/views/Post/index.vue
 * Vue2 Options API → Vue3 <script setup>，模板原样保留
 * 数据源：Vuex + GitHub Issues → 本地 Markdown（posts.js）
 * 评论由主题开关控制，仅文章详情按需加载，不展示手工热度或阅读量。
 */
import { ref, computed, defineAsyncComponent } from 'vue'
import config from '../config.js'
const ArtalkComment = defineAsyncComponent(() => import('../components/ArtalkComment.vue'))
import { useRoute, useRouter } from 'vitepress'
import MarkDown from '../components/MarkDown.vue'
import Loading from '../components/Loading.vue'
import Cover from '../components/Cover.vue'
import ArticleToc from '../components/ArticleToc.vue'
import RouterLink from '../components/RouterLink.vue'
import { articleHeadings } from '../article-headings.js'
import { queryPost, queryPosts, queryArchivesCount } from '../posts'
import { progressStart, progressFinish } from '../store'
import './Post.css'

const route = useRoute()
const router = useRouter()

const post = ref('')
// Post 和 MarkDown 使用同一解析规则，目录首屏即可 SSR 输出，不等待浏览器扫描正文。
const toc = computed(() => articleHeadings(post.value?.body || ''))
// 从路由路径提取文章标识（VitePress 中 /post/:number → /post/<number>.html）
const postNumber = computed(() => {
  const match = String(route.path || '').match(/\/post\/([^/.]+)/)
  return match ? match[1] : ''
})

// 文章详情展示阶段复用首页的日期倒序索引（同日也沿用现有顺序），不另行排序或维护链接。
// 上一篇指较旧文章 index+1，下一篇指较新文章 index-1；边界和找不到当前文章时不生成虚假方向。
const adjacentPosts = computed(() => {
  // 分页接口需要有限的 pageSize；使用实际总数，避免 0 * Infinity 导致 NaN 起点而返回空列表。
  const posts = queryPosts({ pageSize: queryArchivesCount() })
  const index = posts.findIndex((item) => item.number === post.value?.number)
  if (index < 0) return { previous: null, next: null }
  return { previous: posts[index + 1] || null, next: posts[index - 1] || null }
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
</script>


<template>
  <div class="archive">
    <ul class="content">
      <li class="cursor" v-for="(post, i) in posts" :key="post.id" :style="{ borderTopColor: colors[i] }">
        <RouterLink :to="{ name: 'post', params: { number: post.number, post } }">
          <h3>{{ post.title }}</h3>
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
      </li>
    </ul>
    <div class="btn-group" v-if="!isDisabledPrev || !isDisabledNext">
      <Pagination
        :loading="loading"
        :isDisabledPrev="isDisabledPrev"
        :isDisabledNext="isDisabledNext"
        @handlePage="handlePage"
      />
    </div>
  </div>
</template>

<script setup>
/**
 * ArchiveCard，移植自 aurora-master/src/components/ArchiveCard/index.vue
 * Vue2 Options API → Vue3 <script setup>，模板原样保留
 */
import { ref } from 'vue'
import Pagination from './Pagination.vue'
import RouterLink from './RouterLink.vue'
import config from '../config'
import { shuffle } from '../utils'

defineProps({
  posts: {
    type: Array,
    default: () => [],
  },
  times: {
    type: Object,
    default: () => {},
  },
  loading: {
    type: Boolean,
    default: false,
  },
  isDisabledPrev: {
    type: Boolean,
    default: false,
  },
  isDisabledNext: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['handlePage'])

const colors = ref(shuffle(config.themeColors))

// 翻页
const handlePage = (type) => {
  emit('handlePage', type)
}
</script>

<style scoped>
.archive ul {
  display: grid;
  grid-column-gap: 16px;
  padding: 16px;
}
@media screen and (min-width: 768px) {
  .archive ul {
    grid-template-columns: 1fr 1fr;
  }
}
@media screen and (max-width: 767px) {
  .archive ul {
    grid-template-columns: 1fr;
  }
}
.archive ul li {
  list-style: none;
  margin: 0 auto 16px;
  width: 100%;
  border-top-width: 2px;
  border-top-style: solid;
  border-radius: 3px;
  background-color: var(--bg-white-dim);
  box-shadow: var(--card-shadow-light);
  transition: var(--transition-base);
}
@media screen and (min-width: 768px) {
  .archive ul li:hover {
    transform: translateY(-4px);
    box-shadow: var(--card-shadow-light-hover);
  }
}
.archive ul li h3 {
  padding: var(--card-padding);
  font-size: var(--font-size-large);
  font-weight: var(--font-weight-normal);
  line-height: 1.8;
}
.archive ul li .post-meta {
  display: flex;
  padding: var(--card-padding);
  height: 50px;
  border-top: 1px solid var(--bg-dark);
  word-break: keep-all;
}
@media screen and (max-width: 767px) {
  .archive ul li .post-meta {
    max-width: 94vw;
    overflow: auto;
  }
}
.archive ul li .post-meta > span {
  display: flex;
  align-items: center;
  margin-right: 12px;
}
.archive ul li .post-meta > span:last-child {
  margin-right: 0;
}
.archive ul li .post-meta > span span {
  padding-right: 6px;
}
.archive ul li .post-meta > span span:last-child {
  padding-right: 0;
}
.archive ul li .post-meta > span .icon {
  margin-right: 4px;
}
.archive ul li .post-meta > span .icon-fire {
  margin-top: -2px;
}
.archive .btn-group {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 12px;
}

/* 移动端信息栏：防止日期等被挤压断行，排不下时整项换行（仅移动端，PC 端不变） */
@media screen and (max-width: 767px) {
  .archive ul li .post-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 8px 12px;
    height: auto;
    min-height: 50px;
    font-size: 0.75rem;
  }
  .archive ul li .post-meta > span {
    white-space: nowrap;
    margin-right: 0; /* 间距改由容器的 gap 控制，避免双重间距 */
  }
  .archive ul li .post-meta > span .icon {
    margin-right: 3px;
  }
}
</style>

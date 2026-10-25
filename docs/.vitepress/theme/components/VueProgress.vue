<template>
  <div class="vue-progress-bar" v-show="progressShow">
    <div class="vue-progress-bar-track" :style="{ width: `${progress}%` }"></div>
  </div>
</template>

<script setup>
/**
 * VueProgress，替代 vue-progressbar（main.js 中注册，配色 #b28fce / 4px / 顶部）
 * 滚动进度由 ScrollTop 驱动，路由切换由 Layout 驱动
 */
import { computed } from 'vue'
import { store } from '../store'

const progressShow = computed(() => store.progressShow)
const progress = computed(() => store.progress)
</script>

<style scoped>
.vue-progress-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  z-index: var(--zindex-4);
  pointer-events: none;
}
.vue-progress-bar-track {
  height: 100%;
  background-color: #b28fce;
  transition: width 0.2s ease 0s, opacity 0.5s ease 0s;
}
</style>

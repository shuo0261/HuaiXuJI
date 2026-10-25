<template>
  <img class="loading" :src="config.loadingImg" alt />
</template>

<script setup>
/**
 * Loading，移植自 aurora-master/src/components/Loading/index.vue
 * Vue2 Options API → Vue3 <script setup>
 */
import config from '../config'
</script>

<style scoped>
.loading {
}
@media screen and (min-width: 768px) {
  .loading {
    margin: 100px auto;
    width: 100px;
  }
}
@media screen and (max-width: 767px) {
  .loading {
    margin: 150px auto;
    width: 80px;
  }
}
</style>

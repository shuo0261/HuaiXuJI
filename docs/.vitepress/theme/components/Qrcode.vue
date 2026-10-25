<template>
  <!-- Panel 调用此组件；未确认本站收款资料时不展示原作者二维码，也不留下空白赞赏区域。 -->
  <ul class="qrcode" v-if="config.qrcode.length">
    <li v-for="item in config.qrcode" :key="item.name">
      <h3>{{ item.name }}</h3>
      <img class="cursor" :src="item.img" :alt="item.name" @click="zoom(item.img)" />
    </li>
  </ul>
  <p v-else>暂未开放赞赏。</p>
</template>

<script setup>
/**
 * Qrcode（Panel 子组件），移植自 aurora-master/src/components/Panel/components/Qrcode.vue
 * Vue2 Options API → Vue3 <script setup>，模板原样保留
 */
import config from '../config'

const emit = defineEmits(['zoom'])

const zoom = (src) => {
  emit('zoom', src)
}
</script>

<style scoped>
.qrcode {
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 10px;
}
.qrcode h3 {
  margin-bottom: 10px;
  font-size: var(--font-size-larger);
  font-weight: var(--font-weight-normal);
  line-height: 2;
}
.qrcode img {
  width: 150px;
  height: 150px;
  border-radius: 3px;
}
</style>

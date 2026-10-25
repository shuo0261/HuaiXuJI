<template>
  <div class="quote">
    <i class="icon icon-quote-left"></i>
    <span>{{ quote }}</span>
    <i class="icon icon-quote-right"></i>
  </div>
</template>

<script setup>
/**
 * Quote，移植自 aurora-master/src/components/Quote/index.vue
 * Vue2 Options API → Vue3 <script setup>，模板原样保留
 */
defineProps({
  quote: {
    type: String,
    default: '',
  },
})
</script>

<style scoped>
.quote {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;
  margin-bottom: 16px;
  padding: 32px 0;
}
.quote span {
  letter-spacing: 1px;
  font-size: var(--font-size-large);
}
.quote i {
  position: absolute;
  font-size: var(--font-size-icon);
}
.quote i:first-child {
  top: 0;
  left: 16px;
}
.quote i:last-child {
  bottom: 0;
  right: 16px;
}
</style>

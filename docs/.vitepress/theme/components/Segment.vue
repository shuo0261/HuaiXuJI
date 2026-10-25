<template>
  <div class="segment" :style="{ borderColor: color }">
    <div class="label" :style="{ color }">
      <span>{{ title }}</span>
    </div>
    <slot></slot>
  </div>
</template>

<script setup>
/**
 * Segment，移植自 aurora-master/src/components/Segment/index.vue
 * Vue2 Options API → Vue3 <script setup>，模板原样保留
 */
defineProps({
  color: {
    type: String,
    default: '',
  },
  title: {
    type: String,
    default: '',
  },
})
</script>

<style scoped>
.segment {
  margin-bottom: 16px;
  padding: 14px 0;
  text-align: justify;
  overflow: unset;
  border-top-width: 2px;
  border-top-style: solid;
  border-radius: 3px;
  background-color: var(--bg-white-dim);
  box-shadow: var(--card-shadow-light);
  transition: var(--transition-base);
}
@media screen and (min-width: 768px) {
  .segment:hover {
    transform: translateY(-4px);
    box-shadow: var(--card-shadow-light-hover);
  }
}
.segment:last-child {
  margin-bottom: 0;
}
.segment .label {
  display: inline-block;
  position: relative;
  margin-bottom: 10px;
  padding: 0 14px 0 32px;
  height: 32px;
  line-height: 32px;
  border-radius: 0 3px 3px 0;
  background-color: currentColor;
}
@media screen and (min-width: 768px) {
  .segment .label {
    left: -32px;
  }
}
@media screen and (max-width: 767px) {
  .segment .label {
    left: -16px;
  }
}
.segment .label span {
  color: white;
}
.segment .label::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 0;
  width: 0;
  height: 0;
  background-color: transparent;
  border-style: solid;
  border-width: 0 16px 16px 0;
  border-color: transparent;
  border-right-color: currentColor;
  filter: brightness(120%);
}
</style>

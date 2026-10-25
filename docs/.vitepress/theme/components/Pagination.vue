<template>
  <div v-show="!hide" class="pagination">
    <div class="previous">
      <Spinner v-if="loading" />
      <div v-else class="btn cursor">
        <span v-show="!isDisabledPrev" @click="handlePage('prev')">Prev</span>
        <span v-show="!isDisabledNext" @click="handlePage('next')">Next</span>
      </div>
    </div>
    <div class="rect"></div>
  </div>
</template>

<script setup>
/**
 * Pagination，移植自 aurora-master/src/components/Pagination/index.vue
 * Vue2 Options API → Vue3 <script setup>，模板原样保留
 */
import { computed } from 'vue'
import Spinner from './Spinner.vue'

const props = defineProps({
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

const hide = computed(() => props.isDisabledPrev && props.isDisabledNext)

const handlePage = (type) => {
  if (type === 'prev' && props.isDisabledPrev) return
  if (type === 'next' && props.isDisabledNext) return
  emit('handlePage', type)
}
</script>

<style scoped>
.pagination {
  position: relative;
  width: 160px;
  z-index: var(--zindex-2);
}
.pagination .previous {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 40px;
  line-height: 40px;
  font-size: var(--font-size-large);
  background-color: var(--bg-white-dim);
  box-shadow: var(--card-shadow);
  transition: all 0.3s ease-out;
  text-shadow: 0 1px 1px var(--purple-dark);
  text-align: center;
  overflow: hidden;
}
.pagination .previous .btn {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}
.pagination .previous .btn span {
  display: block;
  flex: 1;
  color: var(--purple-dark);
  transition: background 0.3s ease-out;
}
.pagination .previous .btn span:hover {
  background-color: var(--purple-dim);
}
.pagination .previous::before {
  content: '';
  display: block;
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: var(--purple-dark);
  transform: scaleX(0);
  transform-origin: bottom left;
  transition: all 0.3s ease-out;
  z-index: var(--zindex-bottom);
}
.pagination .rect {
  position: absolute;
  top: 7px;
  left: -7px;
  width: 174px;
  height: 40px;
  border: 2px solid white;
  border-top-width: 0;
  background-color: transparent;
  transition: all 0.3s ease-out;
  z-index: var(--zindex-bottom);
}
.pagination .rect::before,
.pagination .rect::after {
  content: '';
  position: absolute;
  background-color: white;
  transition: background 0.3s ease-out;
}
.pagination .rect::before {
  top: 0;
  left: -1px;
  width: 7px;
  height: 2px;
}
.pagination .rect::after {
  top: 0;
  right: -1px;
  width: 7px;
  height: 2px;
}
.pagination:hover .previous {
  transform: translateY(2px);
}
.pagination:hover .previous span {
  color: var(--whitesmoke);
}
.pagination:hover .previous::before {
  transform: scaleX(1);
}
.pagination:hover .rect {
  border-color: var(--purple-dim);
}
.pagination:hover .rect::before,
.pagination:hover .rect::after {
  background-color: var(--purple-dim);
}
</style>

<template>
  <div id="friend">
    <Transition name="fade-transform" mode="out-in">
      <div class="page" v-if="friend.length">
        <Quote :quote="config.friendOpts.qoute" />
        <div class="me">
          <span>欢迎各位大佬交换友链 (づ￣ 3￣)づ</span>
          <span>★ Bio：{{ config.title }}</span>
          <span>★ Motto：{{ config.subtitle }}</span>
          <!-- 友链自述只展示本站已确认的地址和头像，域名/资料留空时不冒用原作者信息。 -->
          <span v-if="config.siteUrl">★ URL：{{ config.siteUrl }}</span>
          <span
            v-if="config.aboutOpts.avatar"
            >★ Avatar：<a :href="config.aboutOpts.avatar" target="_blank" rel="noopener noreferrer"
              >点击获取</a
            ></span
          >
        </div>
        <ul class="content">
          <li v-for="(item, index) in friend" :key="item.name">
            <a :href="item.link" :title="item.description" rel="noopener noreferrer" target="_blank">
              <Cover
                class="cover"
                :src="item.cover"
                :alt="item.name"
                :loadCover="index < LOAD_INX"
                @loadNext="loadNext"
              />
              <div class="info">
                <img :src="item.avatar" alt />
                <span>{{ item.name }}</span>
              </div>
            </a>
          </li>
        </ul>
      </div>
      <Loading v-else />
    </Transition>
  </div>
</template>

<script setup>
/**
 * Friend（友链），移植自 aurora-master/src/views/Friend/index.vue
 * Vue2 Options API → Vue3 <script setup>，模板原样保留
 * 数据源：Vuex + GitHub Friend Issue → 本地配置（config.friends）
 */
import { ref } from 'vue'
import Loading from '../components/Loading.vue'
import Cover from '../components/Cover.vue'
import Quote from '../components/Quote.vue'
import config from '../config'
import { queryFriends } from '../posts'
import './Friend.css'

const friend = ref([])
const initComment = ref(false)
const LOAD_INX = ref(4)

// 初始化（原 created）
friend.value = queryFriends()
initComment.value = true

function loadNext() {
  LOAD_INX.value += 1
}
</script>


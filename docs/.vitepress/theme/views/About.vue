<template>
  <div id="about">
    <Transition name="fade-transform" mode="out-in">
      <div class="page" v-if="about">
        <Quote :quote="config.aboutOpts.qoute" />
        <div class="content">
          <div class="header">
            <!-- 关于页仅展示站主已填写的资料；空字段不留下原站头像、身份或空图标。 -->
            <img v-if="config.aboutOpts.avatar" :src="config.aboutOpts.avatar" alt />
            <div class="info">
              <span>
                <i class="icon icon-fort-awesome"></i>
                {{ config.title }}
              </span>
              <span>
                <i class="icon icon-pagelines"></i>
                {{ config.subtitle }}
              </span>
              <span v-if="config.aboutOpts.graduated">
                <i class="icon icon-graduation-cap"></i>
                {{ config.aboutOpts.graduated }}
              </span>
              <span v-if="config.aboutOpts.college">
                <i class="icon icon-tripadvisor"></i>
                {{ config.aboutOpts.college }}
              </span>
            </div>
          </div>
          <div class="contact" v-if="config.aboutOpts.contact.length">
            <a
              v-for="(item, i) in config.aboutOpts.contact"
              :key="i"
              :href="item.link"
              rel="noopener noreferrer"
              target="_blank"
            >
              <img alt :src="item.icon" />
            </a>
          </div>
          <Segment v-for="(item, i) in about" :key="item.title" :title="item.title" :color="colors[i]">
            <MarkDown :content="item.content" />
          </Segment>
        </div>
      </div>
      <Loading v-else />
    </Transition>
  </div>
</template>

<script setup>
/**
 * About，移植自 aurora-master/src/views/About/index.vue
 * Vue2 Options API → Vue3 <script setup>，模板原样保留
 * 数据源：Vuex + GitHub About Issue → 本地配置（config.about）
 */
import { ref } from 'vue'
import MarkDown from '../components/MarkDown.vue'
import Loading from '../components/Loading.vue'
import Quote from '../components/Quote.vue'
import Segment from '../components/Segment.vue'
import config from '../config'
import { queryAbout } from '../posts'
import { shuffle } from '../utils'
import './About.css'

const colors = ref(shuffle(config.themeColors))
const about = ref('')
const initComment = ref(false)

// 初始化（原 created）
about.value = queryAbout()
initComment.value = true
</script>


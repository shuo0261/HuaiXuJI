<template>
  <footer>
    <div class="prpr" v-if="!isMobileValue" v-show="modelReady">
      <div class="waifu" v-if="showWaifu">
        <div
          v-show="tips && isMini"
          :class="['tips', waifu === 'tia' && 'tia']"
          v-html="tips"
        ></div>
        <canvas
          @click="handleClickWaifu"
          id="live2d"
          width="280"
          height="250"
        />
      </div>
      <div class="tool">
        <div class="menu" v-if="showWaifu">
          <ul>
            <li
              class="cursor"
              v-for="item in menu"
              :key="item.type"
              @click="handleClick(item.type)"
              @mouseenter="handleHover(item.type)"
            >
              <i :class="['icon', `icon-${item.icon}`]"></i>
            </li>
          </ul>
          <div class="devil">
            <i class="icon icon-emo-devil"></i>
          </div>
        </div>
      </div>
    </div>
    <div class="site-info">
      <p class="motto">槐序初霁，花落满径。</p>
      <p class="credits">
        © 2026
        <a
          v-if="config.rebuiltRepository"
          :href="config.rebuiltRepository"
          rel="noopener noreferrer"
          target="_blank"
          >{{ config.title }}</a
        >
        <template v-else>{{ config.title }}</template>
        · Theme by
        <a
          rel="noopener noreferrer"
          target="_blank"
          href="https://github.com/chanshiyucx/aurora"
          >Aurora</a
        >
      </p>
      <!-- Layout 的全站页脚仅在存在有效备案时创建这一行；关闭项没有节点，不留空白和分隔符。 -->
      <p v-if="showIcp || showPolice" class="filings">
        <a
          v-if="showIcp"
          :href="config.footer.icp.link"
          target="_blank"
          rel="noopener noreferrer"
          >{{ config.footer.icp.number }}</a
        >
        <a
          v-if="showPolice"
          :href="config.footer.police.link"
          target="_blank"
          rel="noopener noreferrer"
          >{{ config.footer.police.number }}</a
        >
      </p>
    </div>
    <img
      v-if="!isMobileValue"
      class="sakura cursor"
      :src="sakura"
      @click="dropPanel"
      @mouseenter="handleHover('panel')"
      alt="sakura"
    />
  </footer>
</template>

<script setup>
/**
 * Footer，移植自 aurora-master/src/components/Footer/index.vue
 * Vue2 Options API → Vue3 <script setup>；看板娘只在桌面页面完成加载后初始化，站内路由复用当前 Footer。
 * 看板娘：本站 live2d.min.js + waifu/costume/tips 原版配置；贴图授权待确认，暂沿用原 URL。
 * 剥离依赖：Vuex → 组合式 store；APlayer 音乐播放器未移植（menu 中 talk/camera 逻辑保留）
 */
import {
  ref,
  computed,
  onMounted,
  onBeforeUnmount,
  nextTick,
  watch,
} from 'vue';
import { withBase } from 'vitepress';
import config from '../config';
import { store, showTips, setShowPanel } from '../store';
import { random } from '../utils';
import model from '../live2d/waifu.json';
import costume from '../live2d/costume.json';
import tipsConfig from '../live2d/tips.json';
import { loadRenderer } from '../live2d/loader.js';
import './Footer.css';

// Layout 使用本组件展示全站页脚：开启、号码非空且 URL 可用才输出链接，防止空备案、错误协议或占位行。
function validFiling(item) {
  if (
    item?.enable !== true ||
    typeof item.number !== 'string' ||
    !item.number.trim() ||
    typeof item.link !== 'string'
  )
    return false;
  try {
    return ['https:', 'http:'].includes(new URL(item.link).protocol);
  } catch {
    return false;
  }
}
const showIcp = computed(() => validFiling(config.footer?.icp));
const showPolice = computed(() => validFiling(config.footer?.police));

const { waifuClick, hoverTips, clickTips, hitokotos } = tipsConfig;
const sakura = 'https://cdn.jsdelivr.net/gh/chanshiyucx/yoi/blog/sakura.png';
const live2dPath = withBase('/live2d/');

const showWaifu = ref(true);
const waifu = ref('tia');
const isMini = ref(true);
const modelReady = ref(false);
let loading = false;
let disposed = false;
let generation = 0;
let readyTimer, tipsTimer, closeTimer, idleId, idleTimer, loadHandler;
const menu = [
  { icon: 'venus-double', type: 'switch' },
  { icon: 't-shirt', type: 'dressup' },
  { icon: 'camera', type: 'takephoto' },
  { icon: 'comment', type: 'talk' },
  { icon: 'cancel-outline', type: 'close' },
];

const isMobileValue = computed(() => store.isMobile);
const tips = computed(() => store.tips);
const tipsUpdateAt = computed(() => store.tipsUpdateAt);

// Footer 比 Layout 先挂载，store 的 SSR 初值仍是桌面；直接按真实断点决定是否下载，避免手机隐藏后仍加载模型。
const isDesktop = () => window.matchMedia('(min-width: 768px)').matches;
const cancelStart = () => {
  if (loadHandler) window.removeEventListener('load', loadHandler);
  loadHandler = null;
  if (idleId !== undefined) window.cancelIdleCallback(idleId);
  clearTimeout(idleTimer);
};
const scheduleStart = () => {
  cancelStart();
  if (disposed || !showWaifu.value || !isDesktop()) return;
  loadHandler = () => {
    loadHandler = null;
    // 装饰脚本不进入正文、字体和背景的首屏加载链；页面 load 后再利用空闲时间启动。
    if (window.requestIdleCallback)
      idleId = window.requestIdleCallback(() => dressup(false, true), {
        timeout: 1000,
      });
    else idleTimer = setTimeout(() => dressup(false, true), 0);
  };
  if (document.readyState === 'complete') loadHandler();
  else window.addEventListener('load', loadHandler, { once: true });
};
const stopWaifu = () => {
  generation += 1;
  clearInterval(readyTimer);
  clearTimeout(tipsTimer);
  tipsTimer = undefined;
  loading = false;
  modelReady.value = false;
  window.auroraLive2D?.dispose();
};
onMounted(scheduleStart);
watch(isMobileValue, async (mobile) => {
  cancelStart();
  if (mobile) stopWaifu();
  else {
    await nextTick();
    scheduleStart();
  }
});
onBeforeUnmount(() => {
  disposed = true;
  cancelStart();
  clearTimeout(closeTimer);
  stopWaifu();
});

// 换装 / 切换看板娘（原 dressup：随机贴图 + 设置模型 + loadlive2d 渲染）
const dressup = async (switchWaifu = false, keepCostume = false) => {
  if (loading || disposed || !showWaifu.value || !isDesktop()) return;
  loading = true;
  const current = ++generation;
  const fail = (error) => {
    if (current !== generation) return;
    console.warn('[Live2D] 装饰加载失败，已隐藏。', error);
    stopWaifu();
    showWaifu.value = false;
  };
  try {
    await loadRenderer(`${live2dPath}live2d.min.js?v=20261025-lifecycle1`);
    if (current !== generation || disposed || !isDesktop()) return;
    await nextTick();
    if (switchWaifu) waifu.value = waifu.value === 'tia' ? 'pio' : 'tia';
    // 操作按钮复用同一渲染器；从剩余服装中随机选择，避免重复抽中当前贴图时在主线程无限循环。
    const choices = costume[waifu.value].filter(
      (texture) => texture !== window.waifuModel?.textures[0]
    );
    // 从手机恢复桌面时沿用当前服装，避免仅改变窗口宽度就额外下载另一张贴图；手动换装仍重新随机。
    const textures =
      keepCostume && window.waifuModel?.model === `moc/${waifu.value}.moc`
        ? window.waifuModel.textures[0]
        : choices[random(0, choices.length - 1)];
    window.waifuModel = {
      ...model,
      model: `moc/${waifu.value}.moc`,
      textures: [textures],
      layout: { ...model.layout, width: waifu.value === 'tia' ? 1.82 : 2 },
    };
    modelReady.value = false;
    window.loadlive2d('live2d', live2dPath, '');
    const deadline = Date.now() + 20000;
    // 旧库只有同步入口，真正就绪取决于模型和贴图；通过最小桥接接口等待，期间不展示空白遮挡层。
    readyTimer = setInterval(() => {
      if (window.auroraLive2D.isReady()) {
        clearInterval(readyTimer);
        loading = false;
        modelReady.value = true;
        if (!tipsTimer) loopTips();
      } else if (Date.now() >= deadline)
        fail(new Error('模型或贴图加载失败/超时'));
    }, 100);
  } catch (error) {
    fail(error);
  }
};

const loopTips = () => {
  tipsTimer = setTimeout(loopTips, 16 * 1000);
  const now = new Date();
  if (tips.value || (tipsUpdateAt.value && now - tipsUpdateAt.value < 6000))
    return;
  const inx = random(0, hitokotos.length - 1);
  showTips({ tips: hitokotos[inx].hitokoto });
};

const handleClickWaifu = () => {
  let nextTips = tips.value;
  while (nextTips === tips.value) {
    const inx = random(0, waifuClick.length - 1);
    nextTips = waifuClick[inx];
  }
  showTips({ tips: nextTips });
};

const handleHover = (type) => {
  let tip;
  if (type === 'switch') {
    tip = `要召唤<span style="color: #b854d4">${waifu.value === 'pio' ? ' 欧内酱 Tia ' : ' 一抹多 Pio '} </span>么(◍˃̶ᗜ˂̶◍)✩`;
  } else {
    tip = hoverTips[type];
  }
  if (!tip) return;
  showTips({ tips: tip });
};

const handleClick = (type) => {
  switch (type) {
    case 'switch':
      dressup(true);
      break;
    case 'dressup':
      dressup();
      break;
    case 'takephoto':
      if (window.Live2D) {
        window.Live2D.captureName = 'waifu.png';
        window.Live2D.captureFrame = true;
      }
      showTips({ tips: clickTips.takePhoto });
      break;
    case 'talk': {
      const inx = random(0, hitokotos.length - 1);
      showTips({ tips: hitokotos[inx].hitokoto });
      break;
    }
    case 'close':
      showTips({ tips: clickTips.close });
      clearTimeout(closeTimer);
      closeTimer = setTimeout(() => {
        showWaifu.value = false;
        cancelStart();
        stopWaifu();
      }, 2000);
      break;
    default:
      return;
  }
};

const dropPanel = () => {
  setShowPanel(true);
};
</script>

/**
 * Aurora 主题配置文件（本地 Markdown 版）
 * 移植自 aurora-master/src/config.js，剥离 GitHub Issues / Gitalk / LeanCloud 配置
 */
import site, { getSiteUrl } from '../site.js';

// 分类等既有封面调用统一使用本地默认图，不再通过随机接口获取站点基础图片。
const defaultCover = '/images/covers/grove.svg';

export default {
  /**
   * =========================================================
   *                      站点功能【必需】
   * =========================================================
   */

  /**
   * 站点标题
   */
  title: site.title,
  subtitle: site.subtitle,
  siteUrl: getSiteUrl(),
  // Footer 在页脚展示阶段读取改版仓库；留空时不生成链接，地址来自已确认的 origin，不替代原作者仓库。
  rebuiltRepository: 'https://github.com/shuo0261/HuaiXuJI',
  // Layout 使用 Footer 展示本站备案；两项独立开启，未取得真实号码和详情地址时保持关闭。
  footer: {
    icp: { enable: false, number: '', link: 'https://beian.miit.gov.cn/' },
    police: { enable: false, number: '', link: '' },
  },

  /**
   * =========================================================
   *                        页面设置
   * =========================================================
   */

  /**
   * 归档页面
   */
  archiveOpts: {
    display: true, // 是否显示该页面
    enableComment: false, // 是否开启评论功能
    qoute: '槐序初晴，岁月拾遗', // 页面顶部一言
  },

  /**
   * 分类页面
   */
  categoryOpts: {
    display: true,
    enableComment: false,
    qoute: '风摇槐序，萤火流光',
  },

  /**
   * 标签配置
   */
  tagOpts: {
    display: true,
    enableComment: false,
    qoute: '微雨初歇，夏虫低语',
  },

  /**
   * 友链页面
   */
  friendOpts: {
    display: true,
    enableComment: true,
    qoute: '绿槐高柳，知己相逢',
  },

  /**
   * 关于页面
   */
  aboutOpts: {
    display: true,
    enableComment: true,
    qoute: '槐序初霁，花落满径',
    // 头像、学历与联系方式未提供时不展示；已提供的职业和爱好放在下方 about 的个人信息分段。
    avatar: '',
    graduated: '',
    college: '',
    contact: [],
  },

  /**
   * =========================================================
   *                         主题自定义
   * =========================================================
   */

  /**
   * 加载动画
   */
  loadingImg: '//cdn.jsdelivr.net/gh/chanshiyucx/yoi/blog/loading.gif',

  /**
   * 文章默认图
   */
  defaultCover,
  // SEO 的稳定分享图配置保持不变；文章加载失败时由 Cover 选取本地兜底图。
  defaultShareImage: '/assets/apple-touch-icon.png',

  /**
   * 赛钱箱
   */
  // TODO：仅在站主提供自己的收款码后启用，不能将访客引导至原作者的个人账户。
  qrcode: [],

  /**
   * 主题配色，主要用于文章、灵感、关于等卡片配色
   * 推荐一个超棒的取色站，日本の伝統色：http://nipponcolors.com/
   */
  themeColors: [
    '#B28FCE', // 薄
    '#86C166', // 苗
    '#F596AA', // 桃
    '#F19483', // 曙
    '#F9BF45', // 玉子
    '#FAD689', // 浅黄
    '#E79460', // 洗柿
    '#2EA9DF', // 露草
    '#FB966E', // 洗朱
    '#BC9F77', // 白茶
    '#867835', // 黄海松茶
    '#B9887D', // 水がき
  ],

  /**
   * 分类补充信息：summary 一言 / cover 分类封面
   * 未配置的分类回退到 defaultCover
   */
  categories: {
    前端: {
      summary: '凡心所向，素履以往',
      cover: defaultCover,
    },
    生活: {
      summary: '生如夏花之绚烂',
      cover: defaultCover,
    },
    ACG: {
      summary: '此生无悔入东方，来世愿生幻想乡',
      cover: defaultCover,
    },
  },

  /**
   * 友链页面（移植自 GitHub Friend Issue，数据源改为本地配置）
   */
  friends: [
    {
      name: 'Aurora',
      link: 'https://github.com/chanshiyucx/aurora',
      description: '槐序霁的原版主题，感谢原作者的开源分享。',
      // Friend 复用本站已有图标作为头像和封面，不为单条友链增加头像 CDN。
      avatar: '/assets/apple-touch-icon.png',
      cover: '/assets/apple-touch-icon.png',
    },
    {
      name: '他的日常时光',
      link: 'https://www.17ci.com',
      description: '国内备案网站，分享开发、生活等内容，偶尔更新。',
      // Friend 复用本站已有图标作为头像和封面，不为单条友链增加头像 CDN。
      avatar:
        'https://www.17ci.com/wp-content/uploads/2023/12/1702602409-logoko.png',
      cover:
        'https://www.17ci.com/wp-content/uploads/2023/12/1702602409-logoko.png',
    },
  ],

  /**
   * 关于页面段落（移植自 GitHub About Issue，数据源改为本地配置）
   */
  about: [
    {
      title: '关于本站',
      content:
        '本站基于 VitePress 构建，主题复刻自 Aurora，数据源为本地 Markdown。',
    },
    {
      title: '个人寄语',
      content:
        '劝君莫惜金缕衣，劝君惜取少年时。\n\n花开堪折直须折，莫待无花空折枝。',
    },
    {
      title: '个人信息',
      content: '职业：程序员\n\n爱好：读书、听音乐、瞎折腾',
    },
    {
      title: '最喜欢的文章：《匆匆》',
      // About 的 Segment + MarkDown 直接展示用户提供的原文；保留五段、原字和段首空格，不改写或补出版信息。
      content: `作者：朱自清

　　燕子去了，有再来的时候；杨柳枯了，有再青的时候；桃花谢了，有再开的时候。但是，聪明的，你告诉我，我们的日子为什么一去不复返呢？——是有人偷了他们罢：那是谁？又藏在何处呢？是他们自己逃走了罢：现在又到了哪里呢？

　　我不知道他们给了我多少日子；但我的手确乎是渐渐空虚了。在默默里算着，八千多日子已经从我手中溜去；像针尖上一滴水滴在大海里，我的日子滴在时间的流里，没有声音，也没有影子。我不禁头涔涔而泪潸潸了。

　　去的尽管去了，来的尽管来着；去来的中间，又怎样地匆匆呢？早上我起来的时候，小屋里射进两三方斜斜的太阳。太阳他有脚啊，轻轻悄悄地挪移了；我也茫茫然跟着旋转。于是——洗手的时候，日子从水盆里过去；吃饭的时候，日子从饭碗里过去；默默时，便从凝然的双眼前过去。我觉察他去的匆匆了，伸出手遮挽时，他又从遮挽着的手边过去，天黑时，我躺在床上，他便伶伶俐俐地从我身上跨过，从我脚边飞去了。等我睁开眼和太阳再见，这算又溜走了一日。我掩着面叹息。但是新来的日子的影儿又开始在叹息里闪过了。

　　在逃去如飞的日子里，在千门万户的世界里的我能做些什么呢？只有徘徊罢了，只有匆匆罢了；在八千多日的匆匆里，除徘徊外，又剩些什么呢？过去的日子如轻烟，被微风吹散了，如薄雾，被初阳蒸融了；我留着些什么痕迹呢？我何曾留着像游丝样的痕迹呢？我赤裸裸来到这世界，转眼间也将赤裸裸的回去罢？但不能平的，为什么偏要白白走这一遭啊？

　　你聪明的，告诉我，我们的日子为什么一去不复返呢？`,
    },
  ],
};

---
title: "槐序霁部署指南：IIS、Nginx 与 Docker"
date: "2026-10-25"
category: "部署教程"
tags: ["VitePress", "IIS", "Nginx", "Docker", "部署教程"]
cover: "https://t.alcy.cc/ysz"
coverTitle: "部署手册"
description: "从槐序霁的实际配置和静态产物出发，说明环境准备、个性化设置、IIS、Nginx、Docker 部署，以及 Cloudflare 缓存、HTTPS 和发布验收。"
hot: 1
---

## 一、准备环境与生产产物

这份指南针对当前 VitePress 1.6.4、Vue 3.5 与 Vite 5.4.21 的静态站点。不部署正式服务器，也不假定改版仓库已经公开；先从自己获得的项目副本进入 `blog`。

项目 `package.json` 没有单独声明 `engines`；当前 Vite 的要求为 `^18.0.0 || >=20.0.0`，本轮本地验证环境为 Node.js 20.11.0。这是已验证环境记录，不代表旧版本仍受官方维护。新环境按 [Node.js 官方发布状态](https://nodejs.org/en/about/previous-releases) 选择仍受支持的 LTS，并执行本项目构建确认兼容；本教程不升级依赖。

```powershell
cd E:\Code\MyCode\aurora-rebuild\blog
node --version
npm ci
npm run docs:dev
```

开发地址以终端输出为准。确认内容后执行：

```powershell
npm run docs:build
npm run docs:preview
```

生产目录为 `docs/.vitepress/dist/`，根部应有 `index.html`、`archive.html`、`category.html`、`tag.html`、`404.html` 和 `post/` 等目录。三篇正式文章的实际路径是：

```text
post/about-huaixuji.html
post/markdown-writing-guide.html
post/huaixuji-deployment-guide.html
```

发布整个产物目录的内容，而不是整个项目、`node_modules`、备份目录或开发缓存。正式服务器只需提供静态文件，不运行 `docs:dev` 或 `docs:preview`。文章正文会进入公开 HTML 和客户端资源，未发布草稿不能放进扫描目录。

每次发布使用新的完整目录，并保留上一版本以便恢复；不要仅向旧目录叠加文件，否则已删除文章的旧 HTML 可能继续可访问。以下服务器配置都是教程示例，路径必须按自己的服务器调整。

## 二、个性化配置索引

路径均相对于 `blog/`：

| 要修改的内容 | 真实位置与字段 |
| --- | --- |
| 博客名称、首页副标题、简介 | `docs/.vitepress/site.js`：`title`、`subtitle`、`description` |
| 归档、分类、标签、友链、关于 Slogan | `docs/.vitepress/theme/config.js`：`archiveOpts.qoute`、`categoryOpts.qoute`、`tagOpts.qoute`、`friendOpts.qoute`、`aboutOpts.qoute`；`qoute` 是当前实际拼写 |
| 导航 | `theme/components/Header.vue` 的 `menu` 数组；页面显示开关来自对应 `*Opts.display`；不把 `enableComment` 当作已接入评论服务 |
| 关于信息 | `theme/config.js`：`about` 段落、`aboutOpts.avatar`、`graduated`、`college`、`contact` |
| 友链 | 同文件 `friends`：`name`、`link`、`description`、`avatar`、`cover` |
| 文章、分类、标签 | `docs/posts/*.md` 的 `category` 单分类与 `tags` 数组；自动聚合，不手工维护索引 |
| 分类说明、图片 | `theme/config.js` 的 `categories`，按分类名称配置 `summary`、`cover`；未配置时自动回退 |
| 文章封面 | Frontmatter 的 `cover`、`coverTitle`；普通显式地址优先，省略时使用独立本地封面 |
| 稳定分享图 | 同文件 `defaultShareImage`，目前复用 `/assets/apple-touch-icon.png`；封面本地兜底见 `docs/public/images/covers/README.txt` |
| 当前改版仓库 | `theme/config.js` 的 `rebuiltRepository`；已配置为 `https://github.com/shuo0261/HuaiXuJI`，留空不显示页脚仓库链接 |
| 背景池 | `docs/public/img/` 与其中 README；启动/构建自动筛选 JPG、PNG、WebP、AVIF，单张不超过 3 MB |
| Maple 字体 | `theme/assets/maple-mono-nf-cn.css`、`docs/public/fonts/maple-mono-nf-cn/README.txt`；保留 NF CN v7.9、400/700、Unicode 范围和许可 |
| Live2D | `theme/components/Footer.vue`、`theme/live2d/`、`docs/public/live2d/README.txt`；渲染器、模型与动作为本地文件，服装贴图仍在原远程地址 |
| 站点与文章 SEO | `docs/.vitepress/site.js`、`seo.js`；文章复用 `title`、`description`、`cover` |
| 正式域名 | `docs/.vitepress/site.js` 的 `url`，填写真实根 URL；当前不支持带子目录的站点 URL |
| ICP、公安备案 | `theme/config.js` 的 `footer.icp`、`footer.police`，详见下一节 |
| 页脚固定文案 | `theme/components/Footer.vue` 的 `site-info`；样式仅在 `Footer.css` |

### 名称、背景与封面

先改 `site.js`，再检查页面文案和自己的资料；不要填写推测的个人身份、邮箱或仓库地址。背景图片只放有权使用的素材，建议 300–800 KB，不需要手填清单，也不会定时轮播。完整刷新选一张，站内切换保持不变。

三篇初始文章显式使用 `https://t.alcy.cc/ysz`。组件通过官方多图接口独立选择，在同次浏览中保存选择；重复、超时、不可读大小或超过 256 KiB 的原图会回退到各自的本地封面，16:9 占位保持不变。第三方图库不保证绝对无重复；普通明确封面地址继续优先，不填 `cover` 时使用本地封面。

随机封面不会直接输出为 `og:image`。稳定分享图使用本地 `defaultShareImage`，在正式域名未知时不编造图片绝对地址。后续需要更清晰的分享图时，先准备自己有权使用的稳定本地图片，再修改此字段，不更换字体或背景系统。

### 正文图片与未来图床

现有 Markdown 渲染器与 `cover` 均已支持本地图片和完整 HTTPS URL，无需新增图床后台或修改文章系统。稳定封面、图标及重要资源适合放在 `docs/public/images/`；保留已有本地 WebP，不强制迁移，也不自动上传第三方服务。

```markdown
![图片说明](/images/example.webp)
![图片说明](https://img.example.com/posts/example.webp)
```

第一个地址对应发布产物的 `/images/example.webp`，源文件是 `docs/public/images/example.webp`；第二个是未来自建图床的写法，`img.example.com` 仅为示例域名，不作为真实配置。封面可同样填写 `cover: "https://img.example.com/posts/example.webp"`。

页面相对地址 `../images/example.webp` 在 `/post/<slug>.html` 下也会指向 `/images/example.webp`；解析依据是浏览器页面 URL，不是 `.md` 源文件目录。推荐根相对路径 `/images/`，不要使用本机磁盘路径。部署时保留整个 `images/` 目录，`img/` 仍只用于原有随机背景池。

静态服务器可以正常引用远程图床，图片由浏览器单独请求；外部服务可能受网络、HTTPS 证书、防盗链和服务可用性影响。SEO 分享图应使用稳定 URL。自建图床准备好之后，只需按实际地址填写 `cover` 或标准 Markdown 图片语法，不需要先迁移本地重要资源。

### 正式域名与 SEO

在 `site.js` 中把 `url: ''` 改为自己已经确定的真实根 URL，例如填入实际 `https://` 地址；不要把文档占位词、localhost、旧站域名或 `example.com` 写入生产配置。

填写后重新构建，统一得到 canonical、og:url、稳定 OG 图片地址、sitemap hostname 和 robots 的 Sitemap 地址。域名留空时省略这些地址；文章标题、摘要和 OG 类型仍可生成。站点目前按域名根目录发布，不要只改 VitePress 的 `base` 就假定自定义路由、公共资源与 SEO 已支持子路径。

### ICP 与公安备案

默认配置如下，不含任何示例号码：

```js
footer: {
  icp: {
    enable: false,
    number: '',
    link: 'https://beian.miit.gov.cn/',
  },
  police: {
    enable: false,
    number: '',
    link: '',
  },
}
```

分别填写自己的真实备案文字和真实链接，再把对应 `enable` 改为 `true`。`number` 是展示文字，`link` 是点击目标；公安备案链接从自己的正式备案结果取得，不拼接虚构详情地址。配置展示不能替代办理备案，本教程不判断某一部署地点的实际办理要求。

Layout 使用 Footer，在全站页脚展示阶段读取这两项。每项只有 `enable === true`、号码非空、链接是有效 HTTP/HTTPS URL 时才创建 `<a>`。两个开关独立，未通过条件的节点不存在；两项都关闭时连备案行也不存在，没有隐藏占位或空分隔符。两项都开启时横排，空间不足自然换行。

## 三、IIS 静态部署

### 启用静态文件服务

Windows Server 通过服务器管理器添加 Web Server（IIS）角色，启用 Common HTTP Features 中的 Static Content、Default Document；Windows 客户端通过“启用或关闭 Windows 功能”选择相应 IIS 功能。只需静态服务，不要求 ASP.NET 或 Node.js 运行时。

创建一个新的站点目录，把完整构建产物放在其中。在 IIS 管理器添加站点，设置物理路径、实际主机名和端口，给应用程序池身份或 `IIS_IUSRS` 必要的读取权限。默认文档使用 `index.html`。默认文档配置参见 [Microsoft 官方说明](https://learn.microsoft.com/en-us/iis/configuration/system.webserver/defaultdocument/)。

### MIME 与缓存

先检查现有 MIME 列表，只对未识别的格式补充。下面是可保存到发布目录根部 `web.config` 的最小示例；`remove` 后再 `mimeMap` 避免继承映射重复。不要覆盖已有生产 `web.config`，应先核对并合并需要的部分。

```xml
<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <system.webServer>
    <defaultDocument enabled="true">
      <files><clear /><add value="index.html" /></files>
    </defaultDocument>
    <staticContent>
      <clientCache cacheControlMode="DisableCache" />
      <remove fileExtension=".woff2" />
      <mimeMap fileExtension=".woff2" mimeType="font/woff2" />
      <remove fileExtension=".webp" />
      <mimeMap fileExtension=".webp" mimeType="image/webp" />
      <remove fileExtension=".avif" />
      <mimeMap fileExtension=".avif" mimeType="image/avif" />
      <remove fileExtension=".moc" />
      <mimeMap fileExtension=".moc" mimeType="application/octet-stream" />
      <remove fileExtension=".mtn" />
      <mimeMap fileExtension=".mtn" mimeType="application/octet-stream" />
    </staticContent>
  </system.webServer>
  <location path="fonts">
    <system.webServer>
      <staticContent>
        <clientCache cacheControlMode="UseMaxAge" cacheControlMaxAge="7.00:00:00" />
      </staticContent>
    </system.webServer>
  </location>
</configuration>
```

此例先让一般文件重新验证缓存，只为字体目录设置七天缓存，避免 HTML 长期不更新。需要缓存其他静态目录时，再为 `assets`、`img` 设置合适的目录级策略；不要把同一长缓存策略套到所有 HTML。配置含义见 [MIME 映射](https://learn.microsoft.com/en-us/iis/configuration/system.webserver/staticcontent/mimemap) 与 [clientCache](https://learn.microsoft.com/en-us/iis/configuration/system.webserver/staticcontent/clientcache) 官方文档。

### 直链、404 与 HTTPS

直接访问 `/post/about-huaixuji.html` 并刷新，应读取真正存在的 HTML 文件；不存在的路径应返回 404。这里不是依靠前端路由才能打开的空壳 SPA，不添加“所有请求都回退 index.html”的重写规则。可选配置 `404.html` 为自定义错误页，仍应保留 404 状态。

HTTPS 需要与真实域名匹配的证书，在站点绑定中添加 HTTPS、443 端口及正确主机名，并检查证书和防火墙；证书更新后重新验收。步骤参见 [IIS HTTPS 官方指南](https://learn.microsoft.com/en-us/iis/manage/configuring-security/how-to-set-up-ssl-on-iis)。本轮未在 IIS 上实际执行部署。

## 四、Nginx 静态部署

先按服务器操作系统安装 Nginx，确认可以执行 `nginx -v`；发行版安装方式见 [官方安装指引](https://nginx.org/en/docs/install.html)。本节以 Linux 上常见的配置目录为例，不执行安装命令。

把产物放入例如 `/srv/huaixuji` 的新发布目录。确认全局 `http` 配置已包含 `mime.types`；将下面的 `server` 放到已有 `http` 块，或通常会被它包含的 `conf.d/*.conf`。若已有同端口默认站点，应按实际环境调整，不直接叠加冲突配置。

```nginx
server {
    listen 80;
    server_name _;
    root /srv/huaixuji;
    index index.html;

    location / {
        try_files $uri $uri/ =404;
        add_header Cache-Control "no-cache";
    }

    location ~* \.html$ {
        try_files $uri =404;
        add_header Cache-Control "no-cache" always;
    }

    location ~* \.(js|css|woff2|png|jpe?g|webp|avif|svg|ico)$ {
        try_files $uri =404;
        add_header Cache-Control "public, max-age=604800";
    }

    error_page 404 /404.html;
    location = /404.html {
        internal;
        add_header Cache-Control "no-cache" always;
    }
}
```

这是 HTTP 验收配置，`server_name _` 不是正式域名。真实路径优先，找不到返回 404；`no-cache` 允许保存但要求重新验证，和 `no-store` 的含义不同。静态资源示例缓存七天，文件同名替换时需要版本或清缓存。依据：[try_files](https://nginx.org/en/docs/http/ngx_http_core_module.html#try_files)、[响应头配置](https://nginx.org/en/docs/http/ngx_http_headers_module.html)。

保存后先运行 `nginx -t`，成功后才重新加载配置。使用域名和证书正式启用 HTTPS 时，配置 `listen 443 ssl`、实际 `server_name`、`ssl_certificate` 与 `ssl_certificate_key`；证书文件必须真实存在且匹配该域名，再将 HTTP 跳转到实际 HTTPS 地址。本轮没有执行 Nginx 服务命令或申请证书。

## 五、Docker：构建产物加 Nginx 镜像

先安装并启动支持 Linux 容器的 Docker Engine 或 Docker Desktop，执行 `docker version` 确认客户端与服务端均可用。不同系统按 [Docker 官方安装说明](https://docs.docker.com/engine/install/) 准备环境，不需要为本博客安装容器编排系统。

不在容器内增加内容后台。先在本机完成 `npm ci` 与 `npm run docs:build`，再准备一个项目外的全新构建上下文，例如 `../huaixuji-container/`：

```text
huaixuji-container/
├─ Dockerfile
├─ nginx.conf
└─ dist/              完整静态产物的内容
```

从 `blog` 执行以下复制步骤前，确认目标是新的空发布目录；已有目录请另选名字，不合并旧版本：

```powershell
New-Item -ItemType Directory -Path ..\huaixuji-container\dist
Copy-Item -Path docs\.vitepress\dist\* -Destination ..\huaixuji-container\dist -Recurse
```

把上一节的 `server` 配置保存为上下文里的 `nginx.conf`，仅将 `root` 改为 `/usr/share/nginx/html`。Dockerfile 内容为：

```dockerfile
FROM nginx:stable-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY dist/ /usr/share/nginx/html/
EXPOSE 80
```

仍在 `blog` 执行：

```powershell
docker build -t huaixuji-static ..\huaixuji-container
docker run -d --name huaixuji-blog --restart unless-stopped -p 8080:80 huaixuji-static
```

本机打开 `http://localhost:8080/` 和文章直链做验收。更新时使用新的产物和镜像，先检查新版本，再切换已有发布流程；不要直接覆盖正在使用的用户容器。本教程没有新增实际 Docker 配置，也没有运行 Docker。

Dockerfile 的 `COPY` 以构建上下文为准，不能把上下文之外的 `docs/.vitepress/dist` 当成可直接复制的路径。基础镜像和指令说明见 [Docker 官方文档](https://docs.docker.com/build/concepts/dockerfile/)。正式发布可固定已验证的镜像版本或摘要；此 HTTP 示例尚不具备源站 HTTPS，接入 CDN 前还需要源站 TLS 配置。

## 六、Cloudflare：DNS、HTTPS 与缓存

先让静态源站本身能访问，再将自己的域名接入 Cloudflare，按控制台指引修改权威 DNS，并把所需 A/AAAA 记录指向真实服务器。需要 CDN 代理的 Web 记录开启代理；DNS 接入不会替你上传构建产物。

源站准备好有效、未过期且主机名匹配的证书后，使用 Full (strict) 连接。仅有边缘 HTTPS 并不代表源站链路已经加密，不能拿前面的 HTTP 容器示例冒充已完成严格 TLS。参见 [Full (strict) 条件](https://developers.cloudflare.com/ssl/origin-configuration/ssl-modes/full-strict/)。

### 按资源类型处理缓存

| 资源 | 本项目的更新策略 |
| --- | --- |
| 首页、文章 HTML | 保持重新验证或绕过边缘缓存，不全站套用长期 Cache Everything |
| 带内容哈希的 JS/CSS | 新构建会改变 URL，可在确认后设置较长缓存；上传时保留 HTML 引用的全部资源 |
| Maple 字体 | CSS URL 的 `?v=` 是文件 SHA256 前 12 位；更新字节与 Unicode 声明时同时更新版本，缓存键保留查询参数 |
| 本地背景、正文图 | 未带版本的文件使用适度缓存；更换图片优先用新文件名，再构建清单或更新引用 |
| robots、sitemap | 正式域名配置或内容更新后检查新结果，必要时单独清除旧缓存 |
| 第三方封面、Live2D 贴图 | 不属于本站域名下的缓存；本站 Cloudflare 配置不能保证这些服务的稳定性 |

Cloudflare 默认不缓存 HTML 或 JSON，缓存规则可能改变这一行为；应检查自己是否设置过覆盖规则，而非仅凭默认值判断。[默认缓存行为](https://developers.cloudflare.com/cache/concepts/default-cache-behavior/)

默认缓存键包含查询字符串，不要启用忽略所有查询参数的策略，否则字体的 `?v=` 更新可能失效。[缓存键说明](https://developers.cloudflare.com/cache/how-to/cache-keys/)

### 更新与失效

发布新目录后检查首页、变更文章、CSS/JS 与字体实际请求。如果 HTML 仍旧，使用控制台按实际 URL 清除缓存，并按所配置的缓存键处理查询参数；不要只清首页就假定所有旧文章已更新。浏览器自身的长缓存也要依靠资源版本更新，单独清 CDN 不会让用户已经缓存的同名文件立即失效。[按 URL 清除缓存](https://developers.cloudflare.com/cache/how-to/purge-cache/purge-by-single-file/)

这里不配置 Oracle 服务器或 Cloudflare 账号，也没有线上缓存测速结果。

## 七、发布验收清单

1. 首页只显示当前有效文章，点击三篇新文章都能阅读。
2. 把三篇 `/post/*.html` 地址分别直接粘贴到新窗口并刷新；不存在地址返回真实 404。
3. 分类是三类，各一篇；初始标签共有 11 个不同名称，随着内容变化应以实际 Frontmatter 重新统计；归档日期为 `2026-10-25`。
4. 封面请求新接口，阻断接口时仍有本地兜底和比例占位；随机背景每次完整打开只选一张，站内切换不重选。
5. 在 Network 确认字体 200/304、类型正确、没有字体 404；不修改现有 Unicode 分包。
6. 桌面 Live2D 在冷访问、刷新与站内切换下正常，手机不下载隐藏的模型；贴图完全本地化仍须先确认许可，不自行镜像。
7. 查看页面原始 HTML，确认每篇 title、description、OG 标题/描述/type 独立且不重复；正文也应存在于 SSR HTML。
8. 正式 `site.url` 配置后检查 canonical、og:url、稳定 og:image、`/sitemap.xml` 和 `/robots.txt` 中的域名一致；配置留空时省略相关地址是预期行为。
9. 1440、768、390px 检查正文、代码、表格、图片和 Footer；备案全部关闭时没有备案 DOM，开启一项或两项时不溢出。
10. 完成现有聚焦测试与 `npm run docs:build`，再按自己的正式发布流程操作。

构建、预览与发布是不同阶段：本地构建通过不代表 IIS、Nginx、Docker 或 Cloudflare 已部署成功。把实际服务器和 CDN 的验收结果另外记录即可。

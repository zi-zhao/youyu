import { createApp } from 'vue'
import App from './App.vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import Store from './store/index.js'
import router from './router'

import VueMarkdownEditor from '@kangc/v-md-editor';
import VMdPreview from '@kangc/v-md-editor/lib/preview';
import '@kangc/v-md-editor/lib/style/base-editor.css';
import '@kangc/v-md-editor/lib/style/preview.css';

//视频播放vue-video-player插件
// import VideoPlayer from 'vue-video-player/src'
// import 'video.js/dist/video-js.css' 
// import 'vue-video-player/src/custom-theme.css'
import VueVideoPlayer from '@videojs-player/vue'
import { VideoJsPlayer } from 'video.js'
import 'video.js/dist/video-js.css'


//v-md-editor的提示块
import createTipPlugin from '@kangc/v-md-editor/lib/plugins/tip/index';
import '@kangc/v-md-editor/lib/plugins/tip/tip.css';
//v-md-editor的emoji
import createEmojiPlugin from '@kangc/v-md-editor/lib/plugins/emoji/index';
import '@kangc/v-md-editor/lib/plugins/emoji/emoji.css';
//v-md-editor的katex
import createKatexPlugin from '@kangc/v-md-editor/lib/plugins/katex/cdn';
//v-md-editor的流程图
import createMermaidPlugin from '@kangc/v-md-editor/lib/plugins/mermaid/cdn';
import '@kangc/v-md-editor/lib/plugins/mermaid/mermaid.css';
//v-md-editor的高亮代码行
import createHighlightLinesPlugin from '@kangc/v-md-editor/lib/plugins/highlight-lines/index';
import '@kangc/v-md-editor/lib/plugins/highlight-lines/highlight-lines.css';

import vuepressTheme from '@kangc/v-md-editor/lib/theme/vuepress.js';
import '@kangc/v-md-editor/lib/theme/style/vuepress.css';

import 'katex/dist/katex.min.css';
import { useIntersectionObserver } from '@vueuse/core'
import 'element-plus/dist/index.css'
import '../public/global.css'; // 引入全局 CSS
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import Prism from 'prismjs';
// import './style.css';
import './tailMain.css';

import githubTheme from '@kangc/v-md-editor/lib/theme/github';
import '@kangc/v-md-editor/lib/theme/style/github.css';

// highlightjs
import hljs from 'highlight.js';

import VueEasyLightbox from 'vue-easy-lightbox'
const app=createApp(App)
app.use(ElementPlus)
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}
app.use(Store)
app.use(router)
app.use(VueVideoPlayer)

app.use(VueEasyLightbox) // 全局变量

app.use(VueMarkdownEditor)

VueMarkdownEditor.use(vuepressTheme, {
  Prism,
})
VueMarkdownEditor.use(createTipPlugin());
VueMarkdownEditor.use(createEmojiPlugin());
VueMarkdownEditor.use(createKatexPlugin());
VueMarkdownEditor.use(createMermaidPlugin());
VueMarkdownEditor.use(createHighlightLinesPlugin());

VMdPreview.use(githubTheme, {
  Hljs: hljs,
});
app.use(VMdPreview);

app.mount('#app')


// 图片懒加载
app.directive('img-lazy',{
  mounted(el,binding){
    useIntersectionObserver(
      el,
      ([{ isIntersecting }]) => {
        if(isIntersecting){
          el.src = binding.value
        }
      },
    )
  }
})


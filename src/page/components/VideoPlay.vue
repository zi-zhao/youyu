<template>
  <div class="video">
    <video-player
      class="video-player vjs-big-play-centered"
      :ref="player"
      :sources="props.sources"
      :poster="props.sources[0].poster"
      crossorigin="anonymous"
      playsinline
      controls
      :volume="0.6"        
      :height="320"      
      :playback-rates="[0.7, 1.0, 1.5, 2.0, 2.5]"        
      @mounted="handleMounted"
      @ready="handleEvent($event)"
      @play="handleEvent($event)"
      @pause="handleEvent($event)"
      @ended="handleEvent($event)"
      @loadeddata="handleEvent($event)"
      @waiting="handleEvent($event)"
      @playing="handleEvent($event)"
      @canplay="handleEvent($event)"
      @canplaythrough="handleEvent($event)"
      @timeupdate="handleEvent(player?.currentTime())"
      @contextmenu.prevent
  />
  </div>
</template>
  
<script setup>
// id: 播放器的唯一标识符。类型为字符串。
// src: 视频的URL。类型为字符串，支持响应式布局。
// sources: 视频源数组。允许指定多种格式的视频源。类型为数组，支持响应式布局。
// width/height: 播放器的宽度和高度。类型为数字，支持响应式布局。
// preload: 指定视频预加载的方式。类型为字符串。
// loop: 是否循环播放视频。类型为布尔值。
// muted: 是否静音播放。类型为布尔值。
// poster: 视频的封面图URL。类型为字符串。
// controls: 是否显示播放器控制条。类型为布尔值。
// autoplay: 是否自动播放视频。类型为布尔值或字符串，支持响应式布局。
// playsinline: 在某些设备上，视频是否应该内联播放（而不是全屏）。类型为布尔值。
// crossorigin: 设置跨源资源共享(CORS)。类型为字符串。
// volume: 控制播放器的音量，介于0（静音）到1（最大音量）之间。类型为数字。
// playbackRate: 控制播放速率。类型为数字。
// playbackRates: 可选的播放速率数组。类型为数字数组。
// fluid: 是否使用流体布局，自适应父容器大小。类型为布尔值。
// language: 播放器的语言设置。类型为字符串。
// tracks: 视频字幕轨道设置。类型为数组。
// responsive: 是否支持响应式布局。类型为布尔值。
import { defineProps,watch,ref} from 'vue'

const props = defineProps({
  poster: String, // 视频封面图片 URL
  sources: Array,  // 视频源信息，支持多种格式
  autoplay: Boolean,  // 是否自动播放视频
  isLive:Boolean,
});

const player = ref(null);
const videoElement = player.value; // 获取到视频元素

console.log(props.sources);
// watch(() => props.sources, (newSources, oldSources) => {
//   if (newSources[0].src !== oldSources[0].src) {
//     resetPlayer();
//   }
// }, { deep: true });

// const resetPlayer = () => {
//   if (player.value) {
//     player.value.pause();
//     player.value.currentTime = 0;  // 重置时间滚动条到开始位置
//     player.value.load(); // 为了确保新的视频源加载
//   }
// };

</script>

<style scoped>
.video-player {
  background-color: black;
  width: 100%;
  height: 70vh;
}
@media (max-width:768px){
  .video-player {
    height: 35vh;
  }
}
</style>

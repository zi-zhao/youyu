<template>
  <div style="width: 100%;height: 100%;background-color: #f2caca;">
    <div >
      <VideoPlay 
      v-if="showVideoPlayer"
        :sources="sources" 
        :isLive="isLive" 
        :poster="poster" 
        :autoplay="autoplay">
      </VideoPlay>
    </div>
  </div>
</template>
  
<script setup>
import  VideoPlay  from "@/page/components/VideoPlay.vue";
import { ref,onMounted,onUnmounted,computed,watchEffect,watch} from 'vue';

const showVideoPlayer  = ref(true);
const isLive = (false);
const poster = ref('https://youyu-bucket-1-1319554411.cos.ap-chengdu.myqcloud.com/%E7%94%9F%E6%88%90%E7%9A%84%E5%94%AF%E4%B8%80%E7%9A%84%E5%9B%BE%E7%89%87%E5%90%8D.jpg');
const autoplay = ref(false);
const url = ref();
const sources = computed(() => [
  {  
    type: "video/mp4",
    // src:'https://youyu-bucket-1-1319554411.cos.ap-chengdu.myqcloud.com/%E5%B1%95%E7%A4%BA%E8%A7%86%E9%A2%91.mp4'
    // src:"https://vjs.zencdn.net/v/oceans.mp4"
    // src:"https://youyu-bucket-1-1319554411.cos.ap-chengdu.myqcloud.com/%E3%80%90Re%20_make%E3%80%91%E7%88%86%E7%87%83%E6%B7%B7%E5%89%AA%EF%BD%9E%E8%BF%99%E4%B8%AA%E4%B8%96%E7%95%8C%E5%94%AF%E4%B8%80%E7%9A%84%E9%94%99%E8%AF%AF%E5%B0%B1%E6%98%AF%E4%B8%8E%E6%88%91%E4%B8%BA%E6%95%8C%EF%BC%81%20-%201.ONE%20OK%20ROCK%20%28%E3%83%AF%E3%83%B3%E3%82%AA%E3%82%AF%E3%83%AD%E3%83%83%E3%82%AF%29%20-%20Re_make%28Av200092745%2CP1%29.mp4"
    // src:'http://youyu-bucket-video4paper-invisible-1319554411.cos.ap-chengdu.myqcloud.com/paper/video/22/3/%E7%AC%AC%E4%B8%80%E5%A4%A7%E9%A2%98.mp4?q-sign-algorithm=sha1&q-ak=AKID1qY9YR6ZqthIhtrb8SyLUQSGqCLFwPfL&q-sign-time=1702215791%3B1702217591&q-key-time=1702215791%3B1702217591&q-header-list=host&q-url-param-list=&q-signature=9a6b5cf7d9119a99bd0edc5af4849896be972a6d',   
    // src:'',
    src:url.value,
  }
]);
watch(url, (newValue, oldValue) => {
  if (newValue !== oldValue) {
    showVideoPlayer.value = false;
    console.log("关闭！");
    setTimeout(() => {
      console.log("启动！");
      console.log(url.value);
      console.log(sources.value);
      showVideoPlayer.value = true;
    }, 1000); // 1秒后重新渲染子组件
  }
});
// const blobUrl = ref();

// // 创建 Blob URL
// async function createBlobUrl(videoUrl) {
//   try {
//     const response = await fetch(videoUrl);//获取视频数据
//     const videoBlob = await response.blob();
//     if (videoBlob) {
//       blobUrl.value = URL.createObjectURL(videoBlob);
//       console.log(blobUrl.value);
//       sources.value = [{ type: "video/mp4", src: blobUrl.value }]; // 更新整个数组
//       open.value = true;
//     } else {
//       console.error("Failed to create Blob URL: videoBlob is undefined");
//     }

//   } catch (error) {
//     console.error("Error creating Blob URL", error); // 输出错误信息
//   }
// }

// // 撤销 Blob URL
// function revokeBlobUrl() {
//   URL.revokeObjectURL( blobUrl.value);
// }
url.value = "https://vjs.zencdn.net/v/oceans.mp4";

// // 使用 Blob URL
// onMounted(() => {
//   url.value = "http://youyu-bucket-video4paper-invisible-1319554411.cos.ap-chengdu.myqcloud.com/paper/video/22/3/%E7%AC%AC%E4%B8%80%E5%A4%A7%E9%A2%98.mp4?q-sign-algorithm=sha1&q-ak=AKID1qY9YR6ZqthIhtrb8SyLUQSGqCLFwPfL&q-sign-time=1702215791%3B1702217591&q-key-time=1702215791%3B1702217591&q-header-list=host&q-url-param-list=&q-signature=9a6b5cf7d9119a99bd0edc5af4849896be972a6d";
//   // createBlobUrl("http://youyu-bucket-video4paper-invisible-1319554411.cos.ap-chengdu.myqcloud.com/paper/video/22/3/%E7%AC%AC%E4%B8%80%E5%A4%A7%E9%A2%98.mp4?q-sign-algorithm=sha1&q-ak=AKID1qY9YR6ZqthIhtrb8SyLUQSGqCLFwPfL&q-sign-time=1702035721%3B1702037521&q-key-time=1702035721%3B1702037521&q-header-list=host&q-url-param-list=&q-signature=96697336b4479a12c7e619de76b2035e9486f7c5");
//   // createBlobUrl("https://vjs.zencdn.net/v/oceans.mp4");
//   // createBlobUrl("https://youyu-bucket-1-1319554411.cos.ap-chengdu.myqcloud.com/%E5%B1%95%E7%A4%BA%E8%A7%86%E9%A2%91.mp4");
//   // window.addEventListener('unload', revokeBlobUrl);
// });

// onUnmounted(() => {
//   // 撤销 Blob URL
//   revokeBlobUrl();
// });


</script>

<style scoped>

</style>

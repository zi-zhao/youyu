<template>
        <div class="cbutton">
          <span class="tatitle">{{ title }}</span>
          <span class="line2"></span>
        </div>
</template>

<script setup>
import { defineProps,ref } from "vue";
const props = defineProps({
  title: String,
});
const title = ref(props.title);

</script>

<style scoped>

  .cbutton{
  position: relative;
  margin-top: 34px;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  gap: 22px;
  }
  .tatitle{
    position: absolute; /* 使用绝对定位 */
      bottom: -13px; /* 将其放置在容器的底部 */
      left: 0; /* 从左侧开始 */
  color: #000; 
  text-align: center;
  font-family: Microsoft YaHei;
  font-size: 23px;
  font-style: normal;
  font-weight: 400;
  line-height: 120%; /* 24px */
  }
  .line2 {
      position: absolute; /* 使用绝对定位 */
      bottom: -19px; /* 将其放置在容器的底部 */
      left: 0; /* 从左侧开始 */
      width: 876px; /* 宽度与容器相同 */
      height: 1px; /* 横线的高度，你可以根据需要调整 */
      background: #EEE;
  }
</style>

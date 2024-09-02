<template>
  <div class="spe">
    <div
      class="tapage"
      @click="handleTapageClick"
      :class="{ active: expandedSections.taArticles }"
    >
      <span>我的文章</span>
      <span>20</span>
    </div>
    <div v-if="expandedSections.taArticles" class="list-container">
      <div
        class="tapage"
        v-for="item in articleData"
        :key="item.id"
        @click="setActive(item.id)"
        :style="{ backgroundColor: activeItem === item.id ? '#9FA9CA' : '' }"
      >
        <span>{{ item.name }}</span>
        <span>{{ item.number }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, ref } from "vue";
const props = defineProps({
  title: String,
});
const title = ref(props.title);
</script>

<style scoped>
.cbutton {
  position: relative;
  margin-top: 29px;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  gap: 22px;
}
.tatitle {
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
  background: #eee;
}
</style>

<template>
    <div class="cbutton">
         <!-- 当点击时，将 currentTitle 设置为 '我的文章' -->
         <span :class="{ active: currentTitle === '我的文章' }" class="title" @click="setCurrentTitle('我的文章')">我的文章</span>
        <!-- 当点击时，将 currentTitle 设置为 '我的分享' -->
        <span :class="{ active: currentTitle === '我的分享' }" class="title" @click="setCurrentTitle('我的分享')">我的分享</span>
        <span class="line"></span>
    </div>
</template>
    
<script setup>
    import { ref, defineEmits } from 'vue';
    
    const currentTitle = ref('我的文章');
    const emits = defineEmits(['update-to-articles', 'update-to-share']);
    const setCurrentTitle = (title) => {
        currentTitle.value = title;
        if (title === '我的分享') {
            emits('update-to-share');
        } else if (title === '我的文章') {
            emits('update-to-articles');
        }
    }
 </script>
    
    
<style scoped>
    .cbutton{
        position: relative;
        margin-top: -64px;
        display: flex;
        justify-content: center;
        align-items: flex-start;
        gap: 22px;
    }
    .title{
        color:  #9FA9CA;
        text-align: center;
        font-family: Microsoft YaHei;
        font-size: 20px;
        font-style: normal;
        font-weight: 400;
        line-height: 120%; /* 24px */
    }
    .title.active {
        color: #000; 
    }
    .line {
        position: absolute; /* 使用绝对定位 */
        bottom: -3px; /* 将其放置在容器的底部 */
        left: 0; /* 从左侧开始 */
        width: 876px; /* 宽度与容器相同 */
        height: 2px; /* 横线的高度，你可以根据需要调整 */
        background: #EEE;
    }
</style>
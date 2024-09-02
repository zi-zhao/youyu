<template>
    <div class="main">
        <div class="colum_tit">
            <img src="@/assets/PersonalPage/TaAction.svg" alt="" />
            <span class="tatext">TA的动态</span>
        </div>
        <div class="nav">
            <div class="ntext" @click="test_click(1)" :class="{ 'active': activeIndex === 1 }">全部内容</div>
            <div class="ntext" @click="test_click(2)" :class="{ 'active': activeIndex === 2 }">文章</div>
            <div class="ntext" @click="test_click(3)" :class="{ 'active': activeIndex === 3 }">分享</div>
            <span class="line"></span>
        </div>
        <component :is="test"></component>
    </div>
</template>



<script setup>
    import AllContentComponent from '../dynamic/AllContentComponent.vue';
    import ArticleComponent from "../dynamic/ArticleComponent.vue";
    import ShareComponent from '../dynamic/ShareComponent.vue';
    import { ref } from 'vue';

    let test = ref(AllContentComponent)
    let activeIndex = ref(1); // Initialize the active index with 1

    const test_click = (index) => {
        activeIndex.value = index; // Update the active index
        if(index == 1) {
            test.value = AllContentComponent
        } else if(index == 2) {
            test.value = ArticleComponent
        } else if(index == 3) {
            test.value = ShareComponent
        }
    }
</script>
    
<style scoped>
.main{
    margin: 35px auto 0 auto;
    width: 93%;
    height: auto;
}
.colum_tit{
  width: 138px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 12px;
  gap: 4px;
}
.colum_tit img{
  display: block;
}
.tatext{
    color: #000;
    text-align: center;
    font-family: Microsoft YaHei;
    font-size: 20px;
    font-style: normal;
    font-weight: 400;
    line-height: 120%; /* 24px */
}
.nav{
    position: relative;
    display: flex;
    width: 88%;
    align-items: flex-start;
    gap: 25px;
    height: 40px;
    margin: 10px auto 0px;
}

.ntext{
    color: #9FA9CA;
    text-align: center;
    font-family: Microsoft YaHei;
    font-size: 20px;
    font-style: normal;
    font-weight: 400;
    line-height: 120%; /* 24px */ 
    cursor: pointer;
}
.active {
    color: #000;
}
.line{
    position:absolute;
    bottom: 0px;
    width: 105%;
    height: 1px;
    background-color: #EEE;
}
.router-link-active {
    /* 当路由链接处于活跃状态时的样式 */
    color: #000;
}
</style>
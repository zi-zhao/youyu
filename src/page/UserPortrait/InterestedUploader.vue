<template>
    <div class="main-box">
        <div class="one">
            <div class="pic-container">
                <img src="@/assets/UserPortrait/Applaud.svg" alt="">
            </div>
            <div>
                <span class="text1">欢迎来到有渔！</span>
                <span class="text2">完善信息后，将为您提供个性的使用说明</span>
            </div>
        </div>
        <div class="middle">
            <span class="text3">选择你感兴趣的博主推荐:</span>
            <div style="display: flex; align-items: center;gap: 3px; cursor: pointer;">
                <img  src="@/assets/UserPortrait/Change.svg" alt="">
                <span class="text4">换一换</span>
            </div>
        </div>
        <div class="Uploader">
            <div v-for="(source,index) in uploaderInfo" :key="index" class="item-uploader">
                <img style="width: 36px;height: 36px;" src="@/assets/fish.png" alt="">
                <div class="uploader-info">
                    <span style="font-size: 15px; font-weight: 700;">{{ source.name }}</span>
                    <div style="display: flex;justify-content: space-between;">
                        <div style="display: flex; gap: 3px;">
                            <span class="intro">粉丝数</span>
                            <span class="intro">{{ source.fansNum }}</span>
                        </div>
                        <span class="intro">{{ source.title }}</span>
                    </div>
                </div>
                <div 
                    :class="['focus-btn', followedStatus[source.id] ? 'followed' : '']" 
                    @click="toggleFollow(source.id)"
                >
                    {{ followedStatus[source.id] ? "已关注" : "+关注" }}
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'

const uploaderInfo =ref([
    {id:1 , name:'鱼鱼', fansNum:'23万' , title:'知识领域优秀博主'},
    {id:2 , name:'梯度不爆炸', fansNum:'23万' , title:'知识领域优秀博主'},
    {id:3 , name:'化身孤岛的鲸', fansNum:'108万' , title:'音乐领域优秀博主'},
    {id:4 , name:'鱼鱼', fansNum:'23万' , title:'知识领域优秀博主'}
  ]
)

// 添加一个响应式的数据属性来跟踪关注状态
const followedStatus = ref({})

// 切换关注状态的函数
const toggleFollow = (id) => {
    followedStatus.value[id] = !followedStatus.value[id]
}
</script>

<style scoped>
.main-box{
    width: 690px;
    height: 190px;
    margin: 25px auto 0px;
    display: flex;
    flex-direction: column;
    gap: 15px;
}
.one{
    display: flex;
    align-items: center;
    gap: 10px;
}
.pic-container{
    width: 52px;
    height: 52px;
    border-radius: 50%;
    background-color: #fff;
}
.pic-container img{
    width: 52px;
    height: 52px;
}
.text1{
    text-align: center;
    font-size: 16px;
    font-weight: 700;
    line-height: 1.6;
}
.text2{
    color: #6A6A6A;
    font-size: 14px;
    line-height: 1.6; 
}
.middle{
    display: flex;
    align-items: center;
    gap: 10px;
}
.text3{
    font-size: 14px;
    font-weight: 700;
}
.text4{
    color: #706969;
    font-size: 12px;
}
.Uploader{
    display: flex;
    flex-wrap: wrap;
    gap: 10px 38px;
    margin: 5px auto 0px;
}
.item-uploader{
    width: 326px;
    display: flex;
    align-items: center;
    gap: 20px;
}
.uploader-info{
    display: flex;
    flex-direction: column;
    width: 180px;
    gap: 5px;
}
.intro{
    font-size: 12px;
}
.focus-btn{
    display: flex;
    align-items: center;
    justify-content: center;
    width: 70px;
    height: 25px;
    letter-spacing: 2px;
    border-radius: 4px;
    background: #9FA9CA;
    color: #fff;
    font-size: 14px;
    cursor: pointer;
}
.focus-btn.followed {
    background: #b5bfd0; 
}
</style>
<template>
    <div class="mydata">
        <img v-if="userAvatar" :src="userAvatar" alt="">
        <span class="name">{{ username }}</span>
    </div>
    <div class="question">
        <span @click="questionType = 0" :class="{ active: questionType === 0 }" >收到的提问</span>
        <span @click="questionType = 1" :class="{ active: questionType === 1 }" >发起的提问</span>
    </div>
    <div class="then2" v-if="questionType === 0">
        <ReceivedQuestion></ReceivedQuestion>
    </div>
    <div class="then2" v-if="questionType === 1">
        <InitiatedQuestion></InitiatedQuestion>
    </div>
</template>

<script setup>
import ReceivedQuestion from './ReceivedQuestion.vue'
import InitiatedQuestion from './InitiatedQuestion.vue'
import { onMounted , ref } from 'vue'
import { getUsersAvatarFromCOS } from '@/utils/cosService';

const userId = localStorage.getItem("userId"); // 获取用户ID
const username = localStorage.getItem("userName"); // 获取用户昵称
const userAvatar = ref(null); 
const questionType = ref(0);

// 获取用户头像
const fetchAvatar = async () => {
    try {
        const avatar = await getUsersAvatarFromCOS(userId);
        userAvatar.value = avatar;
    } catch (error) {
        console.error("Error fetching user avatar:", error);
    }
};
// 在创建组件后立即获取用户头像
onMounted(fetchAvatar);
</script>

<style scoped>
.mydata{
    width: 80%;
    padding: 0.5rem 1rem;
    height: 3.5rem;
    display: flex;
    align-items: center;
    background: #FFF;
}
.mydata img{
    width: 50px;
    height: 50px;
    border-radius: 50%;
}
.name{
    margin-left: 15px;
    font-size: 18px;
    font-weight: 700;
}
.question{
    width: 100%;
    height: 2rem;
    padding-top: 0.6rem;
    display: flex;
    justify-content: space-evenly;
    background: linear-gradient(180deg, #FFF 0%, rgba(248 248 248) 38.02%);
}
.question span{
    display: inline-block;
    height: 20px;
    padding-bottom: 8px;
    color: #000;
    font-size: 16px;
    line-height: 1.6; 
    cursor: pointer;
}
.active{
    font-weight: 700;
    border-bottom: 1px solid #000;
}
.then2{
    width: 100%;
    /* height: 67vh; */
    height: calc(100vh - 2.5rem - 2rem - 2px - 3.5rem - 2rem - 2.2rem);
    margin: 0px auto;
    background-color:  #F8F8F8;
}
/* 对手机屏幕和小尺寸屏幕的样式调整 */
@media (max-width: 768px) {
    .mydata{
        width: 90%;
        height: 2rem;
    }
    .mydata img{
        width: 2rem;
        height: 2rem;
    }
    .name{
        font-size: 1rem;
        margin-left: 0.6rem;
    }
    .then2{
        height: calc(100vh - 2.5rem - 2rem - 2px - 2rem - 2rem - 2rem);
    }
}
</style>
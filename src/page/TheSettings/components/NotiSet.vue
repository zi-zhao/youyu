<template>
  <div class="T_M" style="display: flex;flex-direction: column;">
    <TitleSection :message=msg :show-btn=false />
    <div class="page2">
      <div class="text-line">
        <div class="text-top" >互动通知</div>
        <span class="row1">消息</span>
        <span >邮件</span>
      </div>

      <div class="item_box">
        <div v-for="(notification,index) in interactionNotifications" :key="index" class="item-container">
          <div class="item-title">{{ notification.title }}</div>
          <img src="@/assets/CircleQuestionmark.svg">
          <el-switch v-model="notification.switch1" inline-prompt active-text="on" inactive-text="off" class="item-switch"/>
          <el-switch v-model="notification.switch2" inline-prompt active-text="on" inactive-text="off" class="item-switch"/>
        </div>
      </div>

      <div class="text-line"><span class="text-top">系统通知</span></div>
      <div class="item_box">
        <div v-for="(notification,index) in systemNotifications" :key="index" class="item-container">
          <div class="item-title">{{ notification.title }}</div>
          <img src="@/assets/CircleQuestionmark.svg">
          <el-switch v-model="notification.switch1" inline-prompt active-text="on" inactive-text="off" class="item-switch"/>
          <el-switch v-model="notification.switch2" inline-prompt active-text="on" inactive-text="off" class="item-switch"/>
        </div>
      </div>

      <div class="text-line"><span class="text-top">私信通知</span></div>
      <div class="item_box">
        <div v-for="(notification,index) in privateNotifications" :key="index" class="item-container">
          <div class="item-title">{{ notification.title }}</div>
          <img src="@/assets/CircleQuestionmark.svg">
          <el-switch v-model="notification.switch1" inline-prompt active-text="on" inactive-text="off" class="item-switch"/>
          <el-switch v-model="notification.switch2" inline-prompt active-text="on" inactive-text="off" class="item-switch"/>
        </div>
      </div>

      <div class="text-line"><span class="text-top">推荐内容</span></div>
      <div class="item_box">
        <div v-for="(notification,index) in recommendedContent" :key="index" class="item-container">
          <div class="item-title">{{ notification.title }}</div>
          <img src="@/assets/CircleQuestionmark.svg">
          <el-switch v-model="notification.switch1" inline-prompt active-text="on" inactive-text="off" class="item-switch"/>
          <el-switch v-model="notification.switch2" inline-prompt active-text="on" inactive-text="off" class="item-switch"/>
        </div>
      </div>
      <div style="display:flex;margin: 2rem 0 1rem;">
        <YyButton theme="purple" @click="putUserPreference">保存</YyButton>
      </div>
    </div>
  </div>
</template>

<script setup>

import TitleSection from "@/page/TheSettings/components/TitleSection.vue";
import {ref,onMounted} from 'vue'
import { ElMessage } from 'element-plus';
import axios from '@/utils/request';
import YyButton from "@/page/components/YyButton.vue";


const msg = '通知设置'
const msgbtn = '保存'
const interactionNotifications = ref([
  {title: '新增关注', switch1: false, switch2: false},
  {title: '点赞和收藏', switch1: false, switch2: false},
  {title: '被@', switch1: false, switch2: false},
  {title: '评论回复', switch1: false, switch2: false},
  {title: '打赏', switch1: false, switch2: false},
  {title: '文章购买', switch1: false, switch2: false}
]);

const systemNotifications = ref([
  { title: '网站通知', switch1: false, switch2: false },
  { title: '审核通知', switch1: false, switch2: false },
  { title: '举报通知', switch1: false, switch2: false }
]);

const privateNotifications = ref([
  { title: '聊天消息', switch1: false, switch2: false }
]);

const recommendedContent = ref([
  { title: '文章推送', switch1: false, switch2: false },
  { title: '其他消息', switch1: false, switch2: false }
]);

const userData = ref();
const userId = ref()

//这个函数的作用不用深究，是因为这里从后端拿到的数据有一些别致，需要处理一下
function getLastTwoBits(num) {
  return num.toString(2).slice(-2);
}

//这里使用映射和循环来简化整个赋值过程。下列是数据模型：
const userPreferenceMap = {
  beSubscribe: interactionNotifications.value[0],
  beLike: interactionNotifications.value[1],
  beAt:interactionNotifications.value[2],
  beComment:interactionNotifications.value[3],
  beGift:interactionNotifications.value[4],
  articlePurchase:interactionNotifications.value[5],
  webNotice:systemNotifications.value[0],
  auditNotice:systemNotifications.value[1],
  reportNotice:systemNotifications.value[2],
  chatMessage:privateNotifications.value[0],
  articlePush:recommendedContent.value[0],
  other:recommendedContent.value[1],
};

//这里的数据格式是修改接口中传入的数据类型，只是个架子所以是空值
const userPreferenceData = {
  beSubscribe:'',
  beLike: '',
  beAt:'',
  beComment:'',
  beGift:'',
  articlePurchase:'',
  webNotice:'',
  auditNotice:'',
  reportNotice:'',
  chatMessage:'',
  articlePush:'',
  other:'',
}

//这里是赋值的具体实现过程，其实数据模型中已经将接口中取得的数据与页面中呈现的数据进行了易懂的绑定，所以赋值过程理解起来不难
function getNotificationPreferences(data) {
  Object.keys(userPreferenceMap).forEach(key => {
    if (data[key] !== undefined) {
      userPreferenceMap[key].switch1 = juagePreference(0, data[key]);
      userPreferenceMap[key].switch2 = juagePreference(1, data[key]);
    }
  });
}
//这里其实可以稍微简化一下，但是阅读性会大大降低，不利于后续维护，所以我用了最原始的判断
const juagePreference = (type, str) => {
  if (str === '11') return true;
  if (str === '10' && type === 0) return true;
  if (str === '10' && type === 1) return false;
  if (str === '1' && type === 0) return false;
  if (str === '1' && type === 1) return true;
}
//获取用户信息列表
async function getUserPreference() {
  try{
    const response = await axios.get(`/notice/preference/${userId.value}`);
    if(response.data.code === 1){
      userData.value = response.data.data;
    // 遍历 userData.value 中的每个属性，并处理它们，这里其实不需要把userId进行转化，但考虑到我们并不需要userData里的userId(因为从localStorage中取过了)，为了不影响代码一致性就把这里的userId也一并转化了
    Object.keys(userData.value).forEach(key => {
      userData.value[key] = getLastTwoBits(userData.value[key]);
    });
    getNotificationPreferences(userData.value);
    }else if(response.data.code === 0 && response.data.msg){
        ElMessage.error(response.data.msg.toString());
    }else{
        console.error("获取用户数据失败");
        ElMessage.error('获取用户数据失败');
    }
  } catch (error) {
    console.error("获取用户数据失败", error); 
    ElMessage.error('获取用户数据失败');
  }
}

//这里是遍历之前的map，取每一个对象的switch值放入新构建的判断函数中，其实就是一个遍历
function setNotificationPreferences(data) {
  Object.keys(userPreferenceMap).forEach(key => {
    const beSubscribeSwitch1 =  userPreferenceMap[key].switch1;
    const beSubscribeSwitch2 = userPreferenceMap[key].switch2;
    data[key] = setPreference(beSubscribeSwitch1,beSubscribeSwitch2);
  });
}

//一个判断函数，这里的3其实是11,2是10,1是01 （当然，是二进制）
const setPreference = (switch1, switch2) => {
  if (switch1 === true && switch2 === true) return 3;
  if (switch1 === true && switch2 === false) return 2;
  if (switch1 === false && switch2 === true) return 1;
  else return 0;
}

//修改用户信息
async function putUserPreference() {
  setNotificationPreferences(userPreferenceData);
  try {
    const response = await axios.put('/notice/preference',userPreferenceData);
    if(response.data.code === 1){
        console.log(response.data.msg); 
        ElMessage.success("修改个人信息成功");
    }else if(response.data.code === 0 && response.data.msg){
        ElMessage.error(response.data.msg.toString());
    }else{
        console.error("修改个人信息失败");
        ElMessage.error("修改个人信息失败");
    }
  } catch (error) {
    console.error("修改个人信息失败", error); 
    ElMessage.error("修改个人信息失败");
  }
}




onMounted(() => {
  userId.value = localStorage.getItem("userId"); // 获取用户ID
  getUserPreference();
})

</script>
<style scoped>
.page2 {
  padding-bottom: 30px;
  overflow: auto;
}
.item_box{
  padding: 0px 30px;
}
.item-container{
  display: flex;
  align-items: center;
  margin: 0.5rem 0;
  position: relative;
}

.item-title{
  padding-left: 3rem;
  flex: 75%;
}

.item-switch{
  flex: 35%;
}

img{
  position: absolute;
  left: 180px;
  width: 15px;
  height: 15px;
}

img:hover{
  cursor: pointer;
}

.text-line {
  padding: 10px 78px;
  background-color: #F4F4F4;
  display: flex;
  align-items: center;
  box-shadow: 0px 0px 4px 0px rgba(0, 0, 0, 0.25);
}
.text-top{
  margin-right: 47%;
}
.text-box {
  display: flex;
  background-color: #F4F4F4;
  align-items: center;
  width: 100%;
  padding: 0.7rem 5rem;
  box-shadow: 0px 0px 4px 0px rgba(0, 0, 0, 0.25);
}

.row1 {
  margin-right: 22%;
}
/* 调整滚动条宽度和颜色 */
::-webkit-scrollbar {
    width: 6px; /* 增加纵向滚动条的宽度 */
    height: 8px; /* 增加横向滚动条的高度 */
    background: transparent;
}

/* 定义滚动条轨道，设置为透明 */
::-webkit-scrollbar-track {
    box-shadow: inset 0 0 8px rgba(0, 0, 0, 0); /* 内阴影 */
    background: transparent; /* 将轨道背景设置为透明 */
}

/* 定义滑块，设置为浅灰色并增加内阴影 */
::-webkit-scrollbar-thumb {
    box-shadow: inset 0 0 8px rgba(115, 115, 115, 0.3); /* 添加淡灰色内阴影 */
    background-color: #dbdbdb; /* 滑块的颜色改为浅灰色 */
    border-radius: 10px; /* 保持圆角不变 */
}
/* 当鼠标悬停在滚动条滑块上时改变滑块的颜色 */
::-webkit-scrollbar-thumb:hover {
    background: #c6c6c6;
}

</style>
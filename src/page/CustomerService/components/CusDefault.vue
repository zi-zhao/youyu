<template>
  <TheHeader/>
  <div class="container">
    <div class="page">
      <div class="ask">
        <span class="title">猜你想问</span>
        <div class="menu">
          <el-tabs v-model="activeTab" @click="handleTabChange">
            <el-tab-pane label="热门问题" name="hot"></el-tab-pane>
            <!-- <el-tab-pane label="订单问题" name="orders"></el-tab-pane>
            <el-tab-pane label="服务保障" name="service"></el-tab-pane> -->
          </el-tabs>
          <div @click="change" class="more">更多问题 ></div>
        </div>
        <div>
          <div class="ask-content" v-for="(ques,index) in quesHot" :key="index" style="padding: 5px;margin: 5px 0;">
            <div style="display: flex; gap: 10px; align-items: center; color:#676767 " @click="change">
              <el-icon><Search /></el-icon>
              <span>{{ ques.problem }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- <div class="online">
        <span class="title">在线客服</span>
        <div class="online-text">
          <el-icon><ChatLineRound /></el-icon>
          <span>当前排队人数较多，请您优先选择自主问答</span>
        </div>
        <div @click="showPerHelp" class="per-text">使用人工客服 ></div>
      </div> -->

      <div class="question">
        <span class="title">问题反馈</span>
        <div style="display: flex;flex-direction: column;margin-bottom: 1rem;">
          <span>留言反馈：</span>
          <div class="input-box">
            <el-input
                v-model="textarea"
                maxlength="200"
                placeholder="点击输入您的反馈"
                show-word-limit
                type="textarea"
                size="large"
                resize="none"
                :autosize = "{ minRows: 2, maxRows: 30 }"
                class="eidt-input"
                style="margin: 20px 0 0px;"
            />
            <div class="submit-btn" @click="postFeedback">提交</div>
          </div>
        </div>
        <div style="display: flex;flex-direction: column;gap: 1rem;margin-top: 2rem;">
          <span>联系邮箱：<span style="color:#606FA0 ">{{ feedbackInformation.mail }}</span></span>
          <p>客服热线：{{ feedbackInformation.phone }}</p>
          <p>热线受理事件：每日{{ feedbackInformation.startTime }}-{{ feedbackInformation.endTime }}</p>
        </div>
      </div>
    </div>
  </div>

</template>

<script setup>
import TheHeader from "@/page/components/TheHeader.vue";
import {ref, defineExpose, defineEmits,onMounted} from 'vue';
import { ElMessage } from 'element-plus';
import axios from '@/utils/request';

const activeTab = ref('hot')
const emit = defineEmits((['change']))
const quesHot = ref();
const quesOrders = ref(['实名信息问题说明11', '充值问题'])
const quesServe = ref(['实名信息问题说明22', '充值问题'])
const textarea = ref('')
const feedbackInformation = ref();

const currentList = ref(quesHot.value);

// activeTab.value 属性对应的是name属性，而不是label
const handleTabChange = () => {
  if (activeTab.value === 'hot') {
    currentList.value = quesHot.value
  } else if (activeTab.value === 'orders') {
    currentList.value = quesOrders.value
  } else if (activeTab.value === 'service') {
    currentList.value = quesServe.value
  }
}

const change = () => {
  emit('change',true)
}

defineExpose({

})


//获取热门问题
async function getQuestions(){
  try {
    const response = await axios.get('/explain/hot');
    if(response.data.code === 1){
      quesHot.value = response.data.data;
      console.log(response.data); 
    }else if(response.data.code === 0 && response.data.msg){
        ElMessage.error(response.data.msg.toString());
    }else{
      console.error("获取热门问题失败");
      ElMessage.error("获取热门问题失败");
    }
  } catch (error) {
    console.error("请求热门问题失败", error); 
    ElMessage.error("请求热门问题失败");
  }
}

//提交用户反馈接口
async function postFeedback(){
  try {
    const response = await axios.post('/feedback',{
      content:textarea.value,
      type:0,
    });
    if(response.data.code === 1){
      ElMessage.success('反馈成功');
      textarea.value = '';
    }else if(response.data.code === 0 && response.data.msg){
        ElMessage.error(response.data.msg.toString());
    }else{
      console.error("提交用户反馈失败");
      ElMessage.error("提交用户反馈失败");
    }
  } catch (error) {
    console.error("提交用户反馈失败", error); 
    ElMessage.error("提交用户反馈失败");
  }
}

//获取客服信息
async function getFeedbackInformation(){
  try {
    const response = await axios.get('/feedback/information');
    if(response.data.code === 1){
      feedbackInformation.value = response.data.data;
    }else if(response.data.code === 0 && response.data.msg){
        ElMessage.error(response.data.msg.toString());
    }else{
      console.error("获取客服信息失败");
      ElMessage.error("获取客服信息失败");
    }
  } catch (error) {
    console.error("获取客服信息失败", error); 
    ElMessage.error("获取客服信息失败");
  }
}

onMounted(() => {
  getQuestions();
  getFeedbackInformation();
})


</script>

<style scoped>
.container {
  padding-top: 5rem;
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #FAFAFA;
  padding-bottom: 6rem;
}

.page {
  width: 70%;
  display: flex;
  flex-direction: column;
  gap: 40px;
}

.title {
  display: block;
  color: #8290C0;
  font-size: 32px;
  font-weight: 600;
  padding-bottom: 5px;
  border-bottom: #606FA0 1px solid;
  margin-bottom: 1.5rem;
}
.input-box{
  display: flex;
  align-items: flex-end;
  justify-content: space-around;
  margin-bottom: 30px;
}
.menu {
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.menu:hover{
  cursor: pointer;
}
.submit-btn{
  padding: 3px 10px;
  border-radius: 15px;
  font-size: 14px;
  background-color: #b3b8d3;
  cursor: pointer;
}
::v-deep .el-tabs--bottom .el-tabs__item.is-bottom{
  color: #000;
}
::v-deep .el-tabs__item:hover,
::v-deep .el-tabs__item.is-active{
  color: #8290c0;
}
::v-deep .el-tabs__active-bar{
  background-color: #8290c0;
}
.more {
  padding-bottom: 20px;
}

.online-text{
  display: flex;
  gap: 0.4rem;
  align-items: center;
  color: #F0A81C;
  height: 30px;
  background-color: #fff;
  padding: 5px 15px ;
  margin: 5px 0px;
}

.per-text{
  margin-top: 20px;
}

.per-text,.ask-content :hover{
  cursor: pointer;
}

::v-deep .el-tabs__nav-wrap::after {
  position: static !important;
}
.el-textarea{
  width: 85%;
}
::v-deep .question .el-textarea__inner{
  height: 120px !important;
}
@media (max-width: 768px) {
  .input-box{
    flex-direction: column;
    gap: 10px;
  }
}
</style>
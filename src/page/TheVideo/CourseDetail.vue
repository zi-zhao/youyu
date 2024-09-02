<template>
    <TheHeader></TheHeader>
    <div class="large-box">
        <!-- 左侧课程标题+视频播放+课程详情 -->
        <div class="left">
            <!-- 课程标题+时间+购买人数 -->
            <div class="left-top">
                <span class="title">{{ courseData.title }}</span>
                <div style="display:flex;align-items:center;justify-content: space-between;">
                    <span class="time">
                        {{ courseData.createTime }}
                    </span>
                    <span class="purperson-num">
                        {{ courseData.saleCount }}人购买
                    </span>
                    <span class="purperson-num" v-if="videoPayState === 0"  style="cursor: pointer;" @click="dialogPayVisible = true">
                        点击购买
                    </span>
                </div>
            </div>
            <!-- 选择支付方式弹框 -->
            <el-dialog v-model="dialogPayVisible" :title="'购买' + courseData.title" >
                <div style="display: flex;flex-direction: column;align-items: center;justify-content: center;gap: 3rem;margin-top: 2rem;">
                    <div style="font-size: 18px;line-height: 1.6;font-weight: 700;">请选择支付方式</div>
                    <div style="display: flex;gap: 20px;">
                        <YyButton theme="purple" style="padding: 6px 15px;" @click="goToInputCode">输入兑换码</YyButton>
                        <YyButton theme="gray" style="padding: 6px 15px;" @click="goToWeiChatPay">微信支付</YyButton>
                    </div>
                </div>
            </el-dialog>
            <!-- 输入兑换码弹框 -->
            <el-dialog v-model="dialogInputCodeVisible" :title="'购买' + courseData.title" >
                <div class="content" style="flex-direction: column;align-items: center;position: relative;">
                    <div style="font-size: 18px;font-weight: 700;">输入兑换码</div>
                    <el-input v-model="courseCode" placeholder="请输入课程兑换码" style="width: 60%;"></el-input>
                    <YyButton theme="purple" @click="getPaperVideoPurchaseByCdkey" class="youyu-btn">确定</YyButton>
                </div>
                <div style="display:flex;align-items:center;justify-content: center;position: absolute;bottom: 10px;left: calc((100% - 253px) / 2);">
                    <div class="read-text">请注意：输入兑换码代表您已阅读并同意</div>
                    <span class="agreement" @click="goToCurrencyAgreement">《{{ agreementName }}》</span>
                </div>
            </el-dialog>
            <!-- 微信支付弹框 -->
            <el-dialog v-model="dialogWeiChatVisible" :title="'购买' + courseData.title" class="weichat-dialog" style="height: 52vh;">
                <div class="content">
                    <!-- 支付二维码 -->
                    <div class="QRcode">
                        <vue3-qrcode :value="codeUrl"></vue3-qrcode>
                    </div>
                    <div class="pay-info">
                        <div class="pay">支付￥{{  courseData.price }}</div>
                        <div class="pay-icon">
                            <img src="@/assets/TheVideo/WeiChat.png" alt="">
                             <!-- <img src="@/assets/TheVideo/AliPay.jpg" alt=""> -->
                        </div>
                        <div class="read-text">（暂时只支持微信支付）</div>
                    </div>
                </div>
                <!-- 扫码后显示订单已创建 -->
                <div class="notification-box">
                    <div class="checkmark-circle">
                        <!-- <div class="checkmark"></div> -->
                        <el-icon style="width: 1.5rem;height: 1.5rem;"><Select/></el-icon>
                    </div>
                    <div class="notification-text">
                        您已创建订单，请在手机上完成支付，在此过程中请勿关闭此弹框！
                        <div class="tips">（若支付失败或有其他问题，可加QQ群1234567890联系管理员处理）</div>
                    </div>
                </div>
                <div style="display:flex;align-items:center;justify-content: center;position: absolute;bottom: 10px;left: calc((100% - 243px) / 2);">
                    <!-- <el-checkbox v-model="checked1" label="我已阅读并同意" size="large"></el-checkbox> -->
                    <div class="read-text">请注意：扫码支付代表您已阅读并同意</div>
                    <span class="agreement" @click="goToCurrencyAgreement">《{{ agreementName }}》</span>
                </div>
            </el-dialog>
            <!-- 视频 -->
            <div class="left-middle" >
                <VideoPlay v-if="showVideoPlayer"  :sources="sources" :isLive="isLive" :poster="poster" :autoplay="autoplay"></VideoPlay>
            </div>
            <div class="left-bottom-pc">
                <span style="font-weight:700;">课程详情</span>
                <div class="intro">
                    {{ courseData.description }}
                </div>
            </div>
        </div>
        <!-- 右侧列表 -->
        <div class="right">
            <div class="right-top">
                <div class="multi-line-ellipsis-1" style="width:80%;">{{ courseData.title }}</div>
                <!-- <div style="font-size:0.8rem;color: #6D6D6D;line-height: 1.6;">({{courseData}}/{{ courseData. }})</div> -->
            </div>
            <div class="list">
                <div v-for="video in videoList" :key="video.id" class="item" @click="handleVideoClick(video.id)"  :class="{ 'selected': video.id ===  selectedVideo}" >
                    <div class="item-name">{{ video.title }}</div>
                    <div class="duration">{{ video.duration }}</div>
                </div>
            </div>
        </div>
        <div class="left-bottom-phone">
            <span style="font-weight:700;">课程详情</span>
            <div class="intro">
                {{ courseData.description }}
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref,onMounted,computed,watch,onUnmounted} from 'vue'
import { PageTitle } from '@/utils/fileService.js'
import TheHeader from '@/page/components/TheHeader.vue'
import VideoPlay from '@/page/components/VideoPlay.vue';
import { useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';
import axios from '@/utils/request';
import {getVideoPaperFromCOS} from '@/utils/cosService';
import Vue3Qrcode from 'vue3-qrcode';
import YyButton from "@/page/components/YyButton.vue";
import { useRouter } from 'vue-router';
import { openUrl } from '@/utils/routeJudge'

const router = useRouter()

const codeUrl = ref();
const route = useRoute ();
const courseId = parseInt(route.params.id,10);//路径中的ID
const setPageTitle = PageTitle('正在加载...');
const selectedVideo = ref()//用户所选视频的id
const agreementName = ref('有渔货币协议')//支付弹框中必须阅读的协议
const videoList = ref([]);
const courseData = ref({});
const videoUrl = ref();
const showVideoPlayer = ref(true);
const dialogPayVisible = ref(false);//选择支付方式弹框
const dialogInputCodeVisible = ref(false)//输入兑换码弹框
const dialogWeiChatVisible = ref(false )//微信支付弹框
const courseCode = ref('')//用户输入的兑换码
const videoPayState = ref()//获取用户购买整套视频的状态
const orderId = ref();
const intervalId = ref(null);// 定义定时器 ID

//视频组件传值
const isLive = ref(false);
const poster = ref();
const autoplay = ref(false);
const sources = computed(() => [
  {  
    type: "video/mp4",
    src: videoUrl.value,
  }
]);

watch(videoUrl, (newValue, oldValue) => {
  if (newValue !== oldValue) {
    showVideoPlayer.value = false;
    setTimeout(() => {
      showVideoPlayer.value = true;
    }, 400); // 1秒后重新渲染子组件
  }
});

//处理毫秒数的函数
const formatDuration = (milliseconds) => {
  let seconds = Math.floor(milliseconds / 1000);
  let minutes = Math.floor(seconds / 60);
  let hours = Math.floor(minutes / 60);
  seconds = seconds % 60;
  minutes = minutes % 60;
  const paddedHours = hours.toString().padStart(2, '0');
  const paddedMinutes = minutes.toString().padStart(2, '0');
  const paddedSeconds = seconds.toString().padStart(2, '0');
  return `${paddedHours}:${paddedMinutes}:${paddedSeconds}`;
};

// 点击打开输入兑换码弹框
const goToInputCode = () =>{
    dialogInputCodeVisible.value = true;
    dialogPayVisible.value = false;
}

// 点击打开微信支付弹框
const goToWeiChatPay = () =>{
    dialogWeiChatVisible.value = true;
    dialogPayVisible.value = false;
    getPaperVideoCodeUrl();
}

// 跳转至货币协议
const goToCurrencyAgreement = () =>{
    // const routeLocation = router.resolve({ path: `/CurrencyAgreement` });
    // window.open(routeLocation.href, '_blank');
    openUrl(`/CurrencyAgreement`)
}

//点击选择视频
async function handleVideoClick(videoid){
    const status = await getPaperVideoClipPurchaseState(videoid);
    selectedVideo.value = videoid;
    if(status != 0){
        videoUrl.value = await getVideoPaperFromCOS(videoid);
    }else{
        dialogPayVisible.value = true;
    }
}

//生成视频订单接口
async function getPaperVideoCodeUrl() {
  try {
    const queryParams = new URLSearchParams({
        videoId: Number(courseId),
    }).toString();
    const response = await axios.post(`/wechat/paper?${queryParams}`);
    if(response.data.code === 1){
        codeUrl.value = response.data.data.codeUrl;
        orderId.value = response.data.data.orderId;
        intervalId.value = setInterval(getWechatPaperVideoPurchaseState, 2500);
        setTimeout(() => {
            if (intervalId.value) {
            clearInterval(intervalId.value);
            intervalId.value = null;
            }
        }, 600000); 
    }else if(response.data.code === 0 && response.data.msg){
        ElMessage.error(response.data.msg.toString());
    }else{
        console.error("生成视频订单失败");
        ElMessage.error("生成视频订单失败");
    }
  } catch (error) {
    console.error("生成视频订单失败", error); 
    ElMessage.error("生成视频订单失败");
  }
}

//查询视频订单状态状态接口
async function getWechatPaperVideoPurchaseState() {
  try {
    if (!dialogWeiChatVisible.value) {
        clearInterval(intervalId.value);
        return; // 退出函数
    }
    const response = await axios.get(`/wechat/paper/${orderId.value}`);
    if(response.data.code === 1){
        if(response.data.data === 1){
            ElMessage.success("购买视频成功");
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        }
    }else if(response.data.code === 0 && response.data.msg){
        ElMessage.error(response.data.msg.toString());
    }else{
        console.error("购买视频失败");
        ElMessage.error("购买视频失败");
    }
  } catch (error) {
    console.error("购买视频失败", error); 
    ElMessage.error("购买视频失败");
  }
}


//用户用兑换码购买视频接口
async function getPaperVideoPurchaseByCdkey() {
  try {
    const response = await axios.get(`/paper/video/purchase/by/cdkey`, {
        params: {
            key:courseCode.value,
            id:courseId,
        }
    });
    if(response.data.code === 1){
        ElMessage.success("兑换视频成功");
        setTimeout(() => {
            window.location.reload();
        }, 1000);
    }else if(response.data.code === 0 && response.data.msg){
        ElMessage.error(response.data.msg.toString());
    }else{
        console.error("兑换视频失败");
        ElMessage.error("兑换视频失败");
    }
  } catch (error) {
    console.error("兑换视频失败", error); 
    ElMessage.error("兑换视频失败");
  }
}


//获取用户购买视频的状态接口
async function getPaperVideoPurchaseState(courseId) {
  try {
    const response = await axios.get(`/paper/video/purchase/state/${courseId}`);
    if(response.data.code === 1){
        videoPayState.value = response.data.data;
    }else if(response.data.code === 0 && response.data.msg){
        ElMessage.error(response.data.msg.toString());
    }else{
        console.error("查询视频订单状态失败");
        ElMessage.error("查询视频订单状态失败");
    }
  } catch (error) {
    console.error("查询视频订单状态失败", error); 
    ElMessage.error("查询视频订单状态失败");
  }
}

//获取用户购买视频切片的状态接口
async function getPaperVideoClipPurchaseState(id) {
  try {
    const response = await axios.get(`/paper/video/clip/purchase/state/${id}`);
    if(response.data.code === 1){
        return (response.data.data);
    }else if(response.data.code === 0 && response.data.msg){
        ElMessage.error(response.data.msg.toString());
    }else{
        console.error("获取购买状态失败");
        ElMessage.error("获取购买状态失败");
    }
  } catch (error) {
    console.error("获取购买状态失败", error); 
    ElMessage.error("获取购买状态失败");
  }
}


//根据id获取视频信息接口
async function getPaperVideoOptions() {
  try {
    const response = await axios.get(`/paper/video/${courseId}`);
    if(response.data.code === 1){
        courseData.value = response.data.data;
        setPageTitle(`${courseData.value.title}视频 - 云联知渔`);
        poster.value = courseData.value.coverPicture;
        courseData.value.price =  courseData.value.price/100;
    }else if(response.data.code === 0 && response.data.msg){
        ElMessage.error(response.data.msg.toString());
    }else{
        console.error("获取视频信息数据失败");
        ElMessage.error("获取视频信息数据失败");
    }
  } catch (error) {
    console.error("获取视频信息数据失败", error); 
    ElMessage.error("获取视频信息数据失败");
  }
}

//获取视频对应的切片数据接口
async function getPaperVideoClipOptions() {
  try {
    const response = await axios.get(`/paper/video/clip/list`,{
        params: {
            id:courseId,
            page:1,
            pageSize:100,
        }
      });
    if(response.data.code === 1){
        videoList.value = response.data.data.records;
        for(let record of  videoList.value){
            record.duration = formatDuration( record.duration );
        }
        videoUrl.value = await getVideoPaperFromCOS(response.data.data.records[0].id);
    }else if(response.data.code === 0 && response.data.msg){
        ElMessage.error(response.data.msg.toString());
    }else{
        console.error("获取学科对应的视频数据失败");
        ElMessage.error("获取学科对应的视频数据失败");
    }
  } catch (error) {
    console.error("获取学科对应的视频数据失败", error); 
    ElMessage.error("获取学科对应的视频数据失败");
  }
}

onMounted(() => {
    getPaperVideoPurchaseState(courseId);
    getPaperVideoOptions();
    getPaperVideoClipOptions();
});

onUnmounted(() => {
  // 组件卸载时清除定时器
  if (intervalId.value) {
    clearInterval(intervalId.value);
  }
});

</script>

<style>
body{
    background: #F8F8F8;
}
</style>
<style scoped>
.large-box{
    width: 1200px;
    margin: 3.5rem auto 3rem;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
}
.left{
    width: 72%;
    display: flex;
    flex-direction: column;
    gap: 1.2rem;
}
.left-top{
    width: 95%;
    margin: 0 auto;
}
.title{
    font-weight: 700;
    display: inline-block;
    margin-bottom: 0.6rem;
    font-size: 1.5rem;
}
.time{
    font-size: 0.8rem;
    color: #706969;
}
.purperson-num{
    font-size: 0.8rem;
    color: #00A6DA;
    margin-left: 2rem;
}
.content{
    gap: 2rem;
    display: flex;
    justify-content: center;
    margin-top: 1rem;
}
.youyu-btn{
    font-size:0.8rem;
    padding: 6px 15px;
    position: absolute;
    right: 0;
    bottom: 0;
}
.QRcode{
    width: 12rem;
    height: 12rem;
    background-color: #f7e9e9;
}
.QRcode img{
    width: 12rem;
    height: 12rem;
}
.pay-info{
    display: flex;
    flex-direction: column;
    justify-content: space-evenly;
}
.pay{
    font-size: 1.2rem;
    font-weight: 700;
}
.read-text{
    font-size: 0.6rem;
}
.pay-icon img{
    width: 2.8rem;
    height: 2rem;
    cursor: pointer;
}
.agreement{
    font-size: 0.6rem;
    padding: 0 0.1rem;
    color: #00A6DA;
    border-bottom: 1px solid #00A6DA;
    cursor: pointer;
}
.left-middle{
    width: 95%;
    margin: 0 auto;
    height: 70vh;
}
.left-bottom-pc{
    width: 100%;
}
.left-bottom-phone{
    display: none;
}
.intro{
    margin-top: 0.5rem;
    padding: 0 0.5rem;
    line-height: 1.6;
    color: #706969;
}
.right{
    width: 25%;
    background: #F2F2F2;
    padding: 1rem 0rem;
}
.right-top{
    width: 90%;
    height: calc(5% - 0.8rem);
    line-height: 1.6;
    padding-bottom: 0.8rem;
    margin: 0 5% 0;
    border-bottom: 1px solid #DADADA;
    display: flex;
    justify-content: space-between;
}
.list{
    max-height: 90vh;
    width: 80%;
    padding: 1rem 10%;
    overflow-y: auto;
}
.item{
    width: 100%;
    padding: 0.7rem 0rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
}
.duration{
    font-size:0.8rem;
    color:#6D6D6D;
}
.item:hover,
.item:hover .duration,
.item.selected,
.item.selected .duration{
    color: #00A6DA;
    cursor: pointer;
}
:deep .el-dialog{
    width: 50%;
    height: 40vh;
    margin-top: 20vh;
}
:deep(.weichat-dialog .el-dialog__body) {
    padding: 0 ;
}
/* 订单创建 */
.notification-box {
    display: flex;
    align-items: center;
    background-color: #f9f9f9;
    border: 1px solid #e7e7e7;
    border-radius: 4px;
    padding: 10px;
    width: 80%;
    margin: 10px auto;
}

.checkmark-circle {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background-color: #4CAF50;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 15px;
}
.notification-text {
  color: #333;
  font-size: 16px;
  line-height: 1.6;
}
.tips{
    font-size: 0.8rem;
    line-height: 1.6;
}
:deep .checkmark-circle .el-icon svg {
    height: 1.5rem;
    width: 1.5em;
}
:deep .checkmark-circle .el-icon svg {
    color: #fff;
}
@media (max-width:768px){
    .large-box{
        width: 100%;
        flex-direction: column;
    }
    .left{
        width: 100%;
    }
    .right{
        width: 100%;
        margin: 1rem 0;
    }
    .left-middle{
        height: 35vh;
    }
    .left-bottom-pc{
        display: none;
    }
    .left-bottom-phone{
        display: initial;
        width: 96%;
        padding: 0 2%;
    }
    .intro{
        padding: 0 1rem;
    }
    .list{
        max-height: 12vh;
        width: 96%;
        display: flex;
        gap: 2rem;
        padding: 0.5rem 2%;
    }
    .item{
        flex-direction: column;
        align-items: flex-start;
        padding: 0.3rem 0rem;
        gap: 0.3rem;
    }
    .item-name{
        width: 5rem;
    }
    .content{
        margin-top: 2rem;
        gap: 1rem;
    }
    .QRcode{
        width: 8rem;
        height: 8rem;
    }
    .QRcode img{
        width: 8rem;
        height: 8rem;
    }
    .pay{
        font-size: 1rem;
    }
    :deep .el-dialog{
        width: 100%;
        height: 40vh;
        margin-top: 25vh;
    }
    .youyu-btn{
        right: -6px;
    }
    
    .notification-box {
        width: 90%;
    }
    .notification-text{
        font-size: 0.8rem;
    }
    .tips{
        font-size: 0.6rem;
    }
}
</style>
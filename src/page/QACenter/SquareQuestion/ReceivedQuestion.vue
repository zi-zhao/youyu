<template>
    <!-- 已完成，进行中，未回答 筛选 -->
    <div class="select">
        <div style="display: flex; gap: 20px;">
            <div @click="typeNumber = 0" :class="{ selected: typeNumber === 0 }" class="select_btn">
                <span>已完成</span>
                <span>{{ countData[2] }}</span>
            </div>
            <div @click="typeNumber = 1" :class="{ selected: typeNumber === 1 }" class="select_btn">
                <span>进行中</span>
                <span>{{ countData[1] }}</span>
            </div>
            <div @click="typeNumber = 2" :class="{ selected: typeNumber === 2 }" class="select_btn">
                <span>未回答</span>
                <span>{{ countData[0] }}</span>
            </div>
        </div>
        <!-- <div>
            <span style="font-size: 16px; font-weight: 700;">接受咨询</span>
             <el-switch
                v-model="value1"
                class="mt-2"
                style="margin-left: 24px"
                inline-prompt
                :active-icon="Check"
                :inactive-icon="Close"
            />
        </div> -->
    </div> 
    <!-- 推送框  -->
    <div class="main_box" v-infinite-scroll="load" infinite-scroll-distance="100" infinite-scroll-immediate="false" >
        <div v-for="(source,index) in dataList" :key="index" class="item" @click="goToConversationList(typeNumber,source.askerId,source.id,source.number)">
            <div class="up">
                <div class="up_box">
                    <div style="display: flex;">
                        <div style="display: flex;align-items: center;">
                            <span class="name">{{ source.askerUsername }}</span>
                            <img v-if="source.verified === 1" src="@/assets/VerifiedUser.svg" style="width: 16px;height: 16px;margin: 0 5px 0 -4px;" alt="">
                        </div>
                        <span class="ask">向我提问</span>
                    </div>
                    <span class="content">{{ source.questionContent }}</span>
                    <span class="time">{{ source.createTime }}</span>
                </div>
            </div>
            <div class="down">
                <div v-if="typeNumber === 0" >
                    <div v-if="source.state === 1" class="mark">
                        <div class="refuse_btn">
                            <span style="color: #fff;">已拒绝该回答</span>
                        </div>
                    </div>
                    <div v-if="source.state === 3" class="mark">
                        <div class="waiteva_btn">
                            <span style="color: #fff;">等待用户评价</span>
                        </div>
                    </div>
                    <div v-if="source.state === 4" style="display: flex; flex-direction: column; gap: 5px;">
                        <div class="mark">
                            <span style="font-size: 12px;">{{ source.grade }}</span>
                            <img v-for= "n in getStarCount1( source.grade)" :key="n" src="@/assets/QACenter/ScoreStar.svg" alt="">
                        </div>
                        <span style="font-size: 16px;line-height: 1.6; " >{{source.content}}</span>
                    </div>
                    
                </div>
                <div v-if="typeNumber === 1" class="ing_box">
                    <div class="left_box">
                        <span style="cursor: pointer;">继续回答</span>
                        <img style="width: 16px;height: 16px; margin-left: 5px;cursor: pointer;" src="@/assets/QACenter/QASquare_B.svg" alt="">
                    </div>
                    <div class="ing_btn">
                        <span style="color: #fff;">剩余{{ source.remainTime }}</span>
                    </div>
                </div>
                <div v-if="typeNumber === 2" style="display: flex; align-items: center;  justify-content: space-between;">
                    <div style="display: flex;gap: 10px;" class="re-ac">
                        <!-- <el-button  @click="openaccept(source.id,source.askerId)" type="primary" plain>接受({{source.moneyCount}}鱼饵)</el-button> -->
                        <el-button  @click="openaccept(source.id,source.askerId)" type="primary" plain>接受</el-button>
                        <el-button  @click="openrefuse(source.id)" type="danger" plain>拒答</el-button>     
                    </div>    
                    <div class="ing_btn">
                        <span style="color: #fff;">剩余{{ source.remainTime }}</span>
                    </div>       
                </div>
            </div>
        </div>
        <el-empty 
            v-if="!dataList || dataList.length === 0" 
            :image-size="200" 
            description="您没有收到过提问呢！"
        />
    </div>
</template>

<script setup>
import { ref,onMounted,watch,onUnmounted} from 'vue'
import { Check, Close } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { ElMessageBox, ElMessage } from 'element-plus';
import axios from '@/utils/request';
import { getUsersAvatarFromCOS } from '@/utils/cosService';
import { convertDateFormat } from '@/utils/timeFormat'; 
import { openUrl } from '@/utils/routeJudge'

const currentPage = ref(1);
const router = useRouter()
// const value1 = ref(true)
const typeNumber = ref(0);
const dataList = ref([]);
const countData = ref();
const newValueOne = ref(0);
let interval = null;

//跳转到提问界面
const goToAnswer = (id,askId) =>{
    countAnswer();
    getNotAnswer();
    // const routeLocation = router.resolve({ path: `/GoAnswer/${id}/${askId}`});
    // window.open(routeLocation.href, '_blank');
    openUrl(`/GoAnswer/${id}/${askId}`)
}

const openaccept = async (questionId,askerId) => {
  try {
    await ElMessageBox.confirm(
      '确定要接受该回答吗？',
      {
        confirmButtonText: '确认接受',
        cancelButtonText: '取消',
        type: 'info',
      }
    );
    acceptAnswer(questionId,askerId);
  } catch {
    console.log('关闭弹框')
  }
}

const openrefuse = async (id) => {
  try {
    await ElMessageBox.confirm(
      '确定要拒绝该回答吗？',
      'Warning',
      {
        confirmButtonText: '确认拒绝',
        cancelButtonText: '取消',
        type: 'warning',
      }
    );
    rejectAnswer(id);
  } catch {
    console.log('关闭弹框')
  }
}


const handleTypeNumberChange = (newValue) => {
    newValueOne.value = newValue;
    if(newValue === 0) {
        currentPage.value = 1;
        getEndAnswer(currentPage.value);
    }
    else if(newValue === 1)  {
        currentPage.value = 1;
        getIngAnswer(currentPage.value);
    }
    else if(newValue === 2)  {
        currentPage.value = 1;
        getNotAnswer(currentPage.value);
    }
}
//监视typeNumber的值
watch(typeNumber, handleTypeNumberChange);

const updateRemainTimes = () => {
    if(typeNumber.value === 2){
        for (let record of dataList.value) {
            record.remainTime = computeTimeRemain(record.createTime); 
        }
    }else if(typeNumber.value === 1){
        for (let record of dataList.value) {
            record.remainTime = computeTimeRemain(record.answerTime); 
        }
    }

};

//计算时间差的函数，传入的startDateTime和endDateTime都是时间字符串,如YYYY-MM-DD HH:MM:SS
const computeTimeDifference = (startDateTime, endDateTime) => {
    const startDate = new Date(startDateTime);
    const endDate = new Date(endDateTime);
    // 计算时间差值，得到的是毫秒数
    const differenceInMillis = endDate - startDate;
    // 将毫秒转换为小时、分钟和秒
    const hours = Math.floor(differenceInMillis / (1000 * 60 * 60));
    const minutes = Math.floor((differenceInMillis % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((differenceInMillis % (1000 * 60)) / 1000);
    // 格式化小时、分钟和秒为两位数
    const formattedHours = hours.toString().padStart(2, '0');
    const formattedMinutes = minutes.toString().padStart(2, '0');
    const formattedSeconds = seconds.toString().padStart(2, '0');
    // 返回 HH:MM:SS 格式的字符串
    return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
}


//计算剩余时间
const computeTimeRemain = (startDateTime) => {
    const now = new Date();
    const formatted = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    const dateObj = new Date(startDateTime); 
    dateObj.setDate(dateObj.getDate() + 2); 
    const newDateTime = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')} ${String(dateObj.getHours()).padStart(2, '0')}:${String(dateObj.getMinutes()).padStart(2, '0')}:${String(dateObj.getSeconds()).padStart(2, '0')}`;
    const endTime = computeTimeDifference(formatted,newDateTime)
    return endTime;
}


const goToConversationList = ( typeNumber,id,questionId,number) => {
    if (typeNumber === 0) {
        // const routeLocation = router.resolve({ path: `/CompletedList/LQuestionedMe/${questionId}/${id}` });
        // window.open(routeLocation.href, '_blank');
        openUrl(`/CompletedList/LQuestionedMe/${questionId}/${id}`)
    }
    if (typeNumber === 1) {
        // const routeLocation = router.resolve({ path: `/OngoingConversation/LiveChat/answer/${id}/${questionId}/${number}` });
        // window.open(routeLocation.href, '_blank');
        openUrl(`/OngoingConversation/LiveChat/answer/${id}/${questionId}/${number}`)
    }   
  }

//判断哦评价展示的星星数量
const getStarCount1 = (grade) =>{
    const result = Math.floor(grade);
    return result
}

//接受提问（用户为回答者）
async function acceptAnswer(questionId,askerId) {
    goToAnswer(questionId,askerId);
}

//拒绝提问（用户为回答者）
async function rejectAnswer(id) {
  try{
    const response = await axios.post(`/answer/myanswer/reject/${id}`)
    if(response.data.code === 1){
        ElMessage.success('拒绝提问成功');
        countAnswer();
        getNotAnswer();
    }else if(response.data.code === 0 && response.data.msg){
        ElMessage.error(response.data.msg.toString());
    }else{
        console.error("拒绝提问失败");
        ElMessage.error('拒绝提问失败');
    }
  } catch (error) {
    console.error("拒绝提问失败", error); 
    ElMessage.error('拒绝提问失败');
  }
}

//获取各类提问数目（未回答、进行中和已完成）
async function countAnswer() {
  try{
    const response = await axios.get(`/answer/myanswer/count`)
    if(response.data.code === 1){
        countData.value = response.data.data;
        // ElMessage.success('获取各类提问数目成功');
    }else if(response.data.code === 0 && response.data.msg){
        ElMessage.error(response.data.msg.toString());
    }else{
        console.error("获取各类提问数目失败");
        ElMessage.error('获取各类提问数目失败');
    }
  } catch (error) {
    console.error("获取各类提问数目失败", error); 
    ElMessage.error('获取各类提问数目失败');
  }
}

// 添加一个锁状态
let isLoading = false;
async function load() {
    if (isLoading) return; // 如果已经在加载中，则直接返回不执行新的加载
    isLoading = true; // 开始加载数据，设置锁状态为true
    if(currentPage.value === 1){
        currentPage.value++;
    }
    try {
        if(newValueOne.value === 0) {
            await getEndAnswer(currentPage.value);
            currentPage.value++; // 只有在请求成功完成后才递增页码
        }
        else if(newValueOne.value === 1) {
            await getIngAnswer(currentPage.value);
            currentPage.value++; // 只有在请求成功完成后才递增页码
        }
        else if(newValueOne.value === 2) {
            await getNotAnswer(currentPage.value);
            currentPage.value++; // 只有在请求成功完成后才递增页码
        }
    } catch (error) {
        console.error(error);
        ElMessage.error('滚动时的未知错误');
    } finally {
        isLoading = false; // 请求完成，无论成功或失败，都释放锁状态
    }
}


//获取进行中的问答（用户为回答者）
async function getIngAnswer(currentPage) {
    if(currentPage === 1){
        dataList.value = [];
    }
    try{
        const response = await axios.get(`/answer/myanswer/ing`, {
            params: {
                page:currentPage,
                pageSize:10,
            }
        });
        if (response.data.code === 1 && response.data.data.records.length > 0) {
            const updates = response.data.data.records.map(async (record) => {
                const avatarPromise = getUsersAvatarFromCOS(record.askerId);
                const avatar = await avatarPromise;
                const createTime = convertDateFormat(record.createTime);
                const verified = await fetchUserInformation(record.askerId);
                // const remainTime = computeTimeRemain(record.answerTime);
                return { ...record, avatar, createTime,verified };
            });
            const updatedRecords = await Promise.all(updates);
            dataList.value = [...dataList.value, ...updatedRecords];
            // ElMessage.success('获取进行中的问答成功');
        }else if (response.data.code === 1 && response.data.data.records.length === 0) {
            // ElMessage.info('已加载所有数据');
        }else if(response.data.code === 0 && response.data.msg){
            ElMessage.error(response.data.msg.toString());
        }else{
            console.error("获取进行中的问答失败");
            ElMessage.error('获取进行中的问答失败');
        }
    } catch (error) {
        console.error("获取进行中的问答失败", error); 
        ElMessage.error('获取进行中的问答失败');
    }
}

//获取未回答的问答（用户为回答者）
async function getNotAnswer(currentPage) {
    if(currentPage === 1){
        dataList.value = [];
    }
    try{
        const response = await axios.get(`/answer/myanswer/noresponse`, {
            params: {
                page:currentPage,
                pageSize:10,
            }
        });
        if (response.data.code === 1 && response.data.data.records.length > 0) {
            const updates = response.data.data.records.map(async (record) => {
                const avatar = await getUsersAvatarFromCOS(record.askerId);
                const createTime = convertDateFormat(record.createTime);
                const verified = await fetchUserInformation(record.askerId);
                // const remainTime = computeTimeRemain(record.createTime);
                return { ...record, avatar, createTime,verified };
            });
            const updatedRecords = await Promise.all(updates);
            dataList.value = [...dataList.value, ...updatedRecords];
            // ElMessage.success('获取未回答的问答成功');
        }else if (response.data.code === 1 && response.data.data.records.length === 0) {
            // ElMessage.info('已加载所有数据');
        }else if(response.data.code === 0 && response.data.msg){
            ElMessage.error(response.data.msg.toString());
        }else{
            console.error("获取未回答的问答失败");
            ElMessage.error('获取未回答的问答失败');
        }
    } catch (error) {
        console.error("获取未回答的问答失败", error); 
        ElMessage.error('获取未回答的问答失败');
    }
}


//获取已结束的问答（用户为回答者）
async function getEndAnswer(currentPage) {
    if(currentPage === 1){
        dataList.value = [];
    }
  try{
    const response = await axios.get(`/answer/myanswer/end`, {
        params: {
            page:currentPage,
            pageSize:10,
        }
    });
    if (response.data.code === 1 && response.data.data.records.length > 0) {
        const updates = response.data.data.records.map(async (record) => {
            const avatar = await getUsersAvatarFromCOS(record.askerId);
            const createTime = convertDateFormat(record.createTime);
            const verified = await fetchUserInformation(record.askerId);
            return { ...record, avatar, createTime,verified };
        });
        const updatedRecords = await Promise.all(updates);
        dataList.value = [...dataList.value, ...updatedRecords];
        // ElMessage.success('获取已结束的问答成功');
    }else if (response.data.code === 1 && response.data.data.records.length === 0) {
        // ElMessage.info('已加载所有数据');
    }else if(response.data.code === 0 && response.data.msg){
        ElMessage.error(response.data.msg.toString());
    }else{
        console.error("获取已结束的问答失败");
        ElMessage.error('获取已结束的问答失败');
    }
  } catch (error) {
    console.error("获取已结束的问答失败", error); 
    ElMessage.error('获取已结束的问答失败');
  }
}


// 获取用户信息
const fetchUserInformation = async (userId) => {
    try {
        const response = await axios.get(`/users/${userId}`);
        if(response.data.code === 1){
            return (response.data.data.verified);
        }else if(response.data.code === 0 && response.data.msg){
            ElMessage.error(response.data.msg.toString());
        }else{
            ElMessage.error('获取用户信息失败');
        }
    } catch (error) {
        console.error("获取用户信息失败", error);
        ElMessage.error('获取用户信息失败');
    }
};


// 在组件挂载时设置定时器，每秒更新一次剩余时间
onMounted(() => {
  updateRemainTimes(); // 立即更新一次剩余时间
  interval = setInterval(updateRemainTimes, 1000); // 设置定时器
  countAnswer();
  getEndAnswer(currentPage.value);
  
});

// 在组件卸载时清除定时器
onUnmounted(() => {
  clearInterval(interval);
});

</script>

<style scoped>
.select{
    width: 75%;
    margin: 1rem auto 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
}
.select_btn{
    display: flex;
    align-items: center;
    gap: 5px;
    cursor: pointer;
}
.select_btn span{
    font-size: 12px;
    line-height: 1.6;
}
.selected span{
    font-size: 14px;
    font-weight: 700;
    line-height: 1.6;
}
.main_box{
    padding: 15px 0px;
    height: 58vh;
    overflow: auto;
}
.item{
    display: flex;
    width: 70%;
    padding: 16px 20px;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    gap: 12px;
    margin: 0px auto 30px;
    border-radius: 12px;
    background: #FFF;
    cursor: pointer;
}
.up{
    padding-bottom: 12px;
    width: 100%;
    border-bottom: 1px solid #EEE;
}
.up_box{
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    gap: 8px;
}
.name{
    color: #3F87E1;
    margin-right: 5px;
    line-height: 1.6;
}
.ask{
    color: #9B9B9B;
    line-height: 1.6;
}
.content{
    width: 100%;
    line-height: 1.6;
}
.time{
    color: #7E7E7E;
    font-size: 14px;
    line-height: 1.6;
}
.down{
    width: 100%;
}
.mark{
    display: flex;
    align-items: center;
    gap: 5px;
}
.ing_box,
.left_box{
    display: flex;
    align-items: center;
}
.ing_box{
    justify-content: space-between;
    width: 100%;
}

.ing_btn,
.waiteva_btn,
.refuse_btn{
    height: 19px;
    padding: 8px 12px;
    border-radius: 4px;
    border: 1px solid #EEE;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 10px;
}
/* 剩余时间 */
.ing_btn{
    background: #67ABFF;

}
/* 等待用户评价 */
.waiteva_btn{
    background: #67ABFF;
}
/* 已拒绝该回答 */
.refuse_btn{
    background-color: #A2A2A2;;
}
::v-deep .el-dialog__wrapper {
   background-color: rgba(0, 0, 0, 0.5)!important;
}
::v-deep .el-overlay {
  background-color: rgba(0, 0, 0, 0.5) !important;
}
/* 对手机屏幕和小尺寸屏幕的样式调整 */
@media (max-width: 768px) {
    .select{
        width: 90%;
    }
    .item{
        width: 88%;
        padding: 16px 1rem;
        gap: 12px;
        border-radius: 12px;
        background: #FFF;
        cursor: pointer;
    }
    .main_box{
        height: 57vh;
    }
    .ing_btn,
    .waiteva_btn,
    .refuse_btn{
        font-size: 0.8rem;
        padding: 0.4rem 0.5rem;
    }
    .re-ac{
        gap: 0px;
    }
}
</style>
<template>
    <!-- 已完成，进行中，未回答 筛选 -->
    <div class="select">
        <div style="display: flex; gap: 20px;">
            <div @click="typeNumber = 0" :class="{ selected: typeNumber === 0 }" class="select_btn">
                <span>已完成</span>
                <span>{{  countData[3] }}</span>
            </div>
            <div @click="typeNumber = 1" :class="{ selected: typeNumber === 1 }" class="select_btn">
                <span>待评价</span>
                <span>{{  countData[2] }}</span>
            </div>
            <div @click="typeNumber = 2" :class="{ selected: typeNumber === 2 }" class="select_btn">
                <span>进行中</span>
                <span>{{ countData[1] }}</span>
            </div>
            <div @click="typeNumber = 3" :class="{ selected: typeNumber === 3 }" class="select_btn">
                <span>待解答</span>
                <span>{{ countData[0] }}</span>
            </div>
        </div>
    </div> 
    <!-- 推送框  -->
    <div class="main_box" v-infinite-scroll="load" infinite-scroll-distance="100" infinite-scroll-immediate="false" >
        <div v-for="(source,index) in dataList" :key="index" :class="{'item cur': typeNumber !== 1, 'item': typeNumber === 1}" @click="goToConversationList(typeNumber,source.answererId,source.id,source.number)">
            <div class="up">
                <div class="up_box">
                    <div style="display: flex;">
                        <span class="ask">我向</span>
                        <div style="display: flex;align-items: center;">
                            <span class="name">{{ source.answererUsername }}</span>
                            <img  v-if="source.verified === 1" src="@/assets/VerifiedUser.svg" style="width: 16px;height: 16px;margin: 0 5px 0 -4px;" alt="">
                        </div>
                        <span class="ask">提问</span>
                    </div>
                    <span class="content multi-line-ellipsis-2">{{ source.questionContent }}</span>
                    <span class="time">{{ source.createTime }}</span>
                </div>
            </div>
            <div class="down">
                <div v-if="typeNumber === 0" class="mark">
                    <div>
                        <img v-for= "n in getStarCount1(source.grade)" :key="n" src="@/assets/QACenter/ScoreStar.svg" alt="">
                    </div>
                    <span  style="font-size: 16px;line-height: 1.6; " >{{source.content}}</span>
                </div>
                <div v-if="typeNumber === 1" class="ing_box">
                    <div class="left_box" @click="changeType">
                        <span >去评价</span>
                        <img style="width: 16px;height: 16px; margin-left: 5px;cursor: pointer;" src="@/assets/QACenter/Evaluation.svg" alt="">
                    </div>
                    <div v-if="dialogFormVisible">
                        <EvaluateDialog v-model="dialogFormVisible" :QuestionId="source.id"></EvaluateDialog>
                    </div>
                </div>
                <div v-if="typeNumber === 2" class="ing_box">
                    <div class="left_box">
                        <span style="cursor: pointer;">继续提问</span>
                        <img style="width: 16px;height: 16px; margin-left: 5px;cursor: pointer;" src="@/assets/QACenter/QASquare_B.svg" alt="">
                    </div>
                    <div class="ing_btn">
                        <span style="color: #fff;">剩余{{ source.remainTime }}</span>
                    </div>
                </div>
                <div v-if="typeNumber === 3" class="ing_box">
                    <div class="ing_btn2">
                        <span style="color: #fff;">{{ source.remainTime }}后自动被拒绝</span>
                    </div>
                </div>
            </div>
        </div>
        <el-empty 
            v-if="!dataList || dataList.length === 0" 
            :image-size="200" 
            description="您还没有发起过提问呢！"
        />
    </div>
</template>

<script setup>
import { ref,watch,onMounted,onUnmounted} from 'vue'
import { useRouter } from 'vue-router'
import EvaluateDialog from '../components/EvaluateDialog.vue';
import { ElMessage } from 'element-plus';
import axios from '@/utils/request';
import { getUsersAvatarFromCOS } from '@/utils/cosService';
import { convertDateFormat } from '@/utils/timeFormat'; 
import { openUrl } from '@/utils/routeJudge'

const currentPage = ref(1);
const router = useRouter()
const typeNumber = ref(0);
const dialogFormVisible = ref(false);
const dataList = ref([]);
const countData = ref();
let interval = null;
const newValueOne = ref(0);

const handleTypeNumberChange = (newValue) => {
    newValueOne.value = newValue;
    if(newValue === 0) {
        currentPage.value = 1;
        getEndAnswer(currentPage.value);
    }
    else if(newValue === 1) {
        currentPage.value = 1;
        getTocommentAnswer(currentPage.value);
    }
    else if(newValue === 2) {
        currentPage.value = 1;
        getIngAnswer(currentPage.value);
    }
    else if(newValue === 3) {
        currentPage.value = 1;
        getNoanswerAnswer(currentPage.value);
    }
}

const changeType = () =>{
    dialogFormVisible.value = true;
}

//监视typeNumber的值
watch(typeNumber, handleTypeNumberChange);

const updateRemainTimes = () => {
    if(typeNumber.value === 3){
        for (let record of dataList.value) {
            record.remainTime = computeTimeRemain(record.createTime); // 假设 record.answerTime 是你需要计算剩余时间的字段
        }
    }else if(typeNumber.value === 2){
        for (let record of dataList.value) {
            record.remainTime = computeTimeRemain(record.answerTime); // 假设 record.answerTime 是你需要计算剩余时间的字段
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

//判断哦评价展示的星星数量
const getStarCount1 = (grade) =>{
    const result = Math.floor(grade);
    return result
}


const goToConversationList = ( typeNumber,id,questionId,number ) => {
    if (typeNumber === 0) {
        // const routeLocation = router.resolve({ name:'LMyQuestioned'});
        // window.open(routeLocation.href, '_blank');
        // const routeLocation = router.resolve({ path: `/CompletedList/LMyQuestioned/${questionId}/${id}` });
        // window.open(routeLocation.href, '_blank');
        openUrl(`/CompletedList/LMyQuestioned/${questionId}/${id}`)
    }
    if (typeNumber === 2) {
        // const routeLocation = router.resolve({ path:`/OngoingConversation/LiveChat/ask/${id}/${questionId}/${number}`});
        // window.open(routeLocation.href, '_blank');
        // const routeLocation = router.resolve({ path: `/OngoingConversation/LiveChat/ask/${id}/${questionId}/${number}` });
        // window.open(routeLocation.href, '_blank');
        openUrl(`/OngoingConversation/LiveChat/ask/${id}/${questionId}/${number}`)
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
            await getTocommentAnswer(currentPage.value);
            currentPage.value++; // 只有在请求成功完成后才递增页码
        }
        else if(newValueOne.value === 2) {
            await getIngAnswer(currentPage.value);
            currentPage.value++; // 只有在请求成功完成后才递增页码
        }
        else if(newValueOne.value === 3) {
            await getNoanswerAnswer(currentPage.value);
            currentPage.value++; // 只有在请求成功完成后才递增页码
        }
    } catch (error) {
        console.error(error);
        ElMessage.error('滚动时的未知错误');
    } finally {
        isLoading = false; // 请求完成，无论成功或失败，都释放锁状态
    }
}

//获取各类提问数目（待解答、进行中、待评价和已完成）
async function countAnswer() {
  try{
    const response = await axios.get(`/answer/myask/count`)
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

//获取进行中的问答（用户为提问者）
async function getIngAnswer(currentPage) {
    if(currentPage === 1){
        dataList.value = [];
    }
    try{
        const response = await axios.get(`/answer/myask/ing`, {
            params: {
                page:currentPage,
                pazeSize:10
            }
        });
        if (response.data.code === 1 && response.data.data.records.length > 0) {
            const updates = response.data.data.records.map(async (record) => {
                const avatarPromise = getUsersAvatarFromCOS(record.answererId);
                const avatar = await avatarPromise;
                const createTime = convertDateFormat(record.createTime);
                const verified = await fetchUserInformation(record.answererId);
                return {
                    ...record,
                    avatar,
                    verified,
                    createTime,
                };
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

//获取待评论的问答（用户为提问者）
async function getTocommentAnswer(currentPage) {
    if(currentPage === 1){
        dataList.value = [];
    }
    try{
        const response = await axios.get(`/answer/myask/tocomment`, {
            params: {
                page:currentPage,
                pageSize:10
            }
        });
        if (response.data.code === 1 && response.data.data.records.length > 0) {
            const updates = response.data.data.records.map(async (record) => {
                const avatar = await getUsersAvatarFromCOS(record.answererId);
                const createTime = convertDateFormat(record.createTime);
                const verified = await fetchUserInformation(record.answererId);
                return {
                    ...record,
                    avatar,
                    verified,
                    createTime
                };
            });
            const updatedRecords = await Promise.all(updates);
            dataList.value = [...dataList.value, ...updatedRecords];
            // ElMessage.success('获取待评论的问答成功');
        }else if (response.data.code === 1 && response.data.data.records.length === 0) {
            // ElMessage.info('已加载所有数据');
        }else if(response.data.code === 0 && response.data.msg){
            ElMessage.error(response.data.msg.toString());
        }else{
            console.error("获取待评论的问答失败");
            ElMessage.error('获取待评论的问答失败');
        }
    } catch (error) {
        console.error("获取待评论的问答失败", error); 
        ElMessage.error('获取待评论的问答失败');
    }
}


//获取已结束的问答（用户为提问者）
async function getEndAnswer(currentPage) {
    if(currentPage === 1){
        dataList.value = [];
    }
    try{
        const response = await axios.get(`/answer/myask/end`, {
            params: {
                page:currentPage,
                pageSize:10,
            }
        });
        if (response.data.code === 1 && response.data.data.records.length > 0) {
            const updates = response.data.data.records.map(async (record) => {
                const avatar = await getUsersAvatarFromCOS(record.answererId);
                const createTime = convertDateFormat(record.createTime);
                const verified = await fetchUserInformation(record.answererId);
                return {
                    ...record,
                    avatar,
                    verified,
                    createTime
                };
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

//获取未解答的问答（用户为提问者）
async function getNoanswerAnswer(currentPage) {
    if(currentPage === 1){
        dataList.value = [];
    }
    try{
        const response = await axios.get(`/answer/myask/noanswer`, {
            params: {
                page:currentPage,
                pageSize:10,
            }
        });
        if (response.data.code === 1 && response.data.data.records.length > 0) {
            const updates = response.data.data.records.map(async (record) => {
                const avatar = await getUsersAvatarFromCOS(record.answererId);
                const createTime = convertDateFormat(record.createTime);
                const verified = await fetchUserInformation(record.answererId);
                return {
                    ...record,
                    avatar,
                    verified,
                    createTime,
                };
            });
            const updatedRecords = await Promise.all(updates);
            dataList.value = [...dataList.value, ...updatedRecords];
            // ElMessage.success('获取未解答的问答成功');
        }else if (response.data.code === 1 && response.data.data.records.length === 0) {
            // ElMessage.info('已加载所有数据');
        }else if(response.data.code === 0 && response.data.msg){
            ElMessage.error(response.data.msg.toString());
        }else{
            console.error("获取未解答的问答失败");
            ElMessage.error('获取未解答的问答失败');
        }
    } catch (error) {
        console.error("获取未解答的问答失败", error); 
        ElMessage.error('获取未解答的问答失败');
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
}
.cur{
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
    margin: 0px 5px;
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
    align-items: flex-start;
    flex-direction: column;
    gap: 5px;
}
.ing_box,
.left_box{
    display: flex;
    align-items: center;
    cursor: pointer;
}
.ing_box{
    justify-content: space-between;
    width: 100%;
}
.ing_btn{
    height: 19px;
    padding: 8px 12px;
    border-radius: 4px;
    border: 1px solid #EEE;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 10px;
    background: #67ABFF;
}
.ing_btn2{
    width: 173px;
    height: 19px;
    padding: 8px 12px;
    border-radius: 4px;
    border: 1px solid #EEE;
    background: #67ABFF;
    cursor: pointer;
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
    .ing_btn2{
        font-size: 0.8rem;
        padding: 0.4rem 0.5rem;
    }
}

</style>
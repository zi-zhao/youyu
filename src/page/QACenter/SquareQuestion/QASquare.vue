<template>
    <!-- <div class="part_1">
        <span class="toptext">推荐答主</span>
    </div> -->
    <div class="part_2" v-infinite-scroll="load" infinite-scroll-distance="100" infinite-scroll-immediate="false">
        <div v-for="(source,index) in recommendedAnswererList" :key="index" class="item">
            <div class="item-left">
                <!-- 用户头像 -->
                <div class="authorpic">
                    <img :src="source.newAvater"  @click="navigateToUserProfile(source.userId)" alt="">
                </div>
                <!-- 用户名称+咨询信息 -->
                <div class="info">
                    <div style="display: flex;align-items: center;gap: 3px;">
                        <span>{{ source.username }}</span>
                        <img  v-if="source.verified === 1"  src="@/assets/VerifiedUser.svg" style="width: 16px;height: 16px;" alt="">
                    </div>
                    <div class="middle">
                        <img src="@/assets/QACenter/QuestionMark.svg" alt="">
                        <span>{{ source.answerCount }}次咨询</span>
                        <div class="score">
                            <img v-for="n in getStarCount1(source.commentGrade)" :key="n" src="@/assets/QACenter/ScoreStar.svg" alt="">
                            <span>{{ source.commentGrade }}</span>
                        </div>
                    </div>
                    <!-- 回答领域 -->
                    <div class="field">
                        {{ source.answererInfo }}
                    </div>
                </div>
            </div>
            <!-- *鱼饵 起 咨询 -->
            <div class="consult_btn"  @click="goToConsult(source.userId)">
                <div style="display:flex; align-items: center; gap:5px;">
                    <img src="@/assets/QACenter/FishPoint.svg" alt="">
                    <!-- <span class="text1 recommend">推荐：</span>
                    <span class="text2">{{ source.priceLow }}~{{source.priceHigh}}起</span> -->
                    <span class="text2">免费</span>
                </div>
                <span class="text1">咨询</span>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref,onMounted } from 'vue'
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import axios from '@/utils/request';
import { getUsersAvatarFromCOS } from '@/utils/cosService';
import { openUrl } from '@/utils/routeJudge'

const currentPage = ref(1);
const router = useRouter()
const recommendedAnswererList = ref([]);
const userId = localStorage.getItem("userId");

//点击进入答主信息展示页面
const goToConsult = (id) =>{
    // const routeLocation = router.resolve({ path: `/DefaultPresentation/AnswererBrief/${id}`});
    // window.open(routeLocation.href, '_blank');
    // const routeLocation = router.resolve({ path: `/DefaultPresentation/AnswererBrief/${id}` });
    // window.open(routeLocation.href, '_blank');
    openUrl(`/DefaultPresentation/AnswererBrief/${id}`)
}

//点击用户头像进行跳转到个人主页
const navigateToUserProfile = (user_id) => {
    console.log('点击用户头像跳转');
    if(user_id == userId){
        // const routeLocation = router.resolve({ path: '/PersonalPage' });
        // window.open(routeLocation.href, '_blank');
        openUrl('/PersonalPage')
    }else{
        // const routeLocation = router.resolve({ path: `/OtherUserPersonalPage/${user_id}`});
        // window.open(routeLocation.href, '_blank');
        openUrl(`/OtherUserPersonalPage/${user_id}`)
    }
};

//判断哦评价展示的星星数量
const getStarCount1 = (grade) =>{
    const result = Math.floor(grade);
    return result
}


// 添加一个锁状态
let isLoading = false;
async function load() {
    if (isLoading) return; // 如果已经在加载中，则直接返回不执行新的加载
    isLoading = true; // 开始加载数据，设置锁状态为true
    try {
        if(currentPage.value === 1){
            currentPage.value++;
        }
        await getRecommendedAnswerer(currentPage.value);
        currentPage.value++; // 只有在请求成功完成后才递增页码
    } catch (error) {
        console.error(error);
        ElMessage.error('滚动时的未知错误');
    } finally {
        isLoading = false; // 请求完成，无论成功或失败，都释放锁状态
    }
}

//获取推荐答主列表
async function getRecommendedAnswerer(currentPage) {
  try{
    const response = await axios.get(`/answer/answerer`, {
        params: {
            page:currentPage,
            pageSize:10,
        }
    });
    if (response.data.code === 1 && response.data.data.records.length > 0) {
        const updates = response.data.data.records.map(async (record) => {
            const verified = await fetchUserInformation(record.userId);
            const newAvater = await getUsersAvatarFromCOS(record.userId);
            const commentGrade = ref();
            if(record.answerCount != 0){
                commentGrade.value = (record.cumGrade/record.answerCount).toFixed(1);
            }else{
                commentGrade.value = 0;
            }
            const sliceanswererInfo = record.answererInfo.slice(0, 15);
            return {
                ...record,
                verified,
                newAvater,
                commentGrade,
                sliceanswererInfo
            };
        });
        const updatedRecords = await Promise.all(updates);
        recommendedAnswererList.value = [...recommendedAnswererList.value, ...updatedRecords];
        // ElMessage.success('获取推荐答主列表成功');
    }else if (response.data.code === 1 && response.data.data.records.length === 0) {
        // ElMessage.info('已加载所有数据');
    }else if(response.data.code === 0 && response.data.msg){
        ElMessage.error(response.data.msg.toString());
    }else{
        console.error("获取推荐答主列表失败");
        ElMessage.error('获取推荐答主列表失败');
    }
  } catch (error) {
    console.error("获取推荐答主列表失败", error); 
    ElMessage.error('获取推荐答主列表失败');
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

onMounted(() => {
    getRecommendedAnswerer(currentPage.value);
})


</script>

<style scoped>
.toptext{
    font-size: 20px;
    font-weight: 700;
}
.part_2{
    height: 86vh;
    overflow: auto;
    width: 100%;
}
.item{
    width: 90%;
    margin: 0px auto;
    padding: 20px 0px;
    border-bottom: 1px solid #EEE;
    display: flex;
    justify-content: space-between;
    align-items: center;
}
.item-left{
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    width: 70%;
}
.authorpic img{
    width: 60px;
    height: 60px;
    border-radius: 50%;
    margin-bottom: 35px;
    cursor: pointer;
}
.info{
    display: flex;
    flex-direction: column;
    gap: 7px;
}
.info span{
    font-size: 15px;
    font-weight: 700;
    line-height: 1.6;
}
.middle{
    display: flex;
    align-items: center;
    gap: 8px;
}
.middle img{
    width: 12px;
    height: 12px;
}
.middle span{
    color: #7E7E7E;
    font-size: 12px;
}
.score{
    display: flex;
    align-items: center;
}
.score img{
    width: 16px;
    height: 16px;
}
.score span{
    color: #FACB25;
    font-size: 12px;
}
.field{
    width: 710px;
    color: #000;
    font-size: 14px;
    line-height: 1.6;
}
.consult_btn{
    height: 17px;
    display: flex;
    padding: 8px 12px;
    justify-content: center;
    align-items: center;
    gap: 10px;
    border-radius: 8px;
    background: #9ba5c7;
    margin-right: 20px;
    cursor: pointer;
}
.consult_btn img{
    width: 12px;
    height: 12px;
}
.text1{
    color: #46639D;
    font-size: 14px;
    line-height: 1.6;
}
.text2{
    color: #FFF;
    font-size: 14px;
    line-height: 1.6; 
}
/* 对手机屏幕和小尺寸屏幕的样式调整 */
@media (max-width: 768px) {
    .item{
        padding: 1.5rem 0.5rem;
        flex-direction: column;
        align-items: flex-end;
        gap: 1rem;
    }
    .item-left{
        width: 100%;
        gap: 0.8rem;
    }
    .authorpic img{
        width: 2.5rem;
        height: 2.5rem;
    }
    .info{
        width: 27%;
        gap: 0.6rem;
    }
    .consult_btn{
        margin-right: 0px;
    }
    .middle,
    .field{
        width: 300%;
    }
    .recommend{
        display: none;
    }
}
</style>
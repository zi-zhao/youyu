<template>
    <div class="bgc_box">
        <div class="large_box">
            <!-- 答主简介 -->
            <div class="brief">
                <div class="title">
                    <span>答主简介</span>
                    <img src="@/assets/QACenter/BriefRight.svg" alt="">
                </div>
                <div class="main">
                    <!-- 答主信息 -->
                    <div class="personal_info">
                        <img :src="answererInfo.newAvater" alt="">
                        <div class="right">
                            <div style="display: flex;align-items: center;gap: 3px;">
                                <span class="name">{{ answererInfo.username }}</span>
                                <img v-if="answererInfo.verified === 1" src="@/assets/VerifiedUser.svg" style="width: 16px;height: 16px;" alt="">
                            </div>
                            <div class="identification-pc">
                                <span class="text1">教育经历</span>
                                <img  src="@/assets/QACenter/EducationHat.svg" alt="">
                                <span class="text2">{{answererInfo.school}}:{{ answererInfo.major }}</span>
                            </div>
                            <div class="identification-pc">
                                <span class="text1">答主成绩</span>
                                <img  src="@/assets/QACenter/ScoreStar.svg" alt="">
                                <span class="text2">{{ answererInfo.achievement }}</span>
                            </div>
                            <div style="display: flex; gap: 10px; cursor: pointer;">
                                <span class="text3" @click="navigateToUserProfile">进入个人主页</span>
                                <span class="text3">></span>
                            </div>
                        </div>
                    </div>
                    <div class="identification-phone">
                        <span class="text1">教育经历</span>
                        <img  src="@/assets/QACenter/EducationHat.svg" alt="">
                        <span class="text2">{{answererInfo.school}}:{{ answererInfo.major }}</span>
                    </div>
                    <div class="identification-phone">
                        <span class="text1">答主成绩</span>
                        <img  src="@/assets/QACenter/ScoreStar.svg" alt="">
                        <span class="text2">{{ answererInfo.achievement }}</span>
                    </div>
                    <!-- 答主说 -->
                    <div class="answerer_say">
                        <span class="text1">答主说</span>
                        <span class="say-content" >{{ answererInfo.answererInfo }}</span>
                    </div>
                    <!-- 答主回答质量的数据 -->
                    <div class="four_box">
                        <div class="box">
                            <span class="text_4">{{answererInfo.answerCount}}条评价</span>
                            <span class="text_5">{{ answererInfo.commentGrade }}</span>
                            <div>
                                <img  class="star" v-for= "n in getStarCount1(answererInfo.commentGrade)" :key="n" src="@/assets/QACenter/ScoreStar.svg" alt="">
                            </div>
                        </div>
                        <div class="box">
                            <span class="text_4">回答问题数</span>
                            <span class="text_5">{{answererInfo.answerCount }}</span>
                            <div>
                                <img class="star" v-for="n in getStarCount2(answererInfo.answerCount)" :key="n" src="@/assets/QACenter/ScoreStar.svg" alt="">
                            </div>
                        </div>
                        <div class="box">
                            <span class="text_4">应答率</span>
                            <span class="text_5">{{answererInfo.answerRate}}%</span>
                            <div>
                                <img class="star" v-for= "n in getStarCount3(answererInfo.answerRate)" :key="n" src="../../../assets/QACenter/ScoreStar.svg" alt="">
                            </div>
                        </div>
                        <div class="box">
                            <span class="text_4">响应时长</span>
                            <span class="text_5">{{answererInfo.cumResponseTime}}h</span>
                            <div>
                                <img class="star" v-for= "n in getStarCount4(answererInfo.commentGrade)" :key="n" src="../../../assets/QACenter/ScoreStar.svg" alt="">
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref,onMounted} from 'vue'
import { ElMessage } from 'element-plus';
import axios from '@/utils/request';
import { getUsersAvatarFromCOS } from '@/utils/cosService';
import { useStore } from 'vuex';
import { PageTitle } from '@/utils/fileService.js'
import { useRouter } from 'vue-router';
import { openUrl } from '@/utils/routeJudge'

const setPageTitle = PageTitle('正在加载...');

const store = useStore();
const router = useRouter()
const answererInfo = ref({});
const user_id = localStorage.getItem("userId");

//从路径获取用户id
const getPathParams = () => {
    const currentURL = window.location.href;
    const match = currentURL.match(/\/DefaultPresentation\/AnswererBrief\/(\d+)/);
    if (match) {
        const pageNumber = match[1];
        return pageNumber;
    } else {
        console.log('页面地址中没有找到数字部分。');
    }
}
const pathUserId = getPathParams()
const pathUserId2 = parseInt(pathUserId, 10);
store.commit('GETPATHUSERID', pathUserId2);

//判断哦评价展示的星星数量
const getStarCount1 = (grade) =>{
    const result = Math.floor(grade);
    return result > 0 ? result : 0;
}

const getStarCount2 = (answerCount) => {
    if (answerCount <= 5) {
        return 1;
    } else if (answerCount <= 10) {
        return 2;
    } else if (answerCount <=25 ) {
        return 3;
    } else if (answerCount <= 50) {
        return 4;
    } else {
        return 5;
    }
}

const getStarCount3 = (answerRate) => {
    if (answerRate <= 50) {
        return 1;
    } else if (answerRate <= 70) {
        return 2;
    } else if (answerRate <=85 ) {
        return 3;
    } else if (answerRate <= 90) {
        return 4;
    } else {
        return 5;
    }
}

const getStarCount4 = (commentGrade) => {
    if (commentGrade <= 4) {
        return 5;
    } else if (commentGrade <= 6) {
        return 4;
    } else if (commentGrade <=10 ) {
        return 3;
    } else if (commentGrade <= 24) {
        return 2;
    } else {
        return 1;
    }
}


//点击用户头像进行跳转
const navigateToUserProfile = () => {
    if(user_id == pathUserId2){
        // const routeLocation = router.resolve({ path: '/PersonalPage' });
        // window.open(routeLocation.href, '_blank');
        openUrl('/PersonalPage')
    }else{
        // const routeLocation = router.resolve({ path: `/OtherUserPersonalPage/${pathUserId2}`});
        // window.open(routeLocation.href, '_blank');
        openUrl(`/OtherUserPersonalPage/${pathUserId2}`)
    }
};

//获取答主具体信息
async function getAnswererInfo() {
  try{
    const response = await axios.get(`/answer/${pathUserId2}`)
    if(response.data.code === 1){
        answererInfo.value = response.data.data;
        answererInfo.value.verified = await fetchUserInformation(pathUserId2);
        setPageTitle(`${ answererInfo.value.username} 的咨询简介 - 云联知渔`); 
        answererInfo.value.newAvater = await getUsersAvatarFromCOS(answererInfo.value.userId);
        if(answererInfo.value.answerCount != 0){
            answererInfo.value.cumResponseTime = (answererInfo.value.cumTime/60/answererInfo.value.answerCount).toFixed(2);
            answererInfo.value.answerRate = (answererInfo.value.answerCount/answererInfo.value.totalCount).toFixed(2);
            answererInfo.value.commentGrade = (answererInfo.value.cumGrade/answererInfo.value.answerCount).toFixed(2);
            answererInfo.value.answerRate = Math.round(answererInfo.value.answerRate * 100);
        }else{
            answererInfo.value.cumResponseTime = 0;
            answererInfo.value.answerRate = 0;
            answererInfo.value.commentGrade = 0;
            answererInfo.value.answerRate = 0;
        }

        // ElMessage.success('获取答主具体信息成功');
    }else if(response.data.code === 0 && response.data.msg){
        ElMessage.error(response.data.msg.toString());
    }else{
        console.error("获取答主具体信息失败");
        ElMessage.error('获取答主具体信息失败');
    }
  } catch (error) {
    console.error("获取答主具体信息失败", error); 
    ElMessage.error('获取答主具体信息失败');
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
    getAnswererInfo();
})



</script>

<style scoped>
.bgc_box{
    background: #F8F8F8;
}
.large_box{
    width: 1100px;
    margin: 0px auto;
}
.brief{
    width: 1000px;
    padding: 5px 50px 50px;
    background: #FFF;
    border-radius: 16px;
}
.title{
    padding: 12px 0px;
    border-bottom: 1px solid  #EEE;;
    display: flex;
    align-items: center;
    gap: 20px;
}
.title span{
    font-size: 20px;
}
.main{
    width: 900px;
    display: flex;
    flex-direction: column;
    align-items: center;
    margin: 30px auto 0px;
    gap: 25px;
}
.personal_info{
    display: flex;
    width: 750px;
    gap: 30px;
}
.personal_info img{
    height: 120px;
    width: 120px;
    border-radius: 8px;
}
.right{
    display: flex;
    flex-direction: column;
    gap: 10px;
}
.name{
    font-size: 20px;
    font-weight: 700;
    line-height: 1.6;
}
.identification-pc{
    display: flex;
    align-items: flex-start;
    gap: calc((5% - 16px) / 2);
}
.identification-phone{
    display: none;
}
.text1{
    font-weight: 700;
    line-height: 1.6;
    width: 12%;
}

.identification-pc img{
    width: 16px;
    height: 16px;
    font-size: 16px;
}
.text2{
    font-size: 14px;
    line-height: 1.6;
    width: 83%;

}
.text3{
    color: #3F87E1;
    font-size: 14px;
    line-height: 1.6;
}
.answerer_say{
    display: flex;
    align-items: flex-start;
    width: 670px;
    gap: 15px;
}
.say-content{
    width: 600px; 
    font-size: 16px; 
    line-height: 1.4;
}
.four_box{
    width: 60%;
    display: flex;
    padding: 15px 5rem;
    justify-content: space-between;
    border-radius: 8px;
    background: #fffcf2;
}
.box{
    width: 100px;
    height: 60px;
    display: flex;
    flex-direction: column;
    gap: 4px;
}
.text_4{
    color: #828282;
    font-size: 14px;
}
.text_5{
    font-weight: 700;
}
@media (max-width: 768px) {
    .large_box{
        width: 100%;
    }
    .brief{
        width: 90%;
        margin: 0 auto;
        padding: 5px 5% 50px;
    }
    .main{
        width: 100%;
        margin: 15px auto 0;
    }
    .title span{
        font-size: 1rem;
    }
    .personal_info{
        width: 100%;
        justify-content: flex-start;
        gap: 1rem;
    }
    .personal_info img{
        height: 4rem;
        width: 4rem;
    }
    .right{
        justify-content: space-evenly;
    }
    .name{
        font-size: 1rem;
    }
    .text2, .text3{
        font-size: 0.8rem;
    }
    .identification-pc{
        display: none;
    }
    .identification-phone{
        width: 100%;
        display: flex;
        align-items: flex-start;
        gap: 0.3rem;
    }
    .answerer_say{
        width: 100%;
        gap: 0.3rem;
    }
    .say-content{
        font-size: 0.8rem;
        width: calc(100% - 64px);
    }
    .four_box{
        width: 100%;
        padding: 15px 0.7rem;
    }
    .text1{
        font-size: 0.8rem;
        width: 3.5rem;
    }
    .text_4{
        font-size: 0.8rem;
    }
    .text_5{
        font-size: 0.8rem;
    }
    .star{
        width: 0.8rem;
    }
}
</style>
<template>
    <div style="height: 20px; background-color: #F8F8F8;"></div>
    <div class="bgc_box">
        <div class="large_box">
            <!-- 咨询服务 -->
            <div class="consult_service">
                <div class="title">
                    <span>咨询服务</span>
                    <img src="@/assets/QACenter/BriefRight.svg" alt="">
                </div>
                <div class="main">
                    <div class="left">
                        <span style="font-weight: 700;" class="phone-text">图文咨询</span>
                        <span style="color: #7E7E7E;" class="phone-text">每次咨询可提问{{answererInfo.number}}条</span>
                        <!-- <span style="color: #4A99F6;" class="phone-text">推荐：{{answererInfo.priceLow}}-{{answererInfo.priceHigh}}鱼饵</span> -->
                    </div>
                    <div class="right" @click="goToQuestion">
                        立即咨询
                    </div>
                </div>
            </div>
            <!-- 置顶评价 -->
            <div class="evaluation">
                <div class="title">
                    <span>置顶评价</span>
                    <img src="@/assets/QACenter/BriefRight.svg" alt="">
                </div>
                <div class="bottom ">
                    <div v-for="(source,index) in answererEvaluate" :key="index" class="item">
                        <!-- 左边两项 -->
                        <div class="left2">
                            <!-- 用户头像 -->
                            <div class="authorpic">
                                <img :src="source.newAvatar" alt="">
                            </div>
                            <!-- 用户评价 -->
                            <div class="eva">
                                <div style="margin-bottom: 10px;">
                                    <div style="display: flex;align-items: center;gap: 3px;">
                                        <span style="margin-right: 5px;">{{ source.askerUsername }}</span>
                                        <img v-if="source.verified === 1" src="@/assets/VerifiedUser.svg" style="width: 16px;height: 16px;" alt="">
                                    </div>
                                    <span style="color: #BCBCBC;">的评价:</span>
                                </div>
                                <div class="gray_box">
                                    {{ source.content }}
                                </div>
                            </div>
                        </div>
                        <!-- 右边两项 -->
                        <div class="right2">
                            <!-- <span style="color: #3F87E1;">查看问题</span> -->
                            <div style="display: flex; flex-direction: column; align-items: flex-end;gap: 5px;">
                                <div style="display: flex;align-items: center;">
                                    <span style="font-size: 12px;">{{ source.score }}</span>
                                    <img v-for= "n in getStarCount(source.grade) " :key="n" src="@/assets/QACenter/ScoreStar.svg" alt="">
                                </div>
                                <span style="color: #7E7E7E;">{{ source.createTime }}</span>
                            </div>
                        </div>
                    </div>
                    <el-empty 
                        v-if="!answererEvaluate || answererEvaluate.length === 0" 
                        :image-size="200" 
                        description="暂时还没有置顶评价呢！"
                    />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref,onMounted } from 'vue'
import { ElMessage } from 'element-plus';
import axios from '@/utils/request';
import { getUsersAvatarFromCOS } from '@/utils/cosService';
import { useStore } from 'vuex';
import { useRouter } from "vue-router";
import { convertDateFormat } from '@/utils/timeFormat'; 
import { openUrl } from '@/utils/routeJudge'

const router = useRouter();
const store = useStore();
const answererEvaluate = ref();
const answererInfo = ref({});
const answererId = store.state.pathUserId;

//判断评价展示的星星数量
const getStarCount = (grade) =>{
    const result = Math.floor(grade);
    return result
}

//获取答主评价信息
async function getAnswererEvaluate() {
  try{
    const response = await axios.get(`/answer/comment`, {
        params: {
            answererId:answererId,
            page:1,
            pageSize:5
        }
    });
    if (response.data.code === 1 && response.data.data.records.length > 0) {
        // 使用 map() 并行处理每个记录以获取头像和转换创建时间
        const updatesAsync = response.data.data.records.map(async (record) => {
            const newAvatar = await getUsersAvatarFromCOS(record.askerId);
            const createTime = convertDateFormat(record.createTime);
            const verified = await fetchUserInformation(record.askerId);
            return {
                ...record,
                newAvatar,
                createTime,
                verified,
            };
        });
        const updatedRecords = await Promise.all(updatesAsync);
        answererEvaluate.value = updatedRecords;
        // ElMessage.success('获取答主评价信息成功');
    }else if(response.data.code === 1 && response.data.data.records.length == 0){
        // ElMessage.success('获取答主评价信息成功');
    } else if(response.data.code === 0 && response.data.msg){
        ElMessage.error(response.data.msg.toString());
    }else {
        ElMessage.error('获取答主评价信息失败');
    }
  } catch (error) {
    console.error("获取答主评价信息失败", error); 
    ElMessage.error('获取答主评价信息失败');
  }
}

//获取答主具体信息
async function getAnswererInfo() {
  try{
    const response = await axios.get(`/answer/${answererId}`)
    if(response.data.code === 1){
        answererInfo.value = response.data.data;
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

 //跳转到提问界面
 const goToQuestion = () =>{
    // const routeLocation = router.resolve({ path: `/GoQuestion/${answererId}`});
    // window.open(routeLocation.href, '_blank');
    openUrl(`/GoQuestion/${answererId}`)
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
    getAnswererEvaluate();
    getAnswererInfo();
});


</script>

<style scoped>
.bgc_box{
    background: #F8F8F8;
}
.large_box{
    width: 1100px;
    margin: 0px auto;
}

.consult_service{
    width: 1000px;
    height: 175px;
    padding: 5px 50px;
    border-radius: 16px;
    background: #FFF;
    margin-bottom: 20px;
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
    justify-content: space-between;
    align-items: center;
    margin: 25px auto;
}
.left{
    display: flex;
    flex-direction: column;
    gap: 10px;
}
.right{
    width: 65px;
    height: 20px;
    padding: 8px 12px;
    border-radius: 16px;
    background: #9FA9CA;
    color: #FFF;
    cursor: pointer;
}
.evaluation{
    width: 1000px;
    height: 580px;
    padding: 5px 50px;
    background: #FFF;
    border-radius: 16px;
}
.bottom{
    height: 500px;
    padding: 20px 0px;
    overflow: auto;
    width: 105%;
}
.item{
    width: 1000px;
    padding: 20px 0px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}
.left2{
    display: flex;
    align-items: flex-start;
    gap: 15px;
}
.authorpic img {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    margin-bottom: 35px;
    cursor: pointer;
}

.gray_box{
    width: 580px;
    /* height: 76px; */
    padding: 12px;
    background-color: #f6f6f6;
    line-height: 1.6;
    border-radius: 8px;
}
.right2{
    display: flex;
    align-items: flex-end;
    height: 131px;
    gap: 80px;
    margin-right: 20px;
}
/* 调整滚动条宽度和颜色 */
::-webkit-scrollbar {
    width: 6px; /* 增加纵向滚动条的宽度 */
    height: 3px; /* 增加横向滚动条的高度 */
    background: transparent;
}

/* 定义滚动条轨道，设置为透明 */
::-webkit-scrollbar-track {
    box-shadow: inset 0 0 8px rgba(0, 0, 0, 0); /* 内阴影 */
    background: transparent; /* 将轨道背景设置为透明 */
}

/* 定义滑块，设置为浅灰色并增加内阴影 */
::-webkit-scrollbar-thumb {
    box-shadow: inset 0 0 8px rgba(145, 145, 145, 0.3); /* 添加淡灰色内阴影 */
    background-color: #e2e2e2; /* 滑块的颜色改为浅灰色 */
    border-radius: 10px; /* 保持圆角不变 */
}
/* 当鼠标悬停在滚动条滑块上时改变滑块的颜色 */
::-webkit-scrollbar-thumb:hover {
    background: #c8c8c8;
}
@media (max-width: 768px) {
    .large_box{
        width: 100%;
    }
    .consult_service{
        width: 90%;
        padding: 5px 5%;
    }
    .main{
        width: 100%;
    }
    .title span{
        font-size: 1rem;
    }
    .left{
        width: 75%;
    }
    .phone-text{
        font-size: 0.8rem;
    }
    .right{
        width: 68px;
        text-align: center;
        padding: 4px 8px;
        font-size: 0.8rem;
    }
    .evaluation{
        width: 90%;
        height: auto;
        padding: 5px 5%;
    }
    .bottom{
        height: auto;
        width: 100%;
    }
    .item{
        width: 100%;
        flex-direction: column;
    }
    .left2{
        width: 100%;
    }
    .authorpic img{
        width: 2rem;
        height: 2rem;
    }
    .eva{
        width: 100%;
    }
    .gray_box{
        width: 90%;
    }
    .right2{
        width: 100%;
        justify-content: flex-end;
        height: auto;
        margin-right: 0px;
        margin-top: 0.6rem;
    }
    .right2 span:last-child{
        font-size: 0.8rem;
    }
}

</style>
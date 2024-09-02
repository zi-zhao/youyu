<template>
    <TheHeader></TheHeader>
    <div class="large-box">
        <!-- 个人信息 -->
        <div class="user-info">
            <img class="personal_bgc" src="@/assets/PersonalPage/PersonalBackground.jpg" alt="">
            <div class="user">
                <img :src="userInfo.newAvatar" alt="User Avatar" class="pic" />
                <div class="usershow">
                    <div style="display: flex;align-items: center;gap: 3px;">
                        <span class="name">{{ userInfo.username }}</span>
                        <img v-if="userInfo.verified === 1"  src="@/assets/VerifiedUser.svg" style="width: 16px;height: 16px;" alt="">
                    </div>
                    <div class="education">
                        <img src="@/assets/QACenter/EducationHat.svg" alt="">
                        <span class="utext">{{ userInfo.school }}</span>
                        <span class="utext">{{ userInfo.major }}</span>
                    </div>
                </div>
            </div>
        </div>
        <!-- 课程列表 -->
        <div class="course">
            <!-- 学校和专业选择 -->
            <div class="line-title">
                <div class="major-box">
                    <span class="select-major">已购课程<span style="margin-left: 5px;font-weight: 700;">{{ count }}</span></span>
                </div>
            </div>
            <!-- 课程 -->
            <div class="course-list">
                <div v-for="course in courseList" :key="course.id" class="co-box" @click="goToCourseDetail(course.id)">
                    <img :src="course.coverPicture" alt="" class="coverage">         
                    <div class="intro">
                        <span class="title multi-line-ellipsis-1">{{ course.title }}</span>
                        <span class="intro-text multi-line-ellipsis-3">{{ course.description }}</span>
                        <div style="width: 100%;display:flex;justify-content: space-between;">
                            <span class="price">￥{{ course.price }}</span>
                        </div>
                    </div>
                </div>
                <el-empty 
                    v-if="!courseList || courseList.length === 0" 
                    :image-size="200" 
                    description="您还没有购买的课程呢，快去看看上新好课吧！"
                    style="margin: 0 auto;"
                />
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref,onMounted } from 'vue'
import TheHeader from '@/page/components/TheHeader.vue';
import YyButton from "@/page/components/YyButton.vue";
import { Search } from '@element-plus/icons-vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import axios from '@/utils/request';
import { getUsersAvatarFromCOS } from '@/utils/cosService';
import { PageTitle } from '@/utils/fileService.js'

const setPageTitle = PageTitle('正在加载...');
const router = useRouter();
const userId = localStorage.getItem("userId"); // 获取用户ID
const userName = localStorage.getItem("userName"); // 获取用户名
const userInfo = ref({});
const courseList = ref([]);
const count = ref();

setPageTitle(`${ userName } 的已购课程 - 云联知渔`); 

// 点击跳转至课程详情
const goToCourseDetail = (courseId) =>{
    router.push(`CourseDeatil/${courseId}`)
}

// 获取用户已购买课程的信息
const fetchUserPaperVideo = async () => {
    try {
        const response = await axios.get(`/paper/video/user/list`,{
            params: {
                page:1,
                pageSize:100,
            }
        });
        if(response.data.code === 1){
            courseList.value = response.data.data.records;
        }else if(response.data.code === 0 && response.data.msg){
            ElMessage.error(response.data.msg.toString());
        }else{
            ElMessage.error('获取用户已购买课程的信息失败');
        }
    } catch (error) {
        console.error("获取用户已购买课程的信息失败", error);
        ElMessage.error('获取用户已购买课程的信息失败');
    }
};

// 获取用户信息
const fetchUserInformation = async (userId) => {
    try {
        const response = await axios.get(`/users/${userId}`);
        if(response.data.code === 1){
            userInfo.value = response.data.data;
            userInfo.value.newAvatar = await getUsersAvatarFromCOS(userId);
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

// 获取用户购买视频的个数信息
const fetchVideoCount = async () => {
    try {
        const response = await axios.get(`/paper/video/count`);
        if(response.data.code === 1){
            count.value = response.data.data;
        }else if(response.data.code === 0 && response.data.msg){
            ElMessage.error(response.data.msg.toString());
        }else{
            ElMessage.error('获取用户购买视频的个数失败');
        }
    } catch (error) {
        console.error("获取用户购买视频的个数失败", error);
        ElMessage.error('获取用户购买视频的个数失败');
    }
};


onMounted(() => {
    fetchUserPaperVideo();
    fetchUserInformation(userId);
    fetchVideoCount();
})


</script>

<style lang="scss" scoped>
.large-box {
    width: 1200px;
    margin: 2.5rem auto;
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat; 
}
.user-info{
    width: 100%;
}
.personal_bgc{
    width: 100%;
    height: 260px;;
}
.user {
    margin-top: -7rem;
    padding-left: 5rem;
    gap: 2rem;
    height: 170px;
    display: flex;
    align-items: flex-end;
}
.pic {
    width: 10rem;
    height: 10rem;
    border-radius: 8px;
    margin-bottom: 1rem;
    border: 0.2rem solid #fff;
}
.usershow {
    display: flex;
    align-items: flex-end;
    gap: 1rem;
}
.name {
    color: #000;
    text-align: center;
    font-size: 22px;
    white-space: nowrap;
    font-weight: 700;
}
.education{
    display: flex;
    align-items: center;
    gap: 0.5rem;
}
.utext {
    color: #000;
    font-size: 14px;
}
.course{
    width: 100%;
    margin-top: 2rem;
}
.line-title{
    width: 100%;
    padding: 1rem 0;
    justify-content: space-between;
    display: flex;
}
.major-box{
    border-bottom: 1px solid #EEE;
    padding: 0 0 calc(1rem + 1px);
    width: 100%;
    height: 1.5rem;
    overflow-x: auto;
    overflow-y: hidden;
    white-space: nowrap;
    scrollbar-width: thin; /* 对于 Firefox */
    scrollbar-color: #EEE transparent; /* 对于 Firefox，设置滚动条颜色和背景 */

    /* 对于基于 WebKit 的浏览器 */
    &::-webkit-scrollbar {
        height: 1px; /* 设置滚动条高度 */
    }
    &::-webkit-scrollbar-track {
        background: transparent; /* 设置滚动条轨道背景颜色 */
        background-color: #EEE;
    }
    &::-webkit-scrollbar-thumb {
        background-color: #EEE; /* 设置滚动条颜色 */
    }
}
.select-major{
    margin-left: 2rem;
    display: inline-flex;
    height: 1.5rem;
    padding: 0 0 1rem;
    color: #00A6DA;
    border-bottom: 1px solid #00A6DA;
    cursor: pointer;
}
.course-list{
    width: 100%;
    display: flex;
    gap: 2rem calc((100% - 10px - 90%)/4);
    flex-wrap: wrap;
    margin-top: 2rem;
}
.co-box{
    border-radius: 0.3rem;
    border: 1px solid #e9e9e9;
    width: 18%;
    height: 290px;
    cursor: pointer;
}
.coverage{
    width: 100%;
    border-radius: 0.3rem 0.3rem 0 0;
    height: 45%;
    border-bottom: 1px solid #e9e9e9;
}
.title{
    font-weight: 700;
}
.intro{
    width: 88%;
    height: calc(100% - 45% - 2rem);
    padding: 1rem 6%;
    gap: 0.5rem;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}
.intro-text{
    font-size: 0.8rem;
    color: #706969;
    line-height: 1.4;
    height: 42%;
}
.price{
    font-size: 0.8rem;
    color: #FFC960;
}
@media (max-width:768px){
    .large-box{
        width: 100%;
    }
    .personal_bgc{
        height: 190px;
    }
    .user{
        margin-top: -3.5rem;
        padding-left: 4%;
        gap: 1rem;
        height: auto;
        flex-direction: column;
        align-items: flex-start;
    }
    .pic{
        width: 4rem;
        height: 4rem;
        border-radius: 8px;
        margin-bottom: 0rem;
        border: 0.1rem solid #fff;
    }
    .usershow{
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;
    }
    .name{
        font-size: 1rem;
    }
    .course{
        margin-top: 1rem;
    }
    .select-major{
        margin-left: 6%;
    }
    .course-list{
        gap: 2rem 3rem;
        margin-top: 0rem;
        justify-content: center;
    }
    .co-box{
        width: 255px;
        height: 300px;
    }
}
</style>

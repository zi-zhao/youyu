<template>
    <TheHeader></TheHeader>
    <div class="large-box">
        <!-- 顶部个人信息+上新课程 -->
        <div class="top">
            <div class="person">
                <div class="userinfo">
                    <img :src="user.newAvatar" alt="">
                    <div style="display: flex;align-items: center;gap: 3px;">
                        <div class="username">{{ userName }}</div>
                    </div>
                </div>
                <div class="pur-cour">
                    <div class="purchase-course">
                        <span>已购课程</span>
                        <span>{{ count }}</span>
                    </div>
                    <YyButton theme="purple" @click="goToPurchasedCourse" class="purple-btn">查看已购课程</YyButton>
                </div>
            </div>
            <div class="carousel-box">
                <el-carousel trigger="click" style="height: 100%;box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.25);">
                    <el-carousel-item v-for="topVideo in topVideoList" :key="topVideo.id">
                        <div style="height: 100%;">
                            <img :src="topVideo.coverPicture" alt="" class="news-bgi">
                            <div class="news-text">
                                <div class="text1">课程上新</div>
                                <div class="text2" @click="goToCourseDetail(topVideo.id)">点击查看</div>
                                <div class="text3">{{ topVideo.createTime }}</div>
                            </div>
                        </div>
                    </el-carousel-item>
                </el-carousel>
            </div>
        </div>
        <!-- 课程列表 -->
        <div class="course">
            <!-- 学校和专业选择 -->
            <div class="line-title">
                <el-select v-model="value" class="m-2" placeholder="请选择您的学校">
                    <el-option
                    v-for="school in schoolOptions"
                    :key="school.name"
                    @click="handleSchoolClick(school.id,school.name )"  
                    :label="school.name"
                    :value="school.name"
                    />
                </el-select>
                <div class="major-box">
                    <span 
                        v-for="subject in subjectOptions" 
                        :key="subject.id"  
                        @click="handleSubjectClick(subject.id,subject.subject )"  
                        :class="{ 'selected': subject.id ===  selectedSubjectId}" 
                        class="select-major"
                    >
                        {{ subject.subject }}
                    </span>
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
                            <span class="person-num">{{ course.saleCount }}人购买</span>
                            <span class="price">￥{{ course.price }}元</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref,onMounted } from 'vue'
import TheHeader from '@/page/components/TheHeader.vue'
import YyButton from "@/page/components/YyButton.vue";
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import axios from '@/utils/request';
import { getUsersAvatarFromCOS } from '@/utils/cosService';

const router = useRouter();
const value = ref('');
const userId = localStorage.getItem("userId"); // 获取用户ID
const userName = localStorage.getItem("userName"); // 获取用户ID
const schoolOptions = ref([]);
const subjectOptions = ref([]);
const courseList = ref([]);
const selectedSchoolId = ref();
const selectedSchoolName = ref();
const selectedSubjectId = ref();
const selectedSubjectName = ref();
const user = ref({});
const count= ref();
const topVideoList = ref([]);


//点击选择学校
const handleSchoolClick = (schoolId,schoolName) => {
    selectedSchoolId.value = schoolId ;
    selectedSchoolName.value = schoolName;
    getSubjectOptions(schoolId);
}

//点击选择学科
const handleSubjectClick = (subjectId,subjectName) => {
    selectedSubjectId.value = subjectId;
    selectedSubjectName.value =subjectName;
    getPaperVideoOptions();
}


// 点击跳转至课程详情
const goToCourseDetail = (courseId) =>{
    router.push(`/CourseDetail/${courseId}`)
}

// 点击跳转至已购买的课程
const goToPurchasedCourse = () =>{
    router.push('/PurchasedCourse')
}

//获取所有学校数据
async function getSchoolOptions() {
    courseList.value = [];
    subjectOptions.value =[];
    try {
        const response = await axios.get('/school/list',{
            params: {
            currentPage:1,
            pageSize:100,
            }
        });
        if(response.data.code === 1){
        schoolOptions.value = response.data.data.records;
        value.value =  schoolOptions.value[0].name;
        selectedSchoolName.value = schoolOptions.value[0].name;
        await getSubjectOptions( schoolOptions.value[0].id);
        }else{
            console.error("获取所有学校数据失败");
            ElMessage.error("获取所有学校数据失败");
        }
    } catch (error) {
        console.error("获取所有学校数据失败", error); 
        ElMessage.error("获取所有学校数据失败");
    }
}

//获取学校对应的学科接口
async function getSubjectOptions(schoolId) {
    courseList.value = [];
    try {
        const response = await axios.get(`/subject/list`,{
            params: {
                schoolId:schoolId,
                currentPage:1,
                pageSize:100,
            }
        });
        if(response.data.code === 1){
        subjectOptions.value = response.data.data.records;
        selectedSubjectId.value = subjectOptions.value[0].id;
        selectedSubjectName.value = subjectOptions.value[0].subject;
        await getPaperVideoOptions();
        }else{
            console.error("获取学校对应的学科接口失败");
            ElMessage.error("获取学校对应的学科接口失败");
        }
    } catch (error) {
        console.error("获取学校对应的学科接口失败", error); 
        ElMessage.error("获取学校对应的学科接口失败");
    }
}

//获取学科对应的视频数据接口
async function getPaperVideoOptions() {
  try {
    const response = await axios.get(`/paper/video/list`,{
        params: {
            university:selectedSchoolName.value,
            subject:selectedSubjectName.value,
            page:1,
            pageSize:100,
        }
      });
    if (response.data.code === 1) {
      courseList.value = response.data.data.records.map(record => ({
        ...record,
        price: record.price / 100  // 转换价格
      }));
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

// 获取用户信息
const fetchAvatar = async () => {
    try {
        const response = await axios.get(`/users/${userId}`);
        if(response.data.code === 1){
            user.value = response.data.data;
            user.value.newAvatar = await getUsersAvatarFromCOS(userId);
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

// 获取置顶视频的信息
const fetchTopVideo = async () => {
    try {
        const response = await axios.get(`/paper/video/top/list`);
        if(response.data.code === 1){
            topVideoList.value = response.data.data;
            // for(let record in topVideoList.value){
            //     const url = 'https://youyu-bucket-video4paper-visible-test-1319554411.cos.ap-chengdu.myqcloud.com/';
            //     record.coverPicture = url + record.coverPicture;
            // }
        }else if(response.data.code === 0 && response.data.msg){
            ElMessage.error(response.data.msg.toString());
        }else{
            ElMessage.error('获取置顶视频失败');
        }
    } catch (error) {
        console.error("获取置顶视频失败", error);
        ElMessage.error('获取置顶视频失败');
    }
};


onMounted(() => {
    fetchTopVideo();
    getSchoolOptions();
    fetchVideoCount();
    fetchAvatar();
});


</script>

<style>
body{
    background: #F8F8F8;
}
</style>
<style lang="scss" scoped>
.large-box{
    width: 1200px;
    margin: 3.5rem auto 0;
}
.top{
    width: 100%;
    display: flex;
    justify-content: space-between;
}
.person{
    width: 15%;
    height: 50vh;
    background-color: #fff;
    padding: 1.5rem 3%;
    border-radius: 0.5rem;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 2rem;
}
.userinfo,
.pur-cour{
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2rem;
}
.person img{
    width: 3rem;
    height: 3rem;
    border-radius: 50%;
}
.purchase-course{
    display: flex;
    align-items: center;
    gap: 1rem;
}
.purchase-course span{
    color: #706969;
    font-size: 0.8rem;
}
.purple-btn{
    width: 120px;
    padding: 0.3rem 0.2rem;
}
.carousel-box{
    width: 75%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}
:deep .el-carousel__container{
    height: 100%;
}
.news-bgi{
    position: relative;
    width: 100%;
    height: 100%;
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
}
.news-text{
    display:flex;
    flex-direction: column;
    gap: 1rem;
    position: absolute;
    left: 4rem;
    top: 2rem;
    padding: 1rem 5rem 1rem 3rem;
    background-image: url('@/assets/TheVideo/NewsBlackbd.jpg');
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
}
.text1{
    font-size: 2rem;
    color: #ffffff;
}
.text2{
    font-size: 1rem;
    color: #5ab6d3;
    cursor: pointer;
}
.text3{
    font-size: 0.8rem;
    color: #aeaeae;
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
    width: 80%;
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
}
.select-major.selected,
.select-major:hover{
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
.person-num{
    font-size: 0.8rem;
    color: #00A6DA;
}
.price{
    font-size: 0.8rem;
    color: #FFC960;
}
@media (max-width:768px){
    .large-box{
        width: 100%;
        margin: 3.5rem auto 0;
    }
    .top{
        flex-direction: column;
    }
    .carousel-box{
        order: 1;
        width: 100%;
        height: 50vh;
    }
    .person{
        order:2;
        width: 94%;
        height: 10vh;
        justify-content: space-between;
        gap: 0;
    }
    .userinfo,
    .pur-cour{
        width: 100%;
        display: flex;
        flex-direction: row;
        align-items: center;
    }
    .userinfo{
        justify-content: flex-start;
        gap: 0.5rem;
    }
    .pur-cour{
        justify-content: flex-end;
        gap: 0.8rem;
    }
    .person img{
        width: 2rem;
        height: 2rem;
    }
    .purchase-course{
        gap: 0.5rem;
    }
    .purple-btn{
        margin: 0;
        font-size: 0.8rem;
        width: 90px;
    }
    .line-title{
        flex-direction: column;
        gap: 1rem;
    }
    .el-select.m-2 {
        width: 85%;
        margin: 0 auto;
    }
    .major-box{
        width: 100%;
    }
    .select-major{
        margin-left: 1rem;
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
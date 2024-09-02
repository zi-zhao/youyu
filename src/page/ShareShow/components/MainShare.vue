<template>
    <div class="large">
        <div class="main"  v-infinite-scroll="load" infinite-scroll-distance="100" infinite-scroll-immediate="false">  
            <div v-for="(entry, index) in entries" :key="index" class="show">
                <!-- 用户头像+名称+时间+发表了动态 -->
                <div class="user">
                    <div class="userPhoto">
                    <img :src="entry.authorAvatar" alt="User Avatar" />
                    </div>
                    <div class="userInfo">
                        <div class="userDetails">
                            <div style="display: flex;align-items: center;gap: 3px;">
                                <span class="name">{{ entry.username }}</span>
                                <img v-if="entry.verified === 1" src="@/assets/VerifiedUser.svg" style="width: 16px;height: 16px;" alt="">
                            </div>
                        </div>
                        <div class="userActivity">
                            <span class="time">{{ entry.postTime }}</span>
                            <span class="time">发表了动态</span>
                        </div>
                    </div>
                </div>
                <!-- 分享标题 -->
                <div class="title">
                    <h1 style="margin: 50px 0px 30px;">{{ entry.title }}</h1>
                </div>
                <!-- 分享内容 -->
                <div  class="content-wrapper" >
                    <p @click="openShareDialog(entry.id)" :class="{ 'limited': entry.needsExpansion }" class="content">
                        {{ entry.content }}
                    </p>
                    <button 
                        v-if="entry.showExpansion" 
                        @click= "entry.needsExpansion = !entry.needsExpansion"
                        class="expand-btn"
                    >
                        {{ entry.needsExpansion ? '展开':'折叠'   }}
                    </button>
                </div>
                <!-- 标签展示区域 -->
                <div class="rlable">
                <div class="buttons-container">
                    <button v-for="label in entry.labelsArray" :key="label" class="tag-btn">#{{ label }}</button>
                </div>
                </div>

                <!-- Swiper 组件，用于图片轮播 :autoplay="{delay: 200,disableOnInteraction: false}"-->
                <!-- 图片个数为1或2或3 盒子位于文字右侧-->
                <div  @click="openShareDialog(entry.id)" class="case_1" v-if="entry.extractedImages && entry.extractedImages.length > 0 && entry.extractedImages.length < 4">
                    <el-carousel :height="height" :autoplay="false" indicator-position="outside">
                        <el-carousel-item v-for= "(image, imgIndex) in entry.extractedImages" :key="imgIndex"> 
                            <img :src="image" class="carousel-image_1" alt="Image" />
                        </el-carousel-item>
                    </el-carousel>
                </div>
                <!-- 图片个数为4 盒子位于文字下侧，不使用swiper-->
                <div  @click="openShareDialog(entry.id)" class="case_2" v-if="entry.extractedImages && entry.extractedImages.length === 4">
                    <div class="picture_contain">
                        <div class="everyPic" v-for= "(image, imgIndex) in entry.extractedImages" :key="imgIndex">
                            <img :src="image" class="carousel-image_2" alt="Image" />
                        </div>
                    </div>
                </div>
                <!-- 图片个数大于4 盒子位于文字下侧，使用swiper-->
                <div @click="openShareDialog(entry.id)" class="case_3" v-if="entry.extractedImages && entry.extractedImages.length > 4">
                    <swiper 
                        :slidesPerView=5
                        :spaceBetween=100
                        :navigation="navigation"
                        loop = true
                        :centeredSlides="false"
                        :modules="modules"
                        :id="`swiper-${index}`" 
                    >
                        <swiper-slide v-for= "(image, imgIndex) in entry.extractedImages" :key="imgIndex">
                            <img :src="image" class="carousel-image_3" alt="Image" />
                        </swiper-slide>
                        <div class="swiper-button-prev" @click.stop='prevEl'><i class="fas fa-chevron-left"></i></div>
                        <div class="swiper-button-next" @click.stop='nextEl'><i class="fas fa-chevron-right"></i></div>
                    </swiper>  
                </div>
                <!-- 点赞、评论和转发数量 -->
                <div class="icons-container">
                    <!-- 点赞盒子 -->
                    <div class="icon-wrapper">
                        <img class="like-pic"  :src=" entry.likeStatus === 0 ? unlikedImage : likedImage " @click="toggleLike(entry.likeStatus,entry.id)">
                        <span class="like_num">{{ entry.likeCount }}</span>
                    </div>
                    <div class="icon-wrapper"  @click= "entry.showComments = !entry.showComments">
                        <img class="like-pic" src="@/assets/Comment.svg">
                        <span class="like_num">{{ entry.commentCount }}</span>
                    </div>
                    <!-- 收藏盒子 -->
                    <div class="icon-wrapper">
                        <img class="like-pic"  v-if=" entry.favoriteStatus === 0 " src="@/assets/FavoriteBefore.svg" @click="handleUpdateShare(entry.id)">
                        <img class="like-pic" v-if=" entry.favoriteStatus === 1 " src="@/assets/FavoriteAfter.svg" >
                        <span class="like_num">{{ entry.favoriteCount }}</span>
                    </div>
                    <div v-if="dialogFormVisible">
                        <CfDialog  v-model="dialogFormVisible" @updateValue="handleUpdateValue" ClassifyName="分享收藏"></CfDialog>
                    </div>
                    <!-- <div class="cri">
                        <img class="like-pic" src="@/assets/Transpond.svg">
                        <span class="like_num">{{ entry.transmitCount }}</span>
                    </div> -->
                    <div class="report" @click="handleReportShare(entry.id)">
                        <img src="@/assets/Report.svg" alt="" style="width: 16px;height: 16px;">
                        <span>举报</span>
                    </div>
                    <div v-if="dialogVisible">
                        <AreportedDialog v-model="dialogVisible" :type="type" :id="reportedShareId" ></AreportedDialog>
                    </div>
                </div>
                <div style="width: 100%;">
                    <ShareCommentL v-if="entry.showComments" 
                        :shareId = "entry.id"
                        :shareAuthorId = "entry.userId"
                        :shareAuthorName = "entry.username"
                        :shareTitle = "entry.title">
                    </ShareCommentL>
                </div>
            </div>    
        </div>
        <div v-if="dialogShowVisible">
            <ShareDialog v-model="dialogShowVisible" :Id = "tempShareId"></ShareDialog>
        </div>
    </div>
</template>
    
<script setup>
import { ref, onMounted,watch} from 'vue';
import axios from '@/utils/request';
import {Swiper, SwiperSlide} from 'swiper/vue'; // swiper所需组件
// 这是分页器和对应方法，swiper好像在6的时候就已经分离了分页器和一些其他工具
import {Autoplay, Navigation, Pagination, A11y} from 'swiper';
// 引入swiper样式，对应css 如果使用less或者css只需要把scss改为对应的即可
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { fetchShareCoverage } from '@/utils/fileService';
import ShareCommentL from './ShareCommentL.vue';
import CfDialog from '@/page/components/CfDialog';
import { ElMessage } from 'element-plus';
import AreportedDialog from '@/page/components/AreportedDialog.vue';
import ShareDialog from './ShareDialog.vue';
import { getUsersAvatarFromCOS } from '@/utils/cosService';

// 点赞部分的动画toggleLike
import unlikedImage from '@/assets/LikeBefore.svg';
import likedImage from '@/assets/LikeAfter.svg';

const currentPage = ref(1);
const user_id = localStorage.getItem("userId"); // 获取用户ID
const modules = [Autoplay, Pagination, Navigation, A11y];
const navigation = ref({
    nextEl: '.swiper-button-next',
    prevEl: '.swiper-button-prev',
})
const entries = ref([]);//存放分享列表的数据
const limitWord = ref(150);//设置分享在不展开的情况下显示内容的上限
const dialogFormVisible = ref(false);//控制cfdialog弹窗（显示分享收藏列表）是否弹出
const favoriteId = ref();//用户选择的收藏的ID
const tempShareId = ref();
const tempShareId2 = ref();
const dialogVisible = ref(false);//控制文章举报弹框是否显示
const reportedShareId = ref();//举报弹窗传入的Id
const dialogShowVisible = ref(false)//控制分享展示弹框是否展示
const type = 1;

const openShareDialog = (id) =>{
    tempShareId.value = id;
    dialogShowVisible.value = true
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
        await fetchData(currentPage.value);
        currentPage.value++; // 只有在请求成功完成后才递增页码
    } catch (error) {
        console.error(error);
        ElMessage.error('滚动时的未知错误');
    } finally {
        isLoading = false; // 请求完成，无论成功或失败，都释放锁状态
    }
}

//获取分享信息
const fetchData = async (currentPage) => {
    try {
        const response = await axios.get('/share/list', {
            params: {
                pageSize: 10,
                currentPage: currentPage,
            }
        });
        if (response.data.code === 1 && response.data.data.records.length > 0) {
            const updates = response.data.data.records.map(async (record) => {
            const extractedImagesPromise = fetchShareCoverage(record.id);
            const authorAvatarPromise = getUsersAvatarFromCOS(record.userId);
            const verified = await fetchUserInformation(record.userId);
            const likeStatus = await determineImage(1, record.id);
            const favoriteStatus = await deterFavorite(record.id);
            const [extractedImages, authorAvatar] = await Promise.all([extractedImagesPromise, authorAvatarPromise]);
            return {
                ...record,
                verified,
                likeStatus,
                extractedImages,
                favoriteStatus,
                authorAvatar,
                showMoreButtonVisible: checkShowMoreButtonVisible(extractedImages),
                needsExpansion: checkContentOverflow(record.content),
                showExpansion: checkContentOverflow(record.content),
                lessContent: record.content.slice(0, limitWord.value),
                labelsArray: record.label.split(',').map(item => item.trim()),
                showComments: false,
            };
        });
        const updatedEntries = await Promise.all(updates);
        entries.value = [...entries.value, ...updatedEntries];
        }else if (response.data.code === 1 && response.data.data.records.length === 0) {
            // ElMessage.info('已加载所有数据');
        }else if(response.data.code === 0 && response.data.msg){
            ElMessage.error(response.data.msg.toString());
        }
    } catch (error) {
        console.error('接口请求失败', error);
    }
};

//点击打开举报弹窗
async function handleReportShare(shareId){
    reportedShareId.value = shareId;
    dialogVisible.value = true;
    await fetchShareRead(shareId);
}

//点击打开分享弹窗
async function handleUpdateShare(shareId){
    tempShareId2.value = shareId;
    dialogFormVisible.value = true;
    await fetchShareRead(shareId);
}
//接受cfdialog返回的数据，从而确定收藏Id
const handleUpdateValue = (data) => {
    favoriteId.value = data[0];
}

//分享收藏相关接口
async function toggleFavorite(shareId) {
    try {
        const response = await axios.post(`/favorite/share`,{favoriteId: favoriteId.value, contentId: shareId });
        if ( response.data.code === 1) {
            let entryToUpdate = entries.value.find(entry => entry.id === shareId);
            if (entryToUpdate) {
                entryToUpdate.favoriteStatus = 1; 
                entryToUpdate.favoriteCount =  response.data.data;
            }
            console.log('分享收藏成功');
            await fetchShareRead(shareId);
        } else if(response.data.code === 0 && response.data.msg){
            ElMessage.error(response.data.msg.toString());
        }else {
            console.error(response.data.msg || 'Unknown error');
            ElMessage.error('分享收藏失败');
        }
    } catch (error) {
    console.error('分享收藏成功', error.message);
    ElMessage.error('分享收藏成功');
    }
}


// 使用 watch 来监听 favoriteId 的变化
watch(favoriteId, (newVal, oldVal) => {
    if (newVal !== oldVal) {
    toggleFavorite( tempShareId2.value);
    }
});

//判断收藏状态
async function deterFavorite(id) {
    try {
        const response = await axios.get(`/favorite/share/${id}`)
        if ( response.data.code === 1) {
            return response.data.data;
        } else if(response.data.code === 0 && response.data.msg){
            ElMessage.error(response.data.msg.toString());
        }else {
            console.error(response.data.msg || 'Unknown error');
        }
    } catch (error) {
        console.error('获取点赞状态失败', error.message);
        ElMessage.error('获取收藏状态失败');
    }
}

//判断点赞状态
async function determineImage(type,id) {
    try {
        const response = await axios.get(`/like/state`,{
            params: {
                id: id,
                type: type,
            }
        });
        if (response.data.code === 1) {
            return (response.data.data);
        } else if(response.data.code === 0 && response.data.msg){
            ElMessage.error(response.data.msg.toString());
        }else {
            console.error(response.data.msg || 'Unknown error');
            ElMessage.error('获取点赞状态失败');
        }
    } catch (error) {
    console.error('获取点赞状态失败', error.message);
    }
}
  
//点赞相关方法
async function toggleLike(likeStatus,shareId) {
    try {
        const config = likeStatus === 0
            ? {
                method: 'put',
                url: `/share/like`,
                data: { userId: user_id , shareId: shareId}
            }
            : {
                method: 'delete',
                url: `/share/unlike`,
                data: { userId: user_id , shareId: shareId}
            };
        const response = await axios(config);
        if ( response.data.code === 1) {
            let entryToUpdate = entries.value.find(entry => entry.id === shareId);
            if (entryToUpdate) {
                entryToUpdate.likeStatus = entryToUpdate.likeStatus === 0 ? 1 : 0;
                entryToUpdate.likeCount =  response.data.data;
            }
            await fetchShareRead(shareId);
        } else if(response.data.code === 0 && response.data.msg){
            ElMessage.error(response.data.msg.toString());
        }else {
            console.error(response.data.msg || 'Unknown error');
            ElMessage.error('点赞操作失败');
        }
    } catch (error) {
        console.error('获取点赞状态失败', error.message);
    }
}

//说实话，我也不知道这两个函数的真实作用，但是删了会出问题，算了，能跑就行
const prevEl = () => {
    console.log('1');
};
const nextEl = () => {
    console.log('1');
};

//判断该分享的内容是否需要展开收回（写到接口方法里显得太臃肿了所以提出来了）
const checkContentOverflow = (content) => {
    if (content.length > limitWord.value) {
        return true;
    }
}

//判断该分享是否需要展示轮播箭头（写到接口方法里显得太臃肿了所以提出来了）
const checkShowMoreButtonVisible = (extractedImages) => {
    if (extractedImages.length > 4) {
        return true;
    }
}

// 分享的阅读接口
const fetchShareRead = async (id) => {
    try {
        const response = await axios.post(`/share/read/${id}`);
        if(response.data.code === 1){
            console.log('HAHAHA');
        }else if(response.data.code === 0 && response.data.msg){
            ElMessage.error(response.data.msg.toString());
        }else{
            ElMessage.error('获取分享的阅读接口失败');
        }
    } catch (error) {
        console.error("获取分享的阅读接口失败", error);
        ElMessage.error('获取分享的阅读接口失败');
    }
};


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
    fetchData(currentPage.value) ;
})

</script>
    
    
<style scoped>
    .large{
        width: 100%;
        background-color: rgb(250 250 250);
    }
    .main{
        width: 1130px; 
        margin: 40px auto 0 auto;
        border: 1px solid #e5e7eb;
        background-color: #fff
    
    }
    .show{
        margin-top: 40px;
        display: flex;
        padding: 20px 55px;
        flex-direction: column;
        justify-content: center;
        align-items: flex-start;
        gap: 8px;
        border-radius: 16px;
        background: #FFF;
        position: relative;
    }
    .user {
        display: flex;
        align-items: center;
    }   
    .userPhoto{
      width: 64px;
      height: 64px;
      border-radius: 100%;
      overflow: hidden;     
    }
    .userPhoto img{
      width: 100%;
      height: 100%;
    }    
    .userInfo {
        display: flex;
        flex-direction: column; 
        margin-left: 10px;
    }
    .userDetails, .userActivity {
        margin: 10px 0px 0px 11px;  
        display: flex;
        align-items: center;
        gap: 10px; 
    }
    .name{
        color: #000;
        text-align: center;
        font-family: -apple-system,BlinkMacSystemFont,Helvetica Neue,PingFang SC,Microsoft YaHei,Source Han Sans SC,Noto Sans CJK SC,WenQuanYi Micro Hei,sans-serif;
        font-size: 20px;
        font-style: normal;
        font-weight: 700;
        line-height: 120%; 
    }
    .time{
        color: #666666;
        text-align: center;
        font-family: -apple-system,BlinkMacSystemFont,Helvetica Neue,PingFang SC,Microsoft YaHei,Source Han Sans SC,Noto Sans CJK SC,WenQuanYi Micro Hei,sans-serif;
        font-size: 14px;
        font-style: normal;
        font-weight: 400;
        line-height: 120%; 
    }
    .title{
        width: 670px;
        height: auto;
    }
    .title h1{
        color: #000;
        font-family: -apple-system,BlinkMacSystemFont,Helvetica Neue,PingFang SC,Microsoft YaHei,Source Han Sans SC,Noto Sans CJK SC,WenQuanYi Micro Hei,sans-serif;
        font-size: 40px;
        font-style: normal;
        font-weight: 700;
        line-height: 100%; 
    }
    .content-wrapper {
        position: relative;
        width: 670px;
        min-height: 75px;
        margin-bottom: 20px;
    }
    .content{
        color: #000;
        font-family: -apple-system,BlinkMacSystemFont,Helvetica Neue,PingFang SC,Microsoft YaHei,Source Han Sans SC,Noto Sans CJK SC,WenQuanYi Micro Hei,sans-serif;
        font-size: 16px;
        line-height: 1.6; 
        overflow: hidden;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        position: relative;
    }
    .content.limited {
        -webkit-line-clamp: 5;
    }
    .expand-btn {
        position: absolute;
        bottom: 0px;
        right: 0;
        background-color: rgba(255, 255, 255, 0.7); 
        border: none;
        cursor: pointer;
        color: #2A7FE4;
        font-family: -apple-system,BlinkMacSystemFont,Helvetica Neue,PingFang SC,Microsoft YaHei,Source Han Sans SC,Noto Sans CJK SC,WenQuanYi Micro Hei,sans-serif;
        font-size: 14px;
        font-style: normal;
        font-weight: 400;
        line-height: 120%; 
    }   
    .buttons-container {
      display: flex;       
      gap: 15px;     
    }
    .tag-btn{
        display: flex;
        padding: 4px 10px;
        justify-content: center;
        align-items: center;
        letter-spacing: 1px;
        gap: 10px;
        border-radius: 16px;
        border: 1px solid #A6A6A6;
        background: #fff;
        color: #5467a5;
        backdrop-filter: blur(10px);
    }
    .icons-container {
        display: flex;
        gap: 25px;
        width: 710px;
        margin: 20px 0px 40px;
        position: relative;
    }
    .icons-container:hover .report{
        visibility: visible;
    }
    .icon-wrapper {
        display: flex;
        gap: 3px;
        text-align: center;
        margin: 0 10px;      
    }

    .like-pic {
        display: block;    
        margin: auto;      
        height: 20px;
        width: 20px;
        cursor: pointer;
    }
    .like_num {
        text-align: center;
        display: contents;
        font-size: 14px;
        color: #2d2d2d;
    }
    .report{
        visibility: hidden;
        display: flex;
        align-items: center;
        gap: 5px;
        cursor: pointer;
        position: absolute;
        right: 0px;
    }
    .report span{
        color: #9B9B9B;
        font-size: 14px;
    }
    .case_1{
        position: absolute;
        width: 288px;
        height: 310px;
        top: 90px;
        right: 55px;
    }
    .case_2,
    .case_3{
        height: 330px;
        width: 1570px;
        position: relative;
        display: flex;
        justify-content: center;
        left: -275px;
        margin: 40px 0px 20px;
    }
    ::v-deep .el-carousel__container{
        height: 310px;
    }
    .picture_contain{
        display: flex;
        gap: 32px;
    }
    ::v-deep .swiper{
        padding: 10px;
    }
     ::v-deep .swiper .swiper-wrapper > *{
        width: 288px!important;
        margin-right: 32px!important;
    }
    .carousel-image_1,
    .carousel-image_2,
    .carousel-image_3 {
        width: 288px;
        height: 310px;
        margin: 0 auto;
        display: block;
        border-radius: 15px;
    }
    ::v-deep .swiper-slide:nth-child(5n+1),
    .everyPic:nth-child(5n+1) {
        transform: rotate(2deg);
    }
    ::v-deep .swiper-slide:nth-child(5n+2),
    .everyPic:nth-child(5n+2) {
        transform: rotate(-2deg); 
    }
    ::v-deep .swiper-slide:nth-child(5n+3),
    .everyPic:nth-child(5n+3) {
        transform: rotate(2deg); 
    }
    ::v-deep .swiper-slide:nth-child(5n+4),
    .everyPic:nth-child(5n+4) {
        transform: rotate(-2deg); 
    }

    ::v-deep .swiper-slide:nth-child(5n),
    .everyPic:nth-child(5n) {
        transform: rotate(2deg); 
    }
    .swiper-button-prev,
    .swiper-button-next,
    .swiper-button-close {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        cursor: pointer;
        font-size: 24px;
        z-index: 2;
        color: rgb(63, 56, 56);
    }
    .swiper-button-prev {
        left: 160px;
    }
    .swiper-button-next {
        right: 160px;
    }
    .swiper-button-close {
        top: 10px;
        right: 160px;
    }
    </style>

    
<template>
    <div>
        <div class="first">
            <div class="one">
                <img src="@/assets/MessageCenter/MyFocus.svg" alt="">
                <span>关注列表</span>
            </div>
            <div>
                <el-checkbox v-model="checked1" label="发表文章" size="large" @change="change"/>
                <el-checkbox v-model="checked2" label="发表分享" size="large" @change="change"/>
            </div>
            <div class="container">
                <!-- <div class="arrow-left" @click="moveLeft">
                    <img src="@/assets/MessageCenter/left.svg" alt="">
                </div> -->
                <div style="display: flex;flex-direction: column;align-items: center;margin-bottom: 10px;">
                    <div class="circle-box">
                        <img class="small-image" src="@/assets/MessageCenter/one.svg" @click="getAll(currentPageAllPerson)" alt="">
                    </div>
                    <span class="all" @click="getAll(currentPageAllPerson)">全部动态</span>
                </div>
                <div class="slide">
                    <div  class="image-list" :style="`transform: translateX(-${data}px)`">
                        <div v-for="(source,index) in focusMeUser" :key="index">
                            <img :src=source.newAvatar alt="" @click="clickToGetOnePerson(source.starId)">
                            <span>{{ source.username }}</span>
                        </div>
                    </div>    
                </div>
                <!-- <div class="arrow-right" @click="moveRight">
                    <img src="@/assets/MessageCenter/right.svg" alt="">
                </div> -->
            </div>
        </div>
        <div class="then" v-infinite-scroll="load" infinite-scroll-distance="100" infinite-scroll-immediate="false">
            <div v-for="(source,index) in focusMeNotification" :key="index" class="box">
                <!-- 发表文章 -->
                <div v-if="source.type === 0" class="large" @click="goToDetail(source)">
                    <div class="top">
                        <img :src=source.newAvatar alt="" class="cover">
                        <div class="top_right">
                            <div style="display: flex;align-items: center;margin-bottom: 5px;">
                                <span class="name">{{ source.username }}</span>
                                <img  v-if="source.verified === 1" src="@/assets/VerifiedUser.svg" style="width: 16px;height: 16px;margin-left: -9px;" alt="">
                            </div>
                            <div >
                                <span class="middle">发布了文章</span>
                                <span class="time">{{ source.createTime }}</span>
                            </div>
                        </div>
                    </div>
                    <div class="text">
                        <img :src=source.newCoverPicture alt="" class="aritle_cover">
                        <div style="display: flex; flex-direction: column; position: relative;width: 65%;cursor: pointer;">
                            <span class="article_title">{{ source.title }}</span>
                            <span class="article_content">{{ source.summary }}</span>
                            <div class="icons">
                                <div class="everyitem">
                                    <img src="@/assets/LikeBefore.svg" alt="" class="everyicon">
                                    <span>{{ source.likeCount }}</span>
                                </div>
                                <div class="everyitem">
                                    <img src="@/assets/FavoriteBefore.svg" alt="" class="everyicon">
                                    <span>{{ source.favoriteCount }}</span>
                                </div>
                                <div class="everyitem">
                                    <img src="@/assets/Comment.svg" alt="" class="everyicon">
                                    <span>{{ source.commentCount }}</span>
                                </div>
                                <div class="everyitem">
                                    <img src="@/assets/Transpond.svg" alt="" class="everyicon">
                                    <span>{{ source.transmitCount }}</span>
                                </div>
                            </div>
                        </div>
                    </div>                    
                </div>  
                <!-- 发表分享 -->
                <div v-if="source.type === 1" class="large" @click="goToDetail(source)">
                    <div class="top">
                        <img :src=source.newAvatar alt="" class="cover">
                        <div class="top_right">
                            <div style="display: flex;align-items: center;margin-bottom: 5px;">
                                <span class="name">{{ source.username }}</span>
                                <img  v-if="source.verified === 1" src="@/assets/VerifiedUser.svg" style="width: 16px;height: 16px;margin-left: -9px;" alt="">
                            </div>
                            <div >
                                <span class="middle">发布了分享</span>
                                <span class="time">{{ source.createTime }}</span>
                            </div>
                        </div>
                    </div>
                    <div class="text2">
                        <div style="display: flex; flex-direction: column;width: 95%;cursor: pointer;" >
                            <span class="share_title">{{ source.title }}</span>
                            <span class="share_content multi-line-ellipsis-4">{{ source.content }}</span>
                        </div>
                        <div  class="pic-container">
                            <img :src='image' v-for= "(image, imgIndex) in source.newCoverPicture.slice(0, 4)"  :key="imgIndex" alt="Share Image" class="pic">
                        </div>
                        <div class="icons2">
                            <div class="everyitem">
                                <img src="@/assets/LikeBefore.svg" alt="" class="everyicon">
                                <span>{{ source.likeCount }}</span>
                            </div>
                            <div class="everyitem">
                                <img src="@/assets/FavoriteBefore.svg" alt="" class="everyicon">
                                <span>{{ source.favoriteCount }}</span>
                            </div>
                            <div class="everyitem">
                                <img src="@/assets/Comment.svg" alt="" class="everyicon">
                                <span>{{ source.commentCount }}</span>
                            </div>
                            <div class="everyitem">
                                <img src="@/assets/Transpond.svg" alt="" class="everyicon">
                                <span>{{ source.transmitCount }}</span>
                            </div>
                        </div>
                    </div>
                </div>  
            </div>
            <el-empty 
                v-if="!focusMeNotification || focusMeNotification.length === 0" 
                :image-size="200" 
                description="您暂时还没有收到关注列表消息呢！"
            />
        </div>
    </div>
    <div v-if="dialogShowVisible">
        <ShareDialog v-model="dialogShowVisible" :Id = shareId></ShareDialog>
    </div>  
</template>

<script setup>
import axios from '@/utils/request.js';
import { ref,onMounted,computed,watch} from 'vue';
import { getUsersAvatarFromCOS } from '@/utils/cosService';
import { getArticleCoverageFromCOS } from '@/utils/cosService';
import { fetchShareCoverage } from '@/utils/fileService'; 
import { ElMessage } from 'element-plus';
import { convertDateFormat } from '@/utils/timeFormat';
import ShareDialog from '@/page/ShareShow/components/ShareDialog.vue'
import { useRouter } from 'vue-router'
import { openUrl } from '@/utils/routeJudge'

const router = useRouter()
const currentLoadFunction = ref(1); //判定该调用getall函数还是getoneperson函数  
const currentPageOnePerson = ref(1); 
const currentPageAllPerson = ref(1); 
const checked1 = ref(true)
const checked2 = ref(true)
const focusMeNotification = ref([]);//存放用户关注列表中用户的动态
const focusMeUser = ref([]);//存放用户关注列表的数据
const userId = localStorage.getItem("userId"); // 获取用户ID
const focusId = ref(null);//用户点击的用户Id
const dialogShowVisible = ref(false)//控制分享展示弹框是否展示
const shareId = ref(null);


const type = computed(() => {
    if (checked1.value && checked2.value) return 2;
    if (checked1.value) return 0;
    if (checked2.value) return 1;
    return 2;  
});

watch(type, (newValue, oldValue) => {
    console.log(`Type from ${oldValue} to ${newValue}`);
    focusMeNotification.value = [];
    currentPageAllPerson.value = 1;
    currentPageOnePerson.value = 1;
    if(currentLoadFunction.value === 1){
        getAll( currentPageAllPerson.value);
    }
    else if(currentLoadFunction.value === 2){
        getOnePerson(currentPageOnePerson.value);
    }
});

// 点击进入文章展示或分享弹框
const goToDetail = (item) =>{
    if(item.type === 0){
        // const routeLocation = router.resolve({ path: `/TheArticle/${item.id}`});
        // window.open(routeLocation.href, '_blank');
        openUrl(`/TheArticle/${item.id}`)
    }
    else if(item.type === 1){
        //点击打开分享展示弹框
        shareId.value = item.id;
        dialogShowVisible.value = true;
    }
}

// 添加一个锁状态
let isLoading = false;
async function load() {
    if (isLoading) return; // 如果已经在加载中，则直接返回不执行新的加载
    isLoading = true; // 开始加载数据，设置锁状态为true
    try {
        if(currentLoadFunction.value === 1){
            if(currentPageAllPerson.value === 1){
                currentPageAllPerson.value++;
            }
            await getAll(currentPageAllPerson.value);
            currentPageAllPerson.value++; // 只有在请求成功完成后才递增页码
        }else if(currentLoadFunction.value === 2){
            if(currentPageAllPerson.value === 1){
                currentPageAllPerson.value++;
            }
            await getOnePerson(currentPageAllPerson.value);
            currentPageOnePerson.value++; // 只有在请求成功完成后才递增页码
        }
    } catch (error) {
        console.error(error);
        ElMessage.error('滚动时的未知错误')
    } finally {
        isLoading = false; // 请求完成，无论成功或失败，都释放锁状态
    }
}

const clickToGetOnePerson = (focusId1) =>{
    focusId.value = focusId1;
    focusMeNotification.value = [];
    currentPageAllPerson.value = 1;
    currentPageOnePerson.value = 1;
    currentLoadFunction.value = 2;
    getOnePerson(currentPageOnePerson.value,focusId.value);
    
}
const getAllFocus = async()=>{
    try{
        //    const response = await axios.get('/users/subscribe?apifoxApiId=105505953');
        const response = await axios.get('/users/subscribe', {
                params: {
                    id:userId,
                    page:1,
                    pazeSize:1000
                }
            });
        if(response.data.code === 1){
            focusMeUser.value = response.data.data.records;
            for (let record of focusMeUser.value) { 
                record.newAvatar = await getUsersAvatarFromCOS(record.starId);
            }
        }else if(response.data.code === 0 && response.data.msg){
            ElMessage.error(response.data.msg.toString());
        }else(error)=>{
            console.log(error);
            ElMessage.error('获取用户的关注列表失败');
        }
    }
    catch(error){
        console.log(error)
        ElMessage.error('获取用户的关注列表失败');
        return []; // 返回空数组
    }
}

// 获取某个用户动态消息
const getOnePerson = async(currentPage, userId) => {
    currentLoadFunction.value = 2;
    if(currentPageAllPerson.value === 1){
        focusMeNotification.value = [];
    }
    try {
        const params = {
            page: currentPage,
            pageSize: 5,
            userId: userId,
        };
        if (type.value) {
            params.type = type.value;
        }
        const response = await axios.get('/users/works', { params });
        if (response.data.code === 1 && response.data.data.records.length > 0) {
            let newRecords = response.data.data.records;
            let updatePromises = newRecords.map(async (record) => {
                record.createTime = convertDateFormat(record.createTime);
                const avatarPromise = getUsersAvatarFromCOS(record.userId);
                const coverPromise = record.type === 0 ? getArticleCoverageFromCOS(record.id) : fetchShareCoverage(record.id);
                const [newAvatar, newCoverPicture] = await Promise.all([avatarPromise, coverPromise]);
                return {
                    ...record,
                    newAvatar,
                    newCoverPicture
                };
            });
            newRecords = await Promise.all(updatePromises);
            focusMeNotification.value.push(...newRecords);
        }else if (response.data.code === 1 && response.data.data.records.length === 0) {
            ElMessage.info('已加载所有数据');
        }else if(response.data.code === 0 && response.data.msg){
            ElMessage.error(response.data.msg.toString());
        }
    } catch (error) {
        console.log(error);
        ElMessage.error('获取用户动态失败');
    }
};

// 获取所有关注用户动态消息
const getAll = async(currentPage) => {
    currentLoadFunction.value = 1;
    if (currentPage === 1) {
        focusMeNotification.value = [];
    }
    try {
        const params = {
            currentPage: currentPage,
            pageSize: 5
        };
        if (type.value) {
            params.type = type.value;
        }
        const response = await axios.get('/users/subscribe/works', { params });
        if (response.data.code === 1 && response.data.data.records.length > 0) {
            const updates = response.data.data.records.map(async (record) => {
                const createTime = convertDateFormat(record.createTime);
                const avatarPromise = getUsersAvatarFromCOS(record.userId);
                const verified = await fetchUserInformation(record.userId);
                const coverPromise = record.type === 0 ? getArticleCoverageFromCOS(record.id) : fetchShareCoverage(record.id);
                const [newAvatar, newCoverPicture] = await Promise.all([avatarPromise, coverPromise]);
                return { ...record, newAvatar, newCoverPicture,verified,createTime};
            });
            const updatedRecords = await Promise.all(updates);
            focusMeNotification.value = [...focusMeNotification.value, ...updatedRecords];
        } else if (response.data.code === 1 && response.data.data.records.length === 0) {
            ElMessage.info('已加载所有数据');
        }else if(response.data.code === 0 && response.data.msg){
            ElMessage.error(response.data.msg.toString());
        }
    } catch (error) {
        console.error(error);
        ElMessage.error('获取关注用户的动态失败');
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


onMounted(()=>{
    getAllFocus();
    getAll(currentPageAllPerson.value);
    listWidth.value = focusMeUser.value.length * 68;
});



// 左滑与右滑功能
const data = ref(0); // 这是滚动位置变量
const listWidth = ref(0); // 滚动内容的总宽度
// function moveLeft(){
//     data.value = (data.value - 68 + listWidth.value) % listWidth.value;
// }
// function moveRight(){
//     data.value = (data.value + 68) % listWidth.value;
// }

</script>

<style lang="scss" scoped>
.first{
    width: 77vw;
    padding: 12px 12px 0px; 
    justify-content: center; 
    gap: 12px;
    border-radius: 8px;
    border: 2px solid #F0F0F0;
    background: #FFF;
    margin-top: 50px;
}
.one{
    display: flex;
    margin-bottom: 5px;
    align-items: center;
}
.one img{
    width: 20px;
    height: 20px;
}
.one span{
    color: #6B757B;
    text-align: center;
    font-weight: 700;
    line-height: 1.6; 
    margin-left: 8px;
}
.container{
    width: 98%;
    height: 75px;
    margin: 0 auto 1rem;
    display: flex;
    gap: 10px;
    align-items: center;
    position: relative;
}
.circle-box{
    width: 47px; 
    height: 47px; 
    border-radius: 50%;
    border: 1px solid #6577b0;
    background-color: #dee8fa;
    display: flex;
    align-items: center;
    justify-content: center;
}
.small-image{
    width: 20px;
    height: 20px;
    border-radius: 100%;
}
.slide{
    overflow: hidden;
    max-width: 88%;
    display: flex;
    align-items: center;
}
.arrow-left,
.arrow-right{
    height: 35px;
    cursor: pointer;
    position: absolute;
    top: 28%;
}
.arrow-left {
    left: -17px;
}
.arrow-right {
    right: -17px;
}
.image-list{
    display: flex;
    white-space: nowrap; /* 确保水平排列，不换行 */
    overflow-x: auto; /* 允许水平滚动 */
    scroll-behavior: smooth; /* 使滚动平滑 */
    padding-bottom: 20px;

        /* 对于基于 WebKit 的浏览器 */
    &::-webkit-scrollbar {
        height: 3px; /* 设置滚动条高度 */
    }
    &::-webkit-scrollbar-track {
        background: transparent; /* 设置滚动条轨道背景颜色 */
        background-color: #f0f0f0;
    }
    &::-webkit-scrollbar-thumb {
        background-color: #e2e2e2; /* 设置滚动条颜色 */
    }
    &::-webkit-scrollbar-thumb:hover {
        background-color: #d0d0d0; 
    }
}
/* 隐藏滚动条 */
/* .image-list::-webkit-scrollbar {
    display: none;
} */
.image-list {
    scrollbar-width: none; /* Firefox */
    -ms-overflow-style: none; /* Internet Explorer 10+ */
}
.all{
    display: block;
    color: #6577B0;
    font-size: 10px;
    line-height: 1.6; 
}
.image-list img {
    display: block;
    width: 48px;
    height: 48px;
    margin: 0 10px;
    cursor: pointer;
    border-radius: 100%;
}
.image-list span{
    display: block;
    color: #6D757A;
    text-align: center;
    font-size: 10px;
    line-height: 1.6; 
}
::v-deep label.el-checkbox.el-checkbox--large.is-checked{
    width: 80px;
}
.then{
    width: 77vw;
    height: calc(60vh - 1rem);
    border-radius: 8px;
    overflow-x: hidden;
    overflow-y: auto;
    padding: 12px 12px 0px;
    border: 2px solid #F0F0F0;
    margin-top: 12px;
}
.box{
    width: 95%;
    margin: 0px auto;
    border-bottom:1px solid #e7e7e7;
    display: flex;
    margin-bottom: 25px;
}
.large{
    display: flex;
    width: 98%;
    gap: 5px;
    flex-direction: column;
    position: relative;
}
.top {
    display: flex;
    align-items: center;
    width: 100%;
    margin: 0px auto;
}
.cover{
    width: 60px;
    height: 60px;
    border-radius: 100%;
    cursor: pointer;
}
.top_right{
    margin-left: 5px;
}
.name{
    color: #000;
    text-align: center;
    font-size: 14px;
    font-weight: 700;
    line-height: 1.6;
    margin: 0 10px;
}
.middle{
    color: #505050;
    font-size: 14px;
    margin-left: 10px;
    line-height: 1.6; 
}
.time{
    color: #939393;
    font-size: 12px;
    line-height: 1.6;
    position: absolute;
    right: 0px;
}
.text{
    display: inline-block;
    display: flex;
    height: 140px;
    padding: 10px 0px 20px;
}
.aritle_cover{
    width: 205px;
    height: 140px;
    border-radius: 8px;
    margin: 0px 25px 0px 75px;
    border: 1px solid #ebebeb;
    cursor: pointer;
}
.article_title{
    margin-bottom: 5px;
    font-size: 16px;
    line-height: 1.6; 
}
.article_content{
    color: #7E7E7E;
    font-size: 14px;
    line-height: 1.6; 
    max-height: 90px;
    width: 95%;
}
.icons,
.icons2{
    height: 20px;
    display: flex;
    gap: 25px;
}
.icons{
    position: absolute;
    bottom: 0px ;
}
.everyitem{
    display: flex;
    gap: 3px;
    align-items: center;
}
.everyicon{
    width: 16px;
    height: 16px;
}
.everyitem span{
    display: inline-block;
    font-size: 12px;
    color: #2d2d2d;
}
.text2{
    display: flex;
    flex-direction: column;
    padding: 10px 0px 20px 75px;
}
.share_title{
    margin-bottom: 5px;
    font-size: 16px;
    line-height: 1.6; 
    font-weight: 700;
}
.share_content{
    font-size: 14px;
    line-height: 1.6; 
    max-height: 90px;
    width: 105%;
}
.share_cover{
    width: 160px;
    height: 140px;
    border-radius: 8px;
    margin: 20px 5px;
} 
.pic-container{
    display: flex;
    cursor: pointer;
    justify-content: space-between;
    padding: 20px 0px;
}
.pic {
    width: 182px;
    height: 160px;
    border-radius: 8px;
    border: 1px solid #ebebeb;
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
    .first,
    .then{
        width: 800px;
    }
}
</style>
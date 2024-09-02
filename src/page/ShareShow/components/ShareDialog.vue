<template>
    <div>
        <el-dialog class="share-dialog" v-model="localDialogVisible" style="width: 90%;height: 90vh;margin-top: 7vh;">
            <div style="display: flex;height: 100%;gap: 1rem;">
                <!-- 左侧轮播图 -->
                <div class="pic-container">
                    <el-carousel :interval="5000" arrow="always">
                        <el-carousel-item v-for="item in shareData.newCoverPicture" :key="item">
                            <img style="width: 100%;height: 100%;" :src="item"  alt="Image" />
                        </el-carousel-item>
                    </el-carousel>
                </div>
                <!-- 右侧分享信息+评论部分 -->
                <div class="share-info">
                    <!-- 具体的分享信息 -->
                    <div class="top">
                        <!-- 作者头像+名称 -->
                        <div class="user">
                            <img style="width: 30px;height: 30px;border-radius: 50%;" :src="shareData.newAvater" alt="">
                            <div style="display: flex;flex-direction: column;align-items: flex-start;gap: 0.2rem;">
                                <div style="display: flex;align-items: center;gap: 3px;">
                                    <span class="name">{{ shareData.username }}</span>
                                    <img v-if="shareData.verified === 1" src="@/assets/VerifiedUser.svg" style="width: 16px;height: 16px;" alt="">
                                </div>
                                <span class="time">{{ shareData.createTime }}</span>
                            </div>
                        </div>
                        <!-- 分享内容 -->
                        <div  class="content-wrapper" >
                            <p :class="{ 'limited': needsExpansion }" class="content-text">
                                {{ shareData.content }}
                            </p>
                            <button 
                                v-if=" shareData.showExpansion" 
                                @click= "OpenExpension"
                                class="expand-btn"
                            >
                                {{  shareData.needsExpansion ? '展开':'折叠'   }}
                            </button>
                        </div>
                    </div>
                    <!-- 点赞,收藏等图标 -->
                    <div class="middle">
                        <div class="icons-container">
                            <!-- 点赞 -->
                            <div class="icon">
                                <img class="like-pic"  :src=" shareData.likeStatus === 0 ? unlikedImage : likedImage " @click="toggleLike(shareData.likeStatus,shareData.id)">
                                <span class="like_num">{{ shareData.likeCount }}</span>
                            </div>
                            <!-- 评论 -->
                            <div @click="OpenComment" class="icon">
                                <img src="@/assets/Comment.svg" alt="">
                                <span>{{ shareData.commentCount }}</span>
                            </div>
                            <!-- 收藏 -->
                            <div class="icon">
                                <img class="like-pic"  v-if=" shareData.favoriteStatus === 0 " src="@/assets/FavoriteBefore.svg" @click="handleUpdateShare()">
                                <img class="like-pic" v-if=" shareData.favoriteStatus === 1 " src="@/assets/FavoriteAfter.svg" >
                                <span class="like_num">{{ shareData.favoriteCount }}</span>
                            </div>
                            <!-- 分享收藏列表弹框 -->
                            <div v-if="dialogFormVisible">
                                <CfDialog  class="cf-dialog" @updateValue="handleUpdateValue" v-model="dialogFormVisible"  ClassifyName="分享收藏"></CfDialog>
                            </div>
                            <!-- 更多 -->
                            <div class="icon" style="position: relative;" @click="ReportBtn = true;" >
                                <img src="@/assets/More.svg" alt="">
                                <div v-if="ReportBtn"  class="report-box">
                                    <span @click="dialogVisible = true;" @mouseleave="ReportBtn = false;">举报</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <!-- 评论区 -->
                    <div class="last" v-if="showDialogComments && shareData.needsExpansion">
                        <DialogComment  :shareId="shareId" :shareAuthorId="shareAuthorId" :shareAuthorName="shareAuthorName" :shareTitle="shareTitle"></DialogComment>
                    </div>
                </div>
            </div>
        </el-dialog>
        <div v-if="dialogVisible">
            <AreportedDialog v-model="dialogVisible" ></AreportedDialog>
        </div>
    </div>
</template>

<script setup>
import { defineProps, ref,defineEmits,watchEffect,onMounted,watch} from "vue";
import DialogComment from "./DialogComment.vue";
import AreportedDialog from '@/page/components/AreportedDialog.vue';
import CfDialog from '@/page/components/CfDialog';
import { fetchShareCoverage } from '@/utils/fileService';
import { getUsersAvatarFromCOS } from '@/utils/cosService';
import axios from '@/utils/request';
import { ElMessage } from 'element-plus';
import unlikedImage from '@/assets/LikeBefore.svg';
import likedImage from '@/assets/LikeAfter.svg';

const props = defineProps({
    modelValue: Boolean,
    Id:Number,
});
const emit = defineEmits(['update:modelValue']);
const localDialogVisible = ref(props.modelValue);
watchEffect(() => {
    if (localDialogVisible.value !== props.modelValue) {
        emit('update:modelValue', localDialogVisible.value);
    }
});

const userId = localStorage.getItem("userId"); // 获取用户ID
const shareData = ref({});
const limitWord = ref(150);//设置分享在不展开的情况下显示内容的上限
const showDialogComments = ref(false)//控制评论区显示与否
const dialogVisible = ref(false);//控制文章举报弹框是否显示
const dialogFormVisible = ref(false);//控制cfdialog弹窗（显示文章收藏列表）是否弹出
const ReportBtn = ref(false)//控制举报该条分享按钮是否显示
const shareId = ref();
const shareAuthorId = ref();
const shareAuthorName = ref();
const shareTitle = ref();
const favoriteId= ref();

const fetchData = () =>{
    shareId.value = props.Id;
    fetchShareData();
}

//判断该分享的内容是否需要展开收回（写到接口方法里显得太臃肿了所以提出来了）
const checkContentOverflow = (content) => {
    if (content.length > limitWord.value) {
        return true;
    }
}

//接受cfdialog返回的数据，从而确定收藏Id
const handleUpdateValue = (data) => {
    favoriteId.value = data[0];
}

//点击打开分享弹窗
const handleUpdateShare = () => {
    dialogFormVisible.value = true;
}

// 使用 watch 来监听 favoriteId 的变化
watch(favoriteId, (newVal, oldVal) => {
    if (newVal !== oldVal) {
    toggleFavorite();
    }
});


//分享收藏相关接口
async function toggleFavorite() {
    try {
        const response = await axios.post(`/favorite/share`,{
            favoriteId: favoriteId.value, 
            contentId:  props.Id, 
        });
        if ( response.data.code === 1) {
            shareData.value.favoriteStatus = 1; 
            shareData.value.favoriteCount =  response.data.data;
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

//点击展开分享内容
const OpenExpension = () =>{
    //在准备点击之前还未展开，即needsExpansion为true，此时点击让控制评论区的showDialogComments为false
    if( shareData.value.needsExpansion){
        showDialogComments.value = false
    }
    // 点击展开or折叠状态切换
    shareData.value.needsExpansion = !shareData.value.needsExpansion;
}
const OpenComment = () =>{
    //若点击评论区图标时，分享内容是展开的 ，即needsExpansion为false，则先收起分享内容，即让needsExpansion为true
    if(!shareData.value.needsExpansion){
        shareData.value.needsExpansion = true
    }
    showDialogComments.value = !showDialogComments.value
}

//获取分享信息
const fetchShareData = async () => {
    try {
        const response = await axios.get(`/share/${shareId.value}`)
        if (response.data.code === 1) {
            shareData.value = response.data.data;
            shareAuthorId.value = shareData.value.userId;
            shareAuthorName.value = shareData.value.username;
            shareTitle.value = shareData.value.title;
            shareData.value.verified = await fetchUserInformation(shareData.value.userId);
            shareData.value.newAvater = await getUsersAvatarFromCOS( shareData.value.userId);
            shareData.value.newCoverPicture = await fetchShareCoverage( shareData.value.id);
            shareData.value.likeStatus = await determineImage(1, shareData.value.id);
            shareData.value.favoriteStatus = await deterFavorite(shareData.value.id);
            shareData.value.needsExpansion = checkContentOverflow(shareData.value.content);
            shareData.value.showExpansion = checkContentOverflow(shareData.value.content);
        }else if(response.data.code === 0 && response.data.msg){
            ElMessage.error(response.data.msg.toString());
        }else{
            ElMessage.error('接口请求失败');
        }
    } catch (error) {
        console.error('接口请求失败', error);
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
                data: { userId: userId , shareId: shareId}
            }
            : {
                method: 'delete',
                url: `/share/unlike`,
                data: { userId: userId , shareId: shareId}
            };
        const response = await axios(config);
        if ( response.data.code === 1) {
            shareData.value.likeStatus = shareData.value.likeStatus === 0 ? 1 : 0;
            shareData.value.likeCount =  response.data.data;
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

onMounted(async () => {
    fetchData();
})

</script>

<style scoped>
::v-deep .share-dialog .el-dialog__body {
    padding: 20px 30px;
    height: 93%;
}
::v-deep .share-dialog .el-dialog__header {
    padding: 0; 
    margin-right: 0;
}
::v-deep .share-dialog .el-carousel--horizontal {
    height: 100%;
}
::v-deep .share-dialog .el-carousel__container{
    height: 100% !important;
}
/* 由于el-dialog嵌套使用,故在一个组件内给两个弹框定义不同类名以防止样式重叠 */
::v-deep .cf-dialog .el-dialog{
    width: 75%;
    height: 80%;
}
::v-deep .cf-dialog .el-dialog__body{
    padding: 10px 30px;
    height: 73%;
}
::v-deep .cf-dialog .el-dialog__header{
    text-align: center;
    padding: var(--el-dialog-padding-primary);
}
::v-deep .cf-dialog .el-dialog__title {
    font-weight: 700;
    font-size: 20px;
}
::v-deep .cf-dialog .el-dialog__headerbtn {
    width: 30px;
    height: 30px;
}
:deep .el-dialog__headerbtn {
    top: -10px;
    right: -10px;
}
.pic-container{
    width: 60%;
    height: 100%;
}
.share-info{
    width: 40%;
    height: 100%;
}
.top{
    padding: 10px;
    min-height: 35%;
    max-height: 70%;
    width: 95%;
    overflow: auto;
    box-shadow: 0px 1px 3px 1px rgba(0, 0, 0, 0.08);
}
.user{
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 1rem;
}
.name{
    color: #2A7FE4;
}
.time{
    color: #8C8C8C;
    font-size: 12px;
}
.content-wrapper {
    position: relative;
    margin-bottom: 20px;
    position: relative;
}
.content-text{
    color: #333;
    padding: 0px 10px;
    font-size: 14px;
    line-height: 1.8; 
    letter-spacing: 1px;
    overflow: hidden;
    display: -webkit-box;
    -webkit-box-orient: vertical;
}
.content-text.limited {
    -webkit-line-clamp: 5;
}
.expand-btn {
    position: absolute;
    bottom: -15px;
    right: 0;
    background-color: transparent; 
    border: none;
    cursor: pointer;
    color: #2A7FE4;
    font-size: 14px;
    line-height: 120%; 
}
.icons-container{
    display: flex;
    width: 97%;
    height: 30px;
    align-items: center;
    justify-content: space-around;
    margin-top: 10px;
}
.icon{
    display: flex;
    align-items: center;
    gap: 3px;
}
.icon img{
    width: 18px;
    height: 18px;
    cursor: pointer;
}
.icon span{
    color: #2d2d2d;
    font-size: 12px;
}
.report-box{
    position: absolute;
    top: 15px ;
    right: -17px;
    width: 50px;
    height: 26px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 5px; 
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}
.report-box span{
    cursor: pointer;
    font-size: 14px;
    color: #5d5d5d;
}
.last{
    width: 100%;
    height: 53%;
    overflow: auto;
}
</style>
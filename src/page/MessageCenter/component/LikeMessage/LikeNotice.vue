<template>
    <div>
        <div class="first">
            <div class="one">
                <img src="@/assets/LikeBefore.svg" alt="">
                <span>点赞我的</span>
            </div>
            <div>
                <el-checkbox v-model="checked1" label="文章点赞" size="large" @change="change"/>
                <el-checkbox v-model="checked2" label="分享点赞" size="large" @change="change"/>
                <el-checkbox v-model="checked3" label="评论点赞" size="large" @change="change"/>
            </div>
        </div>
        <div class="then" v-infinite-scroll="load" infinite-scroll-distance="100" infinite-scroll-immediate="false">
            <div v-for="(source,index) in likeNotification" :key="index" class="box">
                <div v-if="source.type === 0 || source.type === 1" class="large">
                    <img :src=source.newAvatar alt="" class="cover">
                    <div style="display: flex;flex-direction: column;">
                        <div class="text">
                            <div style="display: flex;align-items: center;">
                                <div style="display: flex;align-items: center;">
                                    <span class="name">{{ source.username }}</span>
                                    <img  v-if="source.verified === 1" src="@/assets/VerifiedUser.svg" style="width: 16px;height: 16px;margin-left: -9px;margin-right: 10px;" alt="">
                                </div>
                                <span class="middle">赞了我的在</span>
                                <span class="name">{{ source.workTitle }}</span>
                                <span class="middle">中的评论：</span>
                            </div>
                            <span class="time">{{ source.createTime }}</span>
                        </div>
                        <div class="comment-content">
                            <span>
                                {{ source.commentContent }}
                            </span>
                        </div>
                    </div>
                </div>
                <div v-if="source.type === 2" class="large">
                    <img :src=source.newAvatar alt="" class="cover">
                    <div class="text">
                        <div style="display: flex;align-items: center;">
                            <div style="display: flex;align-items: center;">
                                <span class="name">{{ source.username }}</span>
                                <img  v-if="source.verified === 1" src="@/assets/VerifiedUser.svg" style="width: 16px;height: 16px;margin-left: -9px;margin-right: 10px;" alt="">
                            </div>
                            <span class="middle">赞了我的 文章</span>
                            <span class="name">{{ source.workTitle }}</span>
                        </div>
                        <span class="time">{{ source.createTime }}</span>
                    </div>
                </div>
                <div v-if="source.type === 3" class="large">
                    <img :src=source.newAvatar alt="" class="cover">
                    <div class="text">
                        <div style="display: flex;align-items: center;">
                            <div style="display: flex;align-items: center;;">
                                <span class="name">{{ source.username }}</span>
                                <img  v-if="source.verified === 1" src="@/assets/VerifiedUser.svg" style="width: 16px;height: 16px;margin-left: -9px;margin-right: 10px;" alt="">
                            </div>
                            <span class="middle">赞了我的 分享</span>
                            <span class="name">{{ source.workTitle }}</span>
                        </div>
                        <span class="time">{{ source.createTime }}</span>
                    </div>
                </div>
            </div>
            <el-empty 
                v-if="!likeNotification || likeNotification.length === 0" 
                :image-size="200" 
                description="您暂时还没有收到点赞消息呢！"
            />
        </div>
    </div>
</template>

<script setup>
import { onMounted,ref,watch } from 'vue';
import axios from '@/utils/request'
import { convertDateFormat } from '@/utils/timeFormat';
import { getUsersAvatarFromCOS } from '@/utils/cosService';
import { ElMessage } from 'element-plus';

const currentPage = ref(1);
const likeNotification = ref([]);
const checked1 = ref(true)
const checked2 = ref(true)
const checked3 = ref(true)
const checkboxes = [checked1, checked2, checked3];

// 这里的代码会在`checkboxes`变化时重新运行
checkboxes.forEach(checkbox => {
    watch(checkbox, () => {
        currentPage.value = 1; // 重置页码
        likeNotification.value.splice(0, likeNotification.value.length);
        getLikeNote(currentPage.value);
    });
});

// 添加一个锁状态
let isLoading = false;
async function load() {
    if (isLoading) return; // 如果已经在加载中，则直接返回不执行新的加载
    isLoading = true; // 开始加载数据，设置锁状态为true
    try {
        if(currentPage.value === 1){
            currentPage.value++;
        }
        await getLikeNote(currentPage.value);
        currentPage.value++; // 只有在请求成功完成后才递增页码
    } catch (error) {
        console.error(error);
        ElMessage.error('滚动时的未知错误');
    } finally {
        isLoading = false; // 请求完成，无论成功或失败，都释放锁状态
    }
}

async function getLikeNote(currentPage) {
    try {
        const response = await axios.get('/notice/like', {
            params: {
                page:currentPage,
                pageSize:10,
            }
        });
        if(response.data.data.records){
            let updatedRecords = response.data.data.records;
            const filteredRecords = updatedRecords.filter(record => {
                if (checked1.value && record.type === 2) return true;
                if (checked2.value && record.type === 3) return true;
                if (checked3.value && (record.type === 0 || record.type === 1)) return true;
                return false;
            });
            const processedRecords = await Promise.all(filteredRecords.map(async (record) => {
                record.createTime = convertDateFormat(record.createTime);
                record.newAvatar = await getUsersAvatarFromCOS(record.userId);
                record.verified = await fetchUserInformation(record.userId);
                return record;
            }));
            likeNotification.value = [...likeNotification.value, ...processedRecords];
        }else if(response.data.code === 0 && response.data.msg){
            ElMessage.error(response.data.msg.toString());
        }else(error)=>{
            console.log(error);
        }
    } catch (error) {
        console.log(error);
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


onMounted(()=>{
    getLikeNote(currentPage.value);
})

</script>

<style scoped>
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
}
.one img{
    width: 20px;
    height: 20px;
    align-items: center;
}
.one span{
    color: #6B757B;
    text-align: center;
    font-weight: 700;
    line-height: 1.6; 
    margin-left: 8px;
}
.then{
    width: 77vw;
    height: 72vh;
    overflow-y: scroll;
    padding: 12px 12px 0px;
    border-radius: 8px;
    border: 2px solid #F0F0F0;
    margin-top: 12px;
}
.box{
    width: 95%;
    margin: 0px auto;
    border-bottom:1px solid #e7e7e7;
    margin-bottom: 10px;
    padding-left: 5px;
}
.title{
    color: #000;
    text-align: center;
    font-family: Microsoft YaHei;
    font-size: 14px;
    font-style: normal;
    font-weight: 700;
    line-height: 120%; 
}
/* .cover1{
    margin-bottom: 15px;
}
.cover1, */
.cover{
    width: 60px;
    height: 60px;
    border-radius: 100%;
}
.name{
    color: #000;
    text-align: center;
    font-size: 14px;
    font-weight: 700;
    line-height: 260%; 
    margin: 0 10px;
}
.middle{
    color: #505050;
    text-align: center;
    font-size: 14px;
    line-height: 260%; 
}
.text{
    display: flex;
    align-items: center;
    justify-content: space-between;
}
.time{
    color: #A1A1A1;
    font-size: 12px;
    line-height: 1.6;
    position: absolute;
    right: 0px;
    top: 15px;
}
.comment-content{
    font-size: 14px;
    width: 790px;
    padding: 10px;
    border-radius: 5px;
    line-height: 1.6;
}
.aritle{
    width: 70px;
    height: 70px;
    position: absolute;
    right: 36px;
    bottom: 10px;
    top: 10px;
}
.large{
    display: flex;
    align-items: center;
    width: 98%;
    gap: 5px;
    min-height: 100px;
    position: relative;
}
.number{
    color: #9FA9CA;
    font-family: Microsoft YaHei;
    font-size: 14px;
    line-height: 120%;
}
.content{
    color: #505050;
    font-family: Microsoft YaHei;
    font-size: 14px;
    font-style: normal;
    font-weight: 400;
    line-height: 120%; /* 16.8px */
}
::v-deep .el-checkbox.el-checkbox--large{
    width: 80px;
}
@media (max-width: 768px) {
    .first,
    .then{
        width: 800px;
    }
}
</style>
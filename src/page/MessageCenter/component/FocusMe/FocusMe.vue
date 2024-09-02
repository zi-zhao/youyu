<template>
    <div>
        <div class="first">
            <div class="one">
                <img src="@/assets/MessageCenter/FocusMe.svg" alt="">
                <span>关注列表</span>
            </div>
        </div>
        <div class="then" v-infinite-scroll="load" infinite-scroll-distance="100" infinite-scroll-immediate="false">
            <div v-for="(source,index) in focusMeNotification" :key="index" class="box">
                <div class="large">
                    <img :src=source.avatar alt="" class="cover">
                    <div class="text">
                        <div style="display: flex;align-items: center;">
                            <span class="name">{{ source.fanUsername }}</span>
                            <img v-if="source.verified === 1" src="@/assets/VerifiedUser.svg" style="width: 16px;height: 16px;margin-left: -9px;" alt="">
                        </div>
                        <span class="middle">关注了我</span>
                        <span class="time">{{ source.createTime }}</span>
                    </div>
                </div>
            </div>
            <el-empty 
                v-if="!focusMeNotification || focusMeNotification.length === 0" 
                :image-size="200" 
                description="您暂时还没有收到关注消息呢！"
            />
        </div>
    </div>
</template>

<script setup>
import { ElMessage } from 'element-plus';
import {  ref,onMounted } from 'vue';
import axios from '@/utils/request.js';
import { getUsersAvatarFromCOS } from '@/utils/cosService';
import { convertDateFormat } from '@/utils/timeFormat';

const userId = localStorage.getItem("userId"); // 获取用户ID
const focusMeNotification = ref([]);
const currentPage = ref(1);


// 添加一个锁状态
let isLoading = false;
async function load() {
    if (isLoading) return; // 如果已经在加载中，则直接返回不执行新的加载
    isLoading = true; // 开始加载数据，设置锁状态为true
    try {
        if(currentPage.value === 1){
            currentPage.value++;
        }
        await getMyFocusNote(currentPage.value);
        currentPage.value++; // 只有在请求成功完成后才递增页码
    } catch (error) {
        console.error(error);
        ElMessage.error('滚动时的未知错误');
    } finally {
        isLoading = false; // 请求完成，无论成功或失败，都释放锁状态
    }
}


async function getMyFocusNote(currentPage) {
    try {
        // const response = await axios.get('/users/fans?apifoxApiId=105505347');
        const response = await axios.get('/users/fans', {
                params: {
                    id:userId,
                    page:currentPage,
                    pazeSize:10
                }
            });
        if(response.data.data.records){
            const updates = response.data.data.records.map(async (record) => {
                const avatar = await getUsersAvatarFromCOS(record.fanId);
                const createTime = convertDateFormat(record.createTime);
                const verified = await fetchUserInformation(record.fanId);
                return { ...record, avatar, createTime,verified };
            });
            const updatedRecords = await Promise.all(updates);
            focusMeNotification.value = [...focusMeNotification.value, ...updatedRecords];
        }else if(response.data.code === 0 && response.data.msg){
            ElMessage.error(response.data.msg.toString());
        }else(error)=>{
            console.log(error);
            ElMessage.error('获取用户粉丝数据失败');
        }
    } catch (error) {
        console.log(error);
        ElMessage.error('获取用户粉丝数据失败');
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
    getMyFocusNote(currentPage.value)
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
    align-items: center;
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
    height: 78vh;
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
    display: flex;
}
.cover{
    width: 60px;
    height: 60px;
    border-radius: 100%;
}
.name{
    color: #000;
    text-align: center;
    font-family: Microsoft YaHei;
    font-size: 14px;
    font-style: normal;
    font-weight: 700;
    line-height: 260%; 
    margin: 0 10px;
}
.middle{
    color: #505050;
    text-align: center;
    font-family: Microsoft YaHei;
    font-size: 14px;
    font-style: normal;
    font-weight: 400;
    line-height: 260%;
    margin-left: 10px;
}
.text{
    display: inline-block;
}
.time{
    color: #A1A1A1;
    font-size: 12px;
    line-height: 120%;
    position: absolute;
    right: 0px;
    top: 50%;
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
    height: 100px;
    position: relative;
}
.number{
    color: #9FA9CA;
    font-family: Microsoft YaHei;
    font-size: 14px;
    line-height: 120%;
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
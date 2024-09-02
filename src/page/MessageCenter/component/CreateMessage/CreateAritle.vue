<template>
    <div>
        <div class="first">
            <div class="one">
                <img src="@/assets/MessageCenter/three.svg" alt="">
                <span>我的创作</span>
            </div>
            <div>
                <el-checkbox v-model="checked2" label="购买文章" size="large" @change="change"/>
                <el-checkbox v-model="checked3" label="购买附件" size="large" @change="change"/>
                <el-checkbox v-model="checked4" label="文章打赏" size="large" @change="change"/>
            </div>
        </div>
        <div class="then" v-infinite-scroll="load" infinite-scroll-distance="100" infinite-scroll-immediate="false">
            <div v-for="(source,index) in articleNotification" :key="index" class="box">
                <div v-if="source.type === 0" class="large">
                    <img :src=source.newAvatar alt="" class="cover">
                    <div class="text">
                        <div style="display: flex;align-items: center;">
                            <span class="name">{{ source.username }}</span>
                            <img  v-if="source.verified === 1" src="@/assets/VerifiedUser.svg" style="width: 16px;height: 16px;margin-left: -9px;" alt="">
                        </div>
                        <span class="middle" style="margin-left: 10px;">购买了我的文章</span>
                        <span class="name">{{ source.title }}</span>
                        <span class="time">{{ source.createTime }}</span>
                    </div>
                </div>

                <div v-if="source.type === 1" class="large">
                    <img :src=source.newAvatar alt="" class="cover">
                    <div class="text">
                        <div style="display: flex;align-items: center;">
                            <span class="name">{{ source.username }}</span>
                            <img  v-if="source.verified === 1" src="@/assets/VerifiedUser.svg" style="width: 16px;height: 16px;margin-left: -9px;" alt="">
                        </div>
                        <span class="middle" style="margin-left: 10px;">购买了文章</span>
                        <span class="name">{{ source.title }}</span>
                        <span class="middle">的附件</span>
                        <span class="time">{{ source.createTime }}</span>
                    </div>
                </div>

                <div v-if="source.type === 2" class="large">
                    <img :src=source.newAvatar alt="" class="cover">
                    <div class="text">
                        <div style="display: flex;align-items: center;">
                            <span class="name">{{ source.username }}</span>
                            <img  v-if="source.verified === 1" src="@/assets/VerifiedUser.svg" style="width: 16px;height: 16px;margin-left: -9px;" alt="">
                        </div>
                        <span class="middle" style="margin-left: 10px;">给我的文章</span>
                        <span class="name">{{ source.title }}</span>
                        <span class="middle">打赏了</span>
                        <span class="number">{{ source.coinCount }}</span>
                        <span class="middle">渔币</span>
                        <span class="time">{{ source.createTime }}</span>
                    </div>
                </div>
                    
            </div>
            <el-empty 
                v-if="!articleNotification || articleNotification.length === 0" 
                :image-size="200" 
                description="您暂时还没有收到文章相关消息呢！"
            />
        </div>
    </div>
</template>

<script setup>
import {  ref,onMounted,computed,watch } from 'vue';
import axios from '@/utils/request.js';
import { getUsersAvatarFromCOS } from '@/utils/cosService';
import { convertDateFormat } from '@/utils/timeFormat';
import { ElMessage } from 'element-plus';

const currentPage = ref(1);
const articleNotification = ref([]);
let checked2 =ref(true)
let checked3 =ref(true)
let checked4 =ref(true)
const types = computed(() => {
    let tempTypes = [];
    if (checked2.value) tempTypes.push(0);
    if (checked3.value) tempTypes.push(1);
    if (checked4.value) tempTypes.push(2);
    return tempTypes;
});

const typeString = computed(() => {
    return types.value.join(',');
});

// 这里的代码会在`types`变化时重新运行
watch(types, () => {
    currentPage.value = 1; // 重置页码
    articleNotification.value.splice(0, articleNotification.value.length);
    getIncomeNote(currentPage.value)
})

// 添加一个锁状态
let isLoading = false;
async function load() {
    if (isLoading) return; // 如果已经在加载中，则直接返回不执行新的加载
    isLoading = true; // 开始加载数据，设置锁状态为true
    try {
        if(currentPage.value === 1){
            currentPage.value++;
        }
        await getIncomeNote(currentPage.value);
        currentPage.value++; // 只有在请求成功完成后才递增页码
    } catch (error) {
        console.error(error);
        ElMessage.error('滚动时的未知错误');
    } finally {
        isLoading = false; // 请求完成，无论成功或失败，都释放锁状态
    }
}


async function getIncomeNote(currentPage) {
    try {
        const response = await axios.get('/notice/income', {
            params: {
                type: typeString.value,
                page:currentPage,
                pageSize:10,
            }
        });
        if (response.data.code === 1 && response.data.data.records.length > 0) {
            const updates = response.data.data.records.map(async (record) => {
                const newAvatar = await getUsersAvatarFromCOS(record.userId);
                const createTime = convertDateFormat(record.createTime);
                const verified = await fetchUserInformation(record.userId);
                return { ...record, newAvatar, createTime,verified };
            });
            const updatedRecords = await Promise.all(updates);
            articleNotification.value = [...articleNotification.value, ...updatedRecords];
            console.log(response.data.data);
        }else if (response.data.code === 1 && response.data.data.records.length === 0) {
            // ElMessage.info('已加载所有数据');
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


onMounted(() => {
    getIncomeNote(currentPage.value)
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
    gap: 5px;
    width: 98%;
    height: 100px;
    position: relative;
}
.number{
    color: #8490b6;
    font-weight: 700;
    font-size: 14px;
    line-height: 120%;
    margin: 0 3px;
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
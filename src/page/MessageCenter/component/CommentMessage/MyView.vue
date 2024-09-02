<template>
    <div>
        <div class="first">
            <div class="one">
                <img src="@/assets/MessageCenter/two.svg" alt="">
                <span>我的评论</span>
            </div>
            <div>
                <el-checkbox v-model="checked1" label="文章评论" size="large" @change="change"/>
                <el-checkbox v-model="checked2" label="分享评论" size="large" @change="change"/>
                <el-checkbox v-model="checked3" label="回复我的" size="large" @change="change"/>
            </div>
        </div>
        <div class="then" v-infinite-scroll="load" infinite-scroll-distance="100" infinite-scroll-immediate="false">
            <div v-for="(source,index) in commentNotification" :key="index" class="box">
                <!-- 文章评论 -->
                <div v-if="source.type === 0" class="large">
                    <div class="comment_top">
                        <img :src=source.avatar alt="" class="cover">
                        <div class="comment_tip">
                            <div style="display: flex;align-items: center;gap: 3px;">
                                <span class="name">{{ source.username }}</span>
                                <img  v-if="source.verified === 1" src="@/assets/VerifiedUser.svg" style="width: 16px;height: 16px;" alt="">
                            </div>
                            <div>
                                <span class="middle">评论了我的文章</span>
                                <span class="work_title">《{{ source.articleTitle }}》</span>
                                <span class="time">{{ source.createTime }}</span>
                            </div>
                        </div> 
                    </div>   
                    <div class="text">
                        <span >{{ source.content }}</span>
                    </div>
                </div>         
                <!-- 分享评论 -->
                <div v-if="source.type === 1" class="large">
                    <div class="comment_top">
                        <img :src=source.avatar alt="" class="cover">
                        <div class="comment_tip">
                            <div style="display: flex;align-items: center;gap: 3px;">
                                <span class="name">{{ source.username }}</span>
                                <img  v-if="source.verified === 1" src="@/assets/VerifiedUser.svg" style="width: 16px;height: 16px;" alt="">
                            </div>
                            <div>
                                <span class="middle">评论了我的分享</span>
                                <span class="work_title">"{{ source.articleTitle }}"</span>
                                <span class="time">{{ source.createTime }}</span>
                            </div>
                        </div>
                    </div>
                    <div class="text">   
                        <span >{{ source.content }}</span>
                    </div>
                </div>
                <!-- 回复我的 -->
                <div v-if="source.type === 2 || source.type === 3 || source.type === 4 || source.type === 5" class="large">
                    <div class="comment_top">
                        <img :src=source.avatar alt="" class="cover">
                        <div class="comment_tip">
                            <div style="display: flex;align-items: center;gap: 3px;">
                                <span class="name">{{ source.username }}</span>
                                <img  v-if="source.verified === 1" src="@/assets/VerifiedUser.svg" style="width: 16px;height: 16px;" alt="">
                            </div>
                            <div v-if="source.type === 2 || source.type === 3">
                                <span class="middle">回复了我在文章</span>
                                <span class="work_title">《{{ source.articleTitle }}》</span>
                                <span class="middle">中的评论</span>
                                <span class="time">{{ source.createTime }}</span>
                            </div>
                            <div v-if="source.type === 4 || source.type === 5">
                                <span class="middle">回复了我在分享</span>
                                <span class="work_title">"{{ source.articleTitle }}""</span>
                                <span class="middle">中的评论</span>
                                <span class="time">{{ source.createTime }}</span>
                            </div>                    
                        </div>
                    </div>
                    <div class="text mycomment">
                        <span >{{ source.commentContent }}</span>
                    </div>
                    <div class="recomment">
                        <span >{{ source.content }}</span>
                    </div>  
                </div>                    
            </div>
            <el-empty 
                v-if="!commentNotification || commentNotification.length === 0" 
                :image-size="200" 
                description="您暂时还没有收到评论消息呢！"
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
const checked1 =ref(true)
const checked2 =ref(true)
const checked3 =ref(true)
const commentNotification = ref([]);
const types = computed(() => {
    let tempTypes = [];
    if (checked1.value) tempTypes.push(0);
    if (checked2.value) tempTypes.push(1);
    if (checked3.value) tempTypes.push(2);
    return tempTypes;
});
const typeString = computed(() => {
    return types.value.join(',');
});


// 这里的代码会在`type`变化时重新运行
watch(types, () => {
    currentPage.value = 1; // 重置页码
    commentNotification.value.splice(0, commentNotification.value.length);
    getCommentNote(currentPage.value)
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
        await getCommentNote(currentPage.value);
        currentPage.value++; // 只有在请求成功完成后才递增页码
    } catch (error) {
        console.error(error);
        ElMessage.error('滚动时的未知错误');
    } finally {
        isLoading = false; // 请求完成，无论成功或失败，都释放锁状态
    }
}

async function getCommentNote(currentPage) {
    try {
        const response = await axios.get('/notice/comment', {
            params: {
                type:typeString.value,
                page:currentPage,
                pagaSize:10,
            }
        });
        if (response.data.code === 1 && response.data.data.records.length > 0) {
            const updates = response.data.data.records.map(async (record) => {
                const avatar = await getUsersAvatarFromCOS(record.userId);
                const createTime = convertDateFormat(record.createTime);
                const verified = await fetchUserInformation(record.userId);
            return { ...record, avatar, createTime,verified};
        });
        const updatedRecords = await Promise.all(updates);
        commentNotification.value = [...commentNotification.value, ...updatedRecords];
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
    getCommentNote(currentPage.value)
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
    padding: 25px 0px;
}
.large{
    display: flex;
    width: 98%;
    gap: 5px;
    flex-direction: column;
    position: relative;
}
.comment_top{
    display: flex;
}
.comment_tip{
    width: 785px;
    display: flex;
    gap: 5px;
    flex-direction: column;
    align-items: flex-start;
    margin-left: 15px;
}
.cover{
    width: 60px;
    height: 60px;
    border-radius: 100%;
}
.text{
    display: inline-block;
    margin: 0px 10px 10px 67px;
    font-size: 14px;
    padding: 8px;
    border-radius: 5px;
    line-height: 1.6;
}
.recomment{
    margin-left: 75px;
}
.name{
    color: #000;
    text-align: center;
    font-family: Microsoft YaHei;
    font-size: 14px;
    font-style: normal;
    font-weight: 700;
    line-height: 1.6;
}
.middle{
    color: #505050;
    text-align: center;
    font-family: Microsoft YaHei;
    font-size: 14px;
    font-style: normal;
    font-weight: 400;
    line-height: 1.6; 
    margin-right: 10px;
}
.work_title{
    font-weight: 700;
    color: #505050;
    font-size: 14px;
}
.time{
    color: #A1A1A1;
    font-size: 12px;
    line-height: 1.6;
    display: inline-block;
    position: absolute;
    right: 0px;
    top: 30px;
}
::v-deep .el-checkbox.el-checkbox--large{
    width: 80px;
}
.mycomment{
    background-color: #EAEAEA;
}
@media (max-width: 768px) {
    .first,
    .then{
        width: 800px;
    }
}
</style>
<!-- 用户自己是提问者 -->
<template>
    <div class="bgc_box">
        <!-- 向**的提问+价值 -->
        <div class="top">
            <div class="one_btn">
                <span>向</span>
                <div style="display: flex;align-items: center;">
                    <span class="text1">{{ answererInfo.username }}</span>
                    <img v-if="answererInfo.verified === 1" src="@/assets/VerifiedUser.svg" style="width: 16px;height: 16px;margin: 0 10px 0 -9px;" alt="">
                </div>
                <span>提问</span>
            </div>
            <!-- <div class="two_btn">
                <span>价值</span>
                <span class="text1">10</span>
                <span>鱼饵</span>
            </div> -->
        </div>
        <!-- 对话列表  -->
        <div class="main_box">
            <div class="content-box" v-for="(message, index) in sendMessagesList" :key="index">
                <div class="item">
                    <div class="user" v-if="message.user === 0">
                        <img :src="userAvater" alt="">
                        <span>{{userName}}的提问</span>
                    </div>
                    <div class="user" v-if="message.user === 1">
                        <img :src="answererInfo.newAvater" alt="">
                        <span>{{answererInfo.username}}的回答</span>
                    </div>
                    <div class="content" v-if="message.messageType === 1">
                        {{ message.content }}
                    </div>
                    <div class="content" v-if="message.messageType === 0">
                        <img :src="message.imageurl" alt="">
                    </div>
                    <div class="time">
                        {{ message.createTime }}
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted} from 'vue';
import { ElMessage } from 'element-plus';
import axios from '@/utils/request';
import { useRoute } from 'vue-router';
import { getUsersAvatarFromCOS } from '@/utils/cosService';

const route = useRoute ();
const questionId = parseInt(route.params.questionId,10);//路径中的问答ID
const otherUserId = parseInt(route.params.userId,10);//路径中的用户ID
const userId = localStorage.getItem("userId"); // 获取用户ID
const userName = localStorage.getItem("userName"); // 获取用户昵称 
const userAvater = ref('');//用户自己的头像
const answererInfo = ref({});
const sendMessagesList = ref([]);//存放历史对话记录

//获取用户历史消息列表
async function getMessageLog() {
  try{
    const response = await axios.get(`/answer/message/history`,{
        params: {
            questionId:questionId,
        }
    });
    if(response.data.code === 1){
        const user = ref(0);
        sendMessagesList.value = response.data.data.map(item => {
            if(item.fromUserId == userId) {
                user.value = 0;
            }else if(item.fromUserId == otherUserId){
                user.value = 1;
            }else{
                ElMessage.error('未知的参数错误');
            }
            return {
                uuid: '', 
                status: 1, 
                messageType: item.type, 
                user: user.value, 
                toUserId: item.toUserId, 
                fromUserId: item.fromUserId, 
                time: item.createTime, 
                content: item.content,
                imageurl:   
                    (item.type == 0) ? item.cosSecretDto.url :
                    null,
                number:null,
            };
        });
        // ElMessage.success('获取用户消息记录成功');
    }else if(response.data.code === 0 && response.data.msg){
        ElMessage.error(response.data.msg.toString());
    }else{
        console.error("获取用户消息记录失败");
        ElMessage.error('获取用户消息记录失败');
    }
  } catch (error) {
    console.error("获取用户消息记录失败", error); 
    ElMessage.error('获取用户消息记录失败');
  }
}

//获取对话用户具体信息
async function getAnswererInfo() {
  try{
    const response = await axios.get(`/answer/${otherUserId}`)
    if(response.data.code === 1){
        answererInfo.value = response.data.data;
        answererInfo.value.verified = await fetchUserInformation(otherUserId);
        answererInfo.value.newAvater = await getUsersAvatarFromCOS(answererInfo.value.userId);
        userAvater.value = await getUsersAvatarFromCOS(userId);
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
    getAnswererInfo();
    getMessageLog();
});
</script>

<style scoped>
.bgc_box{
    width: 100%;
    background-color: #F8F8F8;
}
.top{
    display: flex;
    justify-content: center;
    gap: 80px;
    padding: 15px 0px;
}
.text1{
    color: #3F87E1;
    margin: 0px 10px;
}
.top span{
    font-size: 20px;
}
.one_btn{
    display: flex;
}
.main_box{
    height: 88vh;
    overflow: auto;
}
.item{
    width: 960px;
    padding: 12px 20px;
    background-color: #fff;
    margin: 0px auto 20px;
    border-radius: 12px;;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
}
.user{
    width: 100%;
    border-bottom: 1px solid #EEE;
    display: flex;
    align-items: center;
    padding-bottom: 12px;
}
.user img{
    width: 40px;
    height: 40px;
    margin-right: 15px;
    border-radius: 50%;
}
.content{
    line-height: 1.6;
    padding: 1rem 2rem;
}
.content img {
    width: 500px;
    border-radius: 10px;
}
.time{
    font-size: 14px;
    line-height: 1.6;
    color: #7E7E7E;
}
@media (max-width: 768px) {
    .main_box{
        height: 90vh;
    }
    .top{
        justify-content: space-around;
        gap: 0px;
    }
    .item{
        width: 90%;
        padding: 12px 5%;
    }
    .user img{
        width: 2rem;
        height: 2rem;
        margin-right: 1rem;
    }
    .top span{
        font-size: 1.2rem;
    }
    .content{
        font-size: 0.9rem;
        padding: 1rem 0;
    }
    .content img{
        width: 18rem;
    }
}
</style>
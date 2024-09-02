<template>
    <TheHeader></TheHeader>
    <div class="large">
        <div class="left">
            <div class="inner">
                <div class="first">
                    <img src="@/assets/MessageCenter/message.svg" alt="" class="message">
                    <span class="title">消息中心</span>
                </div>
                <div class="next" @click="markAsRead('SystemNote')">
                    <img src="@/assets/MessageCenter/one.svg" alt="">
                    <router-link :to="{ name: 'SystemNote' }" class="router" active-class="active" >系统通知</router-link>
                    <div v-if=" data[0] > 99" class="unread-99">
                        {{ data[0] }}
                    </div>
                    <div v-if=" data[0] <= 99 && data[0] != 0" class="unread">
                        {{ data[0] }}
                    </div>
                </div>
                <div class="next" @click="markAsRead('MyView')">
                    <img src="@/assets/MessageCenter/two.svg" alt="">
                    <router-link :to="{ name: 'MyView' }" class="router" active-class="active" >评论我的</router-link>
                    <div v-if=" data[1] > 99 && unreadStatus.MyView" class="unread-99">
                        {{ data[1] }}
                    </div>
                    <div v-if=" data[1] <= 99 && data[1] != 0 && unreadStatus.MyView" class="unread">
                        {{ data[1] }}
                    </div>
                </div>
                <div class="next" @click="markAsRead('LikeNotice')">
                    <img src="@/assets/LikeBefore.svg" alt="">
                    <router-link :to="{ name: 'LikeNotice' }" class="router" active-class="active" >点赞我的</router-link>
                    <!-- 判断消息条数是否大于99，若不是，则只用unread类名即可，若大于，则需再加一个unread-99类名 -->
                    <div v-if=" data[2] > 99 && unreadStatus.LikeNotice" class="unread-99">
                        {{ data[2] }}
                    </div>
                    <div v-if=" data[2] <= 99 && data[2] != 0 && unreadStatus.LikeNotice" class="unread">
                        {{ data[2] }}
                    </div>
                </div>
                <div class="next" @click="markAsRead('CreateAritle')">
                    <img src="@/assets/MessageCenter/three.svg" alt="">
                    <router-link :to="{ name: 'CreateAritle' }" class="router" active-class="active" >我的创作</router-link>
                    <div v-if=" data[3] > 99 && unreadStatus.CreateAritle" class="unread-99">
                        {{ data[3] }}
                    </div>
                    <div v-if=" data[3] <= 99 && data[3] != 0 && unreadStatus.CreateAritle" class="unread">
                        {{ data[3] }}
                    </div>
                </div>
                <div class="next" @click="markAsRead('MyFocus')">
                    <img src="@/assets/MessageCenter/MyFocus.svg" alt="">
                    <router-link :to="{ name: 'MyFocus' }" class="router" active-class="active" >我的关注</router-link>
                    <div v-if=" data[4] > 99 && unreadStatus.MyFocus" class="unread-99">
                        {{ data[4] }}
                    </div>
                    <div v-if=" data[4] <= 99 && data[4] != 0 && unreadStatus.MyFocus" class="unread">
                        {{ data[4] }}
                    </div>
                </div>
                <div class="next" @click="markAsRead('FocusMe')">
                    <img src="@/assets/MessageCenter/FocusMe.svg" alt="">
                    <router-link :to="{ name: 'FocusMe' }"  class="router" active-class="active">关注我的</router-link>
                    <div v-if=" data[5] > 99 && unreadStatus.FocusMe" class="unread-99">
                        {{ data[5] }}
                    </div>
                    <div v-if=" data[5] <= 99 && data[5] != 0 && unreadStatus.FocusMe" class="unread">
                        {{ data[5] }}
                    </div>
                </div>
                <!-- <div class="next" @click="markAsRead('MyMessage')">
                    <img src="@/assets/MessageCenter/MyMessage.svg" alt="">
                    <router-link :to="{ name: 'MyMessage' }" class="router" active-class="active">我的消息</router-link>
                    <div v-if=" data[6] > 99 && unreadStatus.MyMessage" class="unread-99">
                        {{ data[6] }}
                    </div>
                    <div v-if=" data[6] <= 99 && data[6] != 0  && unreadStatus.MyMessage" class="unread">
                        {{ data[6] }}
                    </div>
                </div> -->
            </div>
        </div>
        <div class="right">
            <router-view></router-view>
        </div>
    </div>
</template>


<script setup>
import TheHeader from '../components/TheHeader.vue'
import axios from '@/utils/request';
import {ref,onMounted} from 'vue'

const unreadStatus = ref({
  SystemNote: true,
  MyView: true,
  LikeNotice: true,
  CreateAritle: true,
  MyFocus: true,
  FocusMe: true,
  MyMessage: true
});

// 点击隐藏未读消息的小红点
const markAsRead = (item) => {
  unreadStatus.value[item] = false;
};
    
const data = ref([]);

//获取各个类别消息数目
async function getNotice() {
    try {
        const response = await axios.get('/notice');
        if(response.data.code === 1){
            data.value = response.data.data;
        }else{
            console.error("获取各个类别消息数目失败");
        }
    } catch (error) {
        console.error("获取各个类别消息数目失败", error); 
    }
}

onMounted(() => {
    getNotice();
})
</script>

<style scoped>
.large{
    display: flex;
}
.large::-webkit-scrollbar {
    width: 0px; 
}
.left{
    width: 18vw;
    display: inline-block;
    margin-top: 40px;
}
.inner{
    width: 150px;
    margin: 36px auto;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
}
.message{
    width: 24px;
    height: 24px;
}
.title{
    color: #000;
    text-align: center;
    font-family: Microsoft YaHei;
    font-size: 20px;
    font-style: normal;
    font-weight: 700;
    line-height: 120%; /* 24px */
}
.router{
    color: #6B757B;
    text-align: center;
    font-weight: 700;
    line-height: 120%; 
    text-decoration: none;
    margin-left: 8px;
    display: block;
}
.first{
    margin-bottom: 40px;
    display: flex;
}
.next{
    margin-bottom: 30px;
    display: flex;
    align-items: flex-end;
    flex-wrap: wrap;
    position: relative;
}
.active{
    color: #1E8FC2;
}
.right{
    display: flex;
    align-items: flex-start;
}

.next-container{
    margin: auto;
    padding: 5px 0 0 0;
}
.next-container a{
    display: block;
    margin-top: 8px;
}
.unread,
.unread-99{
    position: absolute;
    top: -7px;
    height: 16px;
    font-size: 9px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #ff5757;
    color: #fff;
    font-weight: 700;
}
.unread{
    width: 16px;
    border-radius: 50%;
    right: -18px;
}
.unread-99{
    width: 26px;
    border-radius: 50%;
    right: -28px;
}
@media (max-width: 768px) {
    .left{
        width: 200px;
    }
}
</style>
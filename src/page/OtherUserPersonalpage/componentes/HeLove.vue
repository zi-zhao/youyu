<template>
    <div class="main">
        <div class="left_section">
            <div class="ta">
                <img src="@/assets/PersonalPage/TaCare.svg" alt="" class="carepic">
                <span class="text">TA的关注</span>
            </div>
            <div :class="{ allc: true, active: currentTab === 0 }" @click="setTab(0)">
                <span class="text1">全部关注</span>
                <span class="text1">{{ user.subscribeCount }}</span>
            </div>
            <div class="ta">
                <span class="line"></span>
                <img src="@/assets/PersonalPage/TaFans.svg" alt="" class="carepic">
                <span class="text">TA的粉丝</span>
            </div>
            <div :class="{ allc: true, active: currentTab === 1 }" @click="setTab(1)">
                <span class="text1">全部粉丝</span>
                <span class="text1">{{ user.fanCount }}</span>
            </div>
            <div class="ta" @click="back" style="cursor: pointer;">
                <span class="line"></span>
                <img src="@/assets/Back.svg" alt="" class="carepic" >
                <span class="text" >返回个人中心</span>
            </div>
        </div>
        
        <div class="show">
            <component :is="currentComponent"></component>
        </div>
    </div>
</template>

<script setup>
import { ref,onMounted} from 'vue';
import AllCare from "../last/AllCare.vue";
import AllLover from "../last/AllLover.vue";
import { useRouter,useRoute} from 'vue-router';
import { ElMessage } from 'element-plus';
import axios from '@/utils/request';
import { PageTitle } from '@/utils/fileService.js'

const setPageTitle = PageTitle('正在加载...');

const route = useRoute ();
const id = parseInt(route.params.id,10);//路径中的问答ID
const user = ref({});
const currentComponent = ref(AllCare);  // 默认显示 AllCare 组件
const currentTab = ref(0); // 默认选中全部关注

function setTab(value) {
    if (value === 0) {
    currentComponent.value = AllCare;
    } else if (value === 1) {
    currentComponent.value = AllLover;
    }
    currentTab.value = value; // 更新当前选中的选项
}
const router = useRouter();
const back = () => {
    router.push(`/OtherUserPersonalPage/${id}`);
};

// 获取用户信息
const fetchAvatar = async () => {
    try {
        const response = await axios.get(`/users/${id}`);
        if(response.data.code === 1){
            user.value = response.data.data;
            setPageTitle(`${ user.value.username} 的个人主页 - 云联知渔`); 
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
    fetchAvatar();
});
</script>

<style scoped>
.main{
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin: 41px auto 0 auto;
  width: 93%;
}
.left_section{
  display: flex;
  width: 180px;
  flex-direction: column;
  gap: 10px;
}
.ta{
    position: relative;
    margin-top: 12px;
    display: flex;
    padding: 10px 42px 3px 0px;
    align-items: center;
}
.line{
    position: absolute;
    top: 0px;
    left: 0px;
    width: 180px;
    height: 1px;
    background: rgb(212, 212, 212);
}
.carepic{
    width: 16px;
    height: 16px;
}
.text{
    color: #000;
    text-align: center;
    font-family: Microsoft YaHei;
    font-size: 18px;
    line-height: 120%;
    margin-left: 10px;
}
.text1{
    color: #6D757A;
    text-align: center;
    font-family: Microsoft YaHei;
    font-size: 16px;
    line-height: 120%;
    margin-left: 27px;
}
.allc{
    margin-top: 12px;
    height: 19px;
    padding: 8px 10px 8px 0px;
    width: 170px;
    border-radius: 4px;
    display: flex;
    justify-content: space-between;
    cursor: pointer;
}
.active{
    background: #9FA9CA;
}
.active .text1{
    color: #000;
}
.show {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    width: 80%;
    height: auto;
}
</style>


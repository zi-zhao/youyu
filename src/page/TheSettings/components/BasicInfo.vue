<template>
  <div class="T_M" style="display: flex;flex-direction: column;">
    <TitleSection :message=msg :show-btn=false />
    <div class="page">
      <div class="avatar">
        <span class="mid-text">头像</span>
        <img :src='avatar' class="imgBx" alt="">
        <div class="text-btn" @click="ChangeUserAvatar">点击修改头像</div>
      </div>
      <div class="nickname">
        <span class="mid-text">昵称</span>
        <el-input v-model="nickname" style="width: 220px; margin-left: -30px;"></el-input>
        <span style="color: #D2D1D1">注：修改一次需要{{ remainingPoint }}个鱼饵</span>
      </div>
      <div class="gender">
        <span class="mid-text">性别</span>
        <div style="display: flex;gap: 1rem">
          <div class="gender-option" :class="{ active: selectedGender === tag }" v-for="tag in genderTags" :key="tag"
               @click="selectedGender = tag">
            {{ tag }}
          </div>
        </div>
      </div>
      <div class="birthdate">
        <span class="mid-text">出生日期</span>
        <el-date-picker v-model="birthdate" type="date" placeholder="选择日期"/>
      </div>
      <div class="signature">
        <div class="switch-text">
          <span class="foot-text">个性签名</span>
          <!-- <span>展示</span>
          <el-switch v-model="showSignature" inline-prompt active-text="on" inactive-text="off"/> -->
        </div>
        <el-input v-model="signatureText" :maxlength="200" style="width:100%;"></el-input>
      </div>

      <div class="bio">
        <div class="switch-text">
          <span class="foot-text">个人简介</span>
          <!-- <span>展示</span>
          <el-switch v-model="showBio" inline-prompt active-text="on" inactive-text="off"/> -->
        </div>
        <el-input v-model="bioText" :maxlength="200" style="width: 100%;"></el-input>
      </div>

      <div class="achievements">
        <div class="switch-text">
          <span class="foot-text">个人成就</span>
          <!-- <span>展示</span>
          <el-switch v-model="showAchievements" inline-prompt active-text="on" inactive-text="off" /> -->
        </div>
        <el-input v-model="achievementsText" :maxlength="200" style="width: 100%"></el-input>
      </div > 

      <div class="verify">
        <span class="mid-text">个人认证</span>
        <!-- 未认证，点击申请认证 -->
        <div class="text-btn" v-if="userData.verified === 0" @click="goToApplyForVerification">申请认证 ></div>
        <!-- 已认证 -->
        <div v-else style="display: flex;align-items:center;gap: 5px;">
            <span style=" color: #175399;">已认证</span>
            <img  src="@/assets/VerifiedUser.svg" style="width: 16px;height: 16px;" alt="">
        </div>
      </div>

      <YyButton theme="purple" @click="putUserInform">保存</YyButton>
    </div>
    <div v-if="dialogFormVisible">
      <ChangeAvatar v-model="dialogFormVisible" ></ChangeAvatar>
    </div>
  </div>
</template>

<script setup>
import {ref,onMounted,computed} from 'vue';
import TitleSection from "@/page/TheSettings/components/TitleSection.vue";
// import { fetchUserAvatar } from '../../../utils/fileService'; 
import { getUsersAvatarFromCOS } from '@/utils/cosService';
import { ElMessage } from 'element-plus';
import ChangeAvatar from './ChangeAvatar.vue'
import axios from '@/utils/request';
import YyButton from "@/page/components/YyButton.vue";
import { useRouter } from 'vue-router'
import { openUrl } from '@/utils/routeJudge'

const msg = '基本信息'
const router = useRouter();
const avatar = ref('')
const nickname = ref('');
const remainingPoint = ref(5);//修改昵称所需鱼饵值
const genderTags = ref(['男', '女', '未知']);
const selectedGender = ref('');
const birthdate = ref('2001-12-02');
const email = ref('');
const signatureText = ref('');
const bioText = ref('');
const achievementsText = ref('')
const dialogFormVisible = ref(false);

// const showBio = ref(true);
// const showSignature = ref(true);
// const showAchievements = ref(true);


const userId = ref();
const userData = ref([]);

const ChangeUserAvatar = () => {
  dialogFormVisible.value = true;
}

//判断用户性别
const juageUserSex =(gender) =>{
  if(gender === -1) return "未知";
  if(gender === 0) return "女";
  if(gender === 1) return "男";
}

const adverseJuageUserSex =(gender) =>{
  if(gender === '未知') return -1;
  if(gender === "女") return 0;
  if(gender === '男') return 1;
}

//处理时间的函数，因为这里日期的显示用了ele插件，所以不能用封装的通用函数来处理
const convertDateFormat = (dateTimeString) => {
  return dateTimeString.split(" ")[0];
};


//获取用户信息列表
async function getUserInform() {
  try{
    // const response = await axios.get(`/users/${userId.value}?apifoxApiId=100741633`);
   const response = await axios.get(`/users/${userId.value}`);
    if(response.data.code === 1){
      userData.value = response.data.data;
      avatar.value = await getUsersAvatarFromCOS(userData.value.id);
      userData.value.gender = juageUserSex(userData.value.gender);
      selectedGender.value =  userData.value.gender;
      nickname.value = userData.value.username;
      birthdate.value = convertDateFormat(userData.value.birthday);
      email.value =  userData.value.email;
      signatureText.value =userData.value.signature;
      bioText.value = userData.value.description;
      achievementsText.value = userData.value.achievement;
    }else if(response.data.code === 0 && response.data.msg){
        ElMessage.error(response.data.msg.toString());
    }else{
        console.error("获取用户数据失败");
        ElMessage.error('获取用户数据失败');
    }
  } catch (error) {
    console.error("获取用户数据失败", error); 
    ElMessage.error('获取用户数据失败');
  }
}

//修改用户信息
async function putUserInform() {
  const formattedDate = computed(() => {
    const date = new Date(birthdate.value);
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });
  const data = computed(() => ({
    id:userId.value,
    username:nickname.value,
    birthday:formattedDate.value,
    email:email.value,
    achievement:achievementsText.value,
    description:bioText.value,
    signature:signatureText.value,
    gender:adverseJuageUserSex(selectedGender.value),
  }));
  try {
    const response = await axios.put('/users',data.value);
    if(response.data.code === 1){
      localStorage.setItem('userName',nickname.value);
      ElMessage.success("修改个人信息成功");
    }else if(response.data.code === 0 && response.data.msg){
      ElMessage.error(response.data.msg.toString());
    }else{
      console.error("修改个人信息失败");
      ElMessage.error("修改个人信息失败");
    }
  } catch (error) {
    console.error("修改个人信息失败", error); 
    ElMessage.error("修改个人信息失败");
  }
}

// 跳转至认证用户申请页面
const goToApplyForVerification = () =>{
  // const routeLocation = router.resolve({ path: `/VerificationApplication` });
  // window.open(routeLocation.href, '_blank');
  openUrl(`/VerificationApplication`)
}

onMounted(() => {
  userId.value = localStorage.getItem("userId"); // 获取用户ID
  getUserInform();
})



</script>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  gap: 30px;
  padding: 30px 50px;
  overflow: auto;
}

.head {
  color: #8290C0;
  display: flex;
  align-items: center;
  padding-left: 10px;
  border-left: 4px solid #8290C0;
}
.text-btn{
  color: #175399;
  cursor: pointer;
}
.avatar {
  display: flex;
  align-items: center;
}

.mid-text {
  width: 200px;
  color: #7D7979;
}

.imgBx {
  padding: 0;
  margin: 0;
  border: 1px solid #c0c0c0;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  margin-right: 20px;
}

.nickname {
  display: flex;
  align-items: center;
  gap: 30px;
}

.gender {
  display: flex;
}

.gender-option {
  padding: 4px 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.gender-option:hover {
  background-color: #d7def1;
}

.gender-option.active {
  color: #FFF;
  background-color: #9FA9CA;
}

.birthdate {
  display: flex;
}

.email {
  display: flex;
}

.switch-text{
  display: flex;
  gap: 40px;
  align-items: center;
}

.signature,.bio,.achievements{
  display: flex;
  flex-direction: column;
  gap: 25px;
}
.verify{
  display: flex;
}
.foot-text{
  color: #7D7979;
}
/* 调整滚动条宽度和颜色 */
::-webkit-scrollbar {
    width: 6px; /* 增加纵向滚动条的宽度 */
    height: 8px; /* 增加横向滚动条的高度 */
    background: transparent;
}

/* 定义滚动条轨道，设置为透明 */
::-webkit-scrollbar-track {
    box-shadow: inset 0 0 8px rgba(0, 0, 0, 0); /* 内阴影 */
    background: transparent; /* 将轨道背景设置为透明 */
}

/* 定义滑块，设置为浅灰色并增加内阴影 */
::-webkit-scrollbar-thumb {
    box-shadow: inset 0 0 8px rgba(115, 115, 115, 0.3); /* 添加淡灰色内阴影 */
    background-color: #dbdbdb; /* 滑块的颜色改为浅灰色 */
    border-radius: 10px; /* 保持圆角不变 */
}
/* 当鼠标悬停在滚动条滑块上时改变滑块的颜色 */
::-webkit-scrollbar-thumb:hover {
    background: #c6c6c6;
}
</style>

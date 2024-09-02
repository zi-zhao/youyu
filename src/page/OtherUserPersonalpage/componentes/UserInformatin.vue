<template>
  <div>
    <div class="my_box">
      <img class="personal_bgc" src="@/assets/PersonalPage/PersonalBackground.jpg" alt="">
      <div class="avatar-box">
        <img :src="user.newAvatar" alt="User Avatar" class="pic" />
        <div class="user_like" @click="navigateToHelover">
          <div v-for="(stat, index) in userStatsArray" 
              :class="['container', index < 2 ? 'first_two' : 'last_two']" 
              :key="stat.label">
              <span class="text">{{ stat.label }}</span>
              <span class="text">{{ stat.value }}</span>
          </div>
        </div>
      </div>
    </div>
    <div class="user">
      <div class="usershow">
        <span class="name">{{ user.username }}</span>
        <div class="show">
          <div class="skill">
            <span class="name2">教育经历:</span>
            <span class="utext">{{ user.school }}</span>
            <span class="utext">{{ user.major }}</span>
          </div>
          <div class="skill">
            <span class="name2">个性签名:</span>
            <span class="utext">{{ user.signature }}</span>
          </div>
          <div v-if="showDetails">
            <div class="skill">
              <span class="name2">个人成就:</span>
              <span class="utext">{{ user.achievement }}</span>
            </div>
            <div class="skill">
              <span class="name2">个人简历:</span>
              <span class="utext">{{ user.description }}</span>
            </div>
          </div>
          <div class="button">
            <span class="htext" @click="toggleDetails">
                <img src="@/assets/PersonalPage/UserinfoFold.svg" alt="" v-if="showDetails">
                <img src="@/assets/PersonalPage/UserinfoUnfold.svg" alt="" v-else>
                {{ buttonText }}
            </span>
            <div class="button_container">
              <button
                class="hover"
                :class="{ followed: isFollowing }"
                style="color: #000000;"
                @click="followUser"
              >
                {{ isFollowing ? "已关注" : "+关注" }}
              </button>
              <!-- <button class="button1">发消息</button> -->
              <!-- <button class="button1" @click="goToQuestion">去提问</button> -->
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted,computed} from "vue";
import axios from "@/utils/request";
import { useRouter } from "vue-router";
import { getUsersAvatarFromCOS } from '@/utils/cosService';
import { ElMessage } from 'element-plus';
import { useStore } from 'vuex';
import { PageTitle } from '@/utils/fileService.js'
import { openUrl } from '@/utils/routeJudge'

const setPageTitle = PageTitle('正在加载...');
const router = useRouter();
const user = ref({});
const showDetails = ref(false);
const buttonText = ref("查看详细资料");
const isFollowing = ref(false);
const store = useStore();

//获取用户id
const getPathParams = () => {
  const currentURL = window.location.href;
  const match = currentURL.match(/\/OtherUserPersonalPage\/(\d+)/);
  if (match) {
      const pageNumber = match[1];
      return pageNumber;
  } else {
      console.log('页面地址中没有找到数字部分。');
  }
}
const userId = getPathParams();
const userId2 = parseInt(userId, 10);
store.commit('GETOTHERUSERID', userId2);

const userStatsArray = computed(() => [
  { label: '关注数', value: user.value.subscribeCount },
  { label: '粉丝数', value: user.value.fanCount },
]);

//获取用户的关注状态
async function deterFocus() {
  try {
    const response = await axios.get(`/users/subscribe/state/${userId2}`)
    if (response.data && response.data.code === 1) {
      isFollowing.value = response.data.data === 1;
    } else if(response.data.code === 0 && response.data.msg){
        ElMessage.error(response.data.msg.toString());
    }else {
      console.error(response.data.msg || 'Unknown error');
      ElMessage.error('获取关注状态失败');
    }
  } catch (error) {
    console.error('获取关注状态失败', error.message);
    ElMessage.error('获取关注状态失败');
  }
}

onMounted(async () => {
  await deterFocus();
  try {
    const response = await axios.get(`/users/${userId}`);
    user.value = response.data.data;
    setPageTitle(`${ user.value.username} 的个人主页 - 云联知渔`); 
    user.value.newAvatar = await getUsersAvatarFromCOS(user.value.id);
    console.log(user);
  } catch (error) {
    console.error("Error fetching user data:", error);
    ElMessage.error('获取用户信息失败');
  }
});


const toggleDetails = () => {
    showDetails.value = !showDetails.value;
    buttonText.value = showDetails.value ? "收起详细资料" : "查看详细资料";
  };

//关注用户接口
async function followUser() {
  try {
    const response = await axios.put(`users/subscribe/${userId2}`);
    if (response.data && response.data.code === 1) {
      isFollowing.value = isFollowing.value === 0 ? 1 : 0;
    } else if(response.data.code === 0 && response.data.msg){
      ElMessage.error(response.data.msg.toString());
    }else {
      console.error(response.data.msg || 'Unknown error');
      ElMessage.error('关注用户失败了哦');
    }
  } catch (error) {
    console.error('关注用户失败了哦', error.message);
    ElMessage.error('关注用户失败了哦');
  }
}

//跳转到用户的关注列表页面
const navigateToHelover = () => {
  router.push(`/OtherUserPersonalPage/helover/${userId}`);
};

//跳转到提问界面
const goToQuestion = () =>{
  // const routeLocation = router.resolve({ path: `/GoQuestion/${userId}`});
  // window.open(routeLocation.href, '_blank');
  openUrl(`/GoQuestion/${userId}`)

}


</script>

<style scoped>
  .my_box {
    width: 93%;
    height: 225px;
    position: relative;
    margin: 41px auto 0 auto;
    background-size: cover; /* 使背景图片完全覆盖该盒子 */
    background-position: center; /* 使背景图片居中 */
    background-repeat: no-repeat; /* 防止背景图片重复 */
  }
  .personal_bgc{
    width: 100%;
    height: 100%;
  }
  .avatar-box{
    position: absolute;
    left: 45px;
    top: 90px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 15px;
  }
  .pic {
    width: 160px;
    height: 160px;
    border-radius: 8px;
    border: 4px solid #fff;
    background-size: cover; 
    background-position: center; 
    background-repeat: no-repeat;
    z-index: 1000; 
  }
  .user {
    width: 745px;
    height: 170px;
    position: relative;
    margin: 30px auto 0 auto;
  }
  .user_like {
    display: flex;
    justify-content: space-evenly;
    width: 100%;
  }
  .first_two:hover{
    cursor: pointer;
  }
  .first_two:hover .text{
    color: #67ABFF;
  }
  .user_like .container:last-child {
    margin-right: 0; /* 使最后一个.container没有右边间隔 */
  }
  .container.first_two {
    display: flex;
    gap: 3px;
  }
  .text {
    color: #aaa;
    text-align: center;
    font-size: 12px;
    line-height: 1.6; 
  }
  .usershow {
    position: absolute;
    display: flex;
    top: 0px;
    left: 60px;
    width: 95%;
    align-items: flex-start;
  }
  .name {
    color: #000;
    text-align: center;
    font-family: Microsoft YaHei;
    font-size: 22px;
    font-style: normal;
    white-space: nowrap;
    font-weight: 700;
    line-height: 120%; /* 28.8px */
  }
  .show {
    margin-top: 15px;
    display: flex;
    flex-direction: column;
  }
    
  .button {
    display: flex;
    margin-bottom: 12px;
  }
  .suc{
    height: 29px;
    align-items: flex-end;
  }
  .skill{
    margin: 2px 30px;
    line-height: 25px;
  }
  .show .button:last-child {
    margin-bottom: 0; /* 确保最后一个子元素没有额外的底部边距 */
  }
  .button_container {
    gap: 20px;
    margin-top: 30px;
    position: absolute;
    right: -140px;
  }
  .name2 {
    color: #000;
    text-align: center;
    font-family: Microsoft YaHei;
    font-size: 14px;
    font-style: normal;
    font-weight: 700;
    line-height: 120%; /* 16.8px */
  }
  .utext {
    max-width: 327px;
    margin-left: 15px;
    color: #000;
    text-align: center;
    font-family: Microsoft YaHei;
    font-size: 14px;
    font-style: normal;
    font-weight: 400;
    line-height: 120%; /* 16.8px */
    white-space: pre-line; /* 实现换行后依然顶格显示 */
    text-align: left; /* 设置文本右对齐 */
    direction: ltr; /* 从右到左显示文本，每一行都靠右对齐 */
  }
  .hover {
    /* margin-right: 10px; */
    padding: 6px 17px;
    justify-content: center;
    align-items: center;
    gap: 10px;
    border-radius: 4px;
    background: #9fa9ca;
    border: 1px solid #ccd0d7;
    cursor: pointer;
  }

  .followed {
    padding: 6px 17px;
    justify-content: center;
    align-items: center;
    gap: 10px;
    border-radius: 4px;
    background: #b5bfd0;
    cursor: pointer;
  }
  .button1 {
    margin-left: 10px;
    padding: 6px 17px;
    justify-content: center;
    align-items: center;
    gap: 10px;
    border-radius: 4px;
    border: 1px solid #ccd0d7;
    background: #fff;
    cursor: pointer;
    color: #000000;
  }
  .button1:hover {
    background: #edeff2; /* 这是一个稍微深一点的颜色，您可以根据需要调整 */
  }
  .htext {
    color: #797979;
    text-align: center;
    font-family: Microsoft YaHei;
    font-size: 12px;
    margin: 10px 0px 10px 27px;
    line-height: 120%; 
    cursor: pointer;
  }
</style>


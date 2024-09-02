<template>
  <div>
    <div class="my_box">
      <img class="personal_bgc" src="@/assets/PersonalPage/PersonalBackground.jpg" alt="">
      <div class="avatar-box">
        <img :src="user.newAvatar" alt="User Avatar" class="pic" />
        <div class="user_like" @click="navigateToHelover">
          <div v-for="(stat) in userStatsArray" 
              class="container first_two" 
              :key="stat.label">
              <span class="text">{{ stat.label }}</span>
              <span class="text">{{ stat.value }}</span>
          </div>
        </div>
      </div>
    </div>
    <div class="user">
      <div class="usershow">
        <div style="display: flex;align-items: center;gap: 3px;">
            <span class="name">{{ user.username }}</span>
            <img v-if="user.verified === 1" src="@/assets/VerifiedUser.svg" style="width: 16px;height: 16px;" alt="">
        </div>
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
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, onMounted,computed,watch} from "vue";
  import axios from "@/utils/request";
  import { useRouter } from "vue-router";
  import { getUsersAvatarFromCOS } from '@/utils/cosService';
  import { ElMessage } from 'element-plus';
  import { PageTitle } from '@/utils/fileService.js'

  const setPageTitle = PageTitle('正在加载...');
  const userId = localStorage.getItem("userId");
  const router = useRouter();
  const user = ref({});
  const showDetails = ref(false);
  const buttonText = ref("查看详细资料");
  const userStatsArray = computed(() => [
  { label: '关注数', value: user.value.subscribeCount },
  { label: '粉丝数', value: user.value.fanCount },
]);

  const toggleDetails = () => {
      showDetails.value = !showDetails.value;
      buttonText.value = showDetails.value ? "收起详细资料" : "查看详细资料";
    };


  const navigateToHelover = () => {
    router.push(`/PersonalPage/helover`);
  };


  onMounted(async () => {
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
  // 监听路由变化以设置标签页标题
  watch(() => router.currentRoute.value, (newRoute) => {
    if (newRoute.path === '/PersonalPage') {
      setPageTitle(`${ user.value.username} 的个人主页 - 云联知渔`);
    }
  });

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
    right: 30px;
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

<template>
    <div class="alove">
      <div class="cbutton">
        <span class="tatitle">TA的粉丝</span>
        <span class="line2"></span>
      </div>
      <div v-if="userlist || userlist.length !== 0" class="container" v-infinite-scroll="load" infinite-scroll-distance="100" infinite-scroll-immediate="false">
        <div v-for="(user, index) in userlist" :key="index" class="care_box">
          <div class="asset">
            <img :src="user.newAvatar" class="upic">
            <div class="show">
              <div class="user">
                <span class="uname">{{ user.fanUsername }}</span>
              </div>
              <div class="achieve">
                <span class="intro">个人成就：</span>
                <span class="intro">{{ user.achievement }}</span>
              </div>
              <div class="achieve">
                <span class="intro">个人简介：</span>
                <span class="intro">{{ user.description }}</span>
              </div>
            </div>
            <div class="carebutton">
              <el-button v-if="user.focusStatus" type="primary" round @click="followUser(user)" class="focus">已关注</el-button>
              <el-button v-else type="primary" round  @click="followUser(user)" class="gofocus">+关注</el-button>
            </div>
          </div>
        </div>
      </div>
      <el-empty 
          v-else
          :image-size="200" 
          description="他还没有粉丝呢！"
      />
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from "vue";
  import axios from '@/utils/request';
  import { ElMessage } from 'element-plus';
  import { getUsersAvatarFromCOS } from '@/utils/cosService';
  import { convertDateFormat } from '@/utils/timeFormat';

  
  const currentPage = ref(1);
  const userlist = ref([]);
  
  //获取用户id
  const getPathParams = () => {
    const currentURL = window.location.href;
    const match = currentURL.match(/\/OtherUserPersonalPage\/helover\/(\d+)/);
    if (match) {
        const pageNumber = match[1];
        return pageNumber;
    } else {
        console.log('页面地址中没有找到数字部分。');
    }
  }
  const userId = getPathParams();

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
        const updates = response.data.data.records;
        for (let record of updates) {
          record.createTime = convertDateFormat(record.createTime);
          record.newAvatar = await getUsersAvatarFromCOS(record.fanId);
          record.focusStatus  = deterFocus(record)
        }
        userlist.value = [...userlist.value, ...updates];
      }else if (response.data.code === 1 && response.data.data.records.length === 0) {
          // ElMessage.info('已加载所有数据');
      }else if(response.data.code === 0 && response.data.msg){
          ElMessage.error(response.data.msg.toString());
      }else{
          console.error("获取用户粉丝数据失败");
          ElMessage.error("获取用户粉丝数据失败");
      }
      } catch (error) {
        console.log(error);
        ElMessage.error('获取用户粉丝数据失败');
      }
    }

  //判断关注状态
  async function deterFocus(record) {
    try {
      const response = await axios.get(`/users/subscribe/state/${record.starId}`)
      if (response.data.code === 1 && response.data.data.records.length > 0) {
        record.focusStatus.value = response.data.data;
        console.log('获取关注状态成功');
        console.log(record.focusStatus.value);
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

    //关注用户接口
    async function followUser(user) {
    try {
      const response = await axios.put(`users/subscribe/${user.starId}`);
      user.focusStatus.value = user.focusStatus.value === 0 ? 1 : 0;
      if (response.data && response.data.code === 1) {
        console.log('用户已关注/用户已取消关注');
      } else if(response.data.code === 0 && response.data.msg){
          ElMessage.error(response.data.msg.toString());
      }else {
        console.error(response.data.msg || 'Unknown error');
        ElMessage.error('关注/取消关注 失败了哦');
      }
    } catch (error) {
      console.error('关注/取消关注 失败了哦', error.message);
      ElMessage.error('关注/取消关注 失败了哦');
    }
  }

  onMounted(() => {
    getMyFocusNote(currentPage.value)
  })



</script>

<style scoped>
.alove{
  width: 100%;
}
.cbutton{
  position: relative;
  width: 98%;
  padding: 1%;
  right: 0px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.tatitle{
  color: #000; 
  text-align: center;
  line-height: 1.6;
  font-size: 23px;
}
.line2 {
  position: absolute;
  bottom: 0px;
  left: 0px;
  width: 100%;
  height: 1px;
  background: rgb(212, 212, 212);
}
.asset{
  margin: 8px 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.container{
  position: relative;
  height: 80vh;
  overflow-y: auto;
  overflow-x: hidden;
}
.care_box{
  margin: 10px 0px;
  padding: 5px 30px;
}
.upic{
  width: 60px;
  height: 60px;
  flex-shrink: 0;
  border-radius: 60px;
}
.show{
  display: flex;
  flex-direction: column;
  gap: 5px;
  width: 78%;
  margin-top: 10px;
}
.uname{
  color: #000;
  text-align: center;
  font-family: Microsoft YaHei;
  font-size: 16px;
  font-weight: 700;
  line-height: 1.6; 
}
.intro{
  color: #000;
  text-align: center;
  font-size: 14px;
  line-height: 1.6; 
}
.user{
  display: flex;
  align-items: flex-end;
  gap: 4px;
}
.achieve{
  display: flex;
  align-items: center;
  gap: 12px;
}
.carebutton .el-button{
  padding: 5px 15px;
  border: none;
  border: 1px solid #D9DCE1;
}
.focus{
  background-color: #E5E9EF;
  color: #6D758B;
}
.gofocus{
  background-color: #fff;
  color: #6D758B;
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
    box-shadow: inset 0 0 8px rgba(145, 145, 145, 0.3); /* 添加淡灰色内阴影 */
    background-color: #e2e2e2; /* 滑块的颜色改为浅灰色 */
    border-radius: 10px; /* 保持圆角不变 */
}
/* 当鼠标悬停在滚动条滑块上时改变滑块的颜色 */
::-webkit-scrollbar-thumb:hover {
    background: #c8c8c8;
}
</style>
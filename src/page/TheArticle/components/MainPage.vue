<template>
  <!--用户头像和关注按钮  -->
  <div class="buttom">
    <div class="user1">
        <div class="user">
          <img 
              :src="userAvatar"
              alt=""
              class="navbar-avatar"
              @click="navigateToUserProfile"
            >
        </div>
        <div style="display: flex;align-items: center;gap: 3px;">
            <span style="font-weight: 700;">{{ user.username }}</span>
            <img v-if="user.verified === 1" src="@/assets/VerifiedUser.svg" style="width: 16px;height: 16px;" alt="">
        </div>
        <div class="user-button">
            <el-button v-if="focusStatus" type="primary" round @click="followUser">已关注</el-button>
            <el-button v-else type="primary" round  @click="followUser">+关注</el-button>
        </div>
    </div>
    
    <div class="icons-container">
        <!-- 点赞盒子 -->
        <div class="icon-wrapper">
          <img class="like-pic" :src="likeStatus === 0 ? unlikedImage : likedImage " @click="toggleLike">
          <span class="like_num">{{ articleData.likeCount }}</span>
        </div>
        <!-- 收藏盒子 -->
        <div class="icon-wrapper">
          <img class="like-pic" :src="favoriteStatus === 0  ? unfavoritedImage : favoritedImage" @click="dialogFormVisible = true">
          <span class="like_num">{{ articleData.favoriteCount }}</span>
        </div>
        <div v-if="dialogFormVisible">
          <CfDialog  v-model="dialogFormVisible" @updateValue="handleUpdateValue" ClassifyName="文章收藏"></CfDialog>
        </div>
        <!-- 打赏盒子 -->
        <!-- <div class="icon-wrapper" @click="emptyDialogVisible = true">
          <img class="like-pic" :src="insertcoinsStatus === 0  ? uninsertcoinsImage : insertcoinsImage">
          <span class="like_num">{{ articleData.rewardCount }}</span>
        </div> -->
        <el-dialog class="reward" v-model="emptyDialogVisible" style="width: 310px; border-radius: 34px; overflow: hidden;">
          <div class="top-bgi">
            <img src="@/assets/RewardBgi.svg" alt="">
          </div>
          <div class="bot-bgi">
            <div class="flex-container">
              <p>给作者打赏</p>
              <el-input v-model="input" placeholder="请输入" class="custom-input" />
              <p>个渔币</p>
            </div>
            <div class="button-container">
              <div class="custom-button" type="info" plain @click="articleReward">打赏</div>
            </div>
          </div>
        </el-dialog>

      </div>
  </div>
</template>
  
<script setup>
import { ElMessage } from 'element-plus';
import { ref,onMounted,watch} from 'vue';
import axios from '@/utils/request';
import { getUsersAvatarFromCOS } from '@/utils/cosService';
import unfavoritedImage from '@/assets/FavoriteBefore.svg';
import favoritedImage from '@/assets/FavoriteAfter.svg'; 
import { useRouter,useRoute} from 'vue-router';
import CfDialog from '@/page/components/CfDialog';
// 点赞部分的动画toggleLike
import unlikedImage from '@/assets/LikeBefore.svg';
import likedImage from '@/assets/LikeAfter.svg';
import uninsertcoinsImage from '@/assets/InsertCoins.svg'
import insertcoinsImage from '@/assets/InsertCoinsAfter.svg'
import { openUrl } from '@/utils/routeJudge'

const route = useRoute();
const input = ref('');//文章打赏的数额
const emptyDialogVisible = ref(false);
const userAvatar = ref('');  // 这里保存从后端获取的头像 URL
const router = useRouter();
const dialogFormVisible = ref(false);//控制cfdialog弹窗（显示文章收藏列表）是否弹出
const likeStatus = ref();//判断该用户是否对文章点赞，页面初始化与用户进行点赞操作时会用到,0为未点赞
const focusStatus = ref();//判断该用户是否关注文章作者，页面初始化与用户进行关注操作时会用到,0为未关注
const favoriteStatus = ref(0);//判断该用户是否收藏该文章，页面初始化与用户进行收藏操作时会用到,0为未收藏
const insertcoinsStatus = ref(0);//判断该用户是否投币该文章，页面初始化与用户进行投币操作时会用到,0为未投币
const favoriteId = ref();//用户选择的收藏的ID
const articleData = ref({});//存放文章数据
const articleId = parseInt(route.params.id,10);//路径中的文章ID
const articleAuthorId = ref(-1);
const user_id = localStorage.getItem("userId");
const article_id = articleId; 
const user = ref({});


//点击用户头像进行跳转
const navigateToUserProfile = () => {
    if(user_id == articleAuthorId.value){
      // const routeLocation = router.resolve({ path: '/PersonalPage' });
      // window.open(routeLocation.href, '_blank');
      openUrl('/PersonalPage')
    }else{
      // const routeLocation = router.resolve({ path: `/OtherUserPersonalPage/${articleAuthorId.value}`});
      // window.open(routeLocation.href, '_blank');
      openUrl(`/OtherUserPersonalPage/${articleAuthorId.value}`)
    }
};

// 获取用户信息
const fetchAvatar = async (articleAuthorId) => {
  try {
    const response = await axios.get(`/users/${articleAuthorId}`);
    if(response.data.code === 1){
      user.value = response.data.data;
      userAvatar.value = await getUsersAvatarFromCOS(articleAuthorId);
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


//接受cfdialog返回的数据，从而确定收藏Id
const handleUpdateValue = (data) => {
  favoriteId.value = data[0];
}

//文章收藏相关接口
async function toggleFavorite() {
  dialogFormVisible.value = true;
  try {
    const response = await axios.post(`/favorite/article`,{favoriteId: favoriteId.value, contentId: articleId });
    if ( response.data.code === 1) {
      favoriteStatus.value = 1;
      articleData.value.favoriteCount =  response.data.data;
      ElMessage.success('文章收藏成功');
    } else if(response.data.code === 0 && response.data.msg){
        ElMessage.error(response.data.msg.toString());
    }else {
      console.error(response.data.msg || 'Unknown error');
      ElMessage.error('文章收藏失败');
    }
  } catch (error) {
    console.error('文章收藏失败', error.message);
    ElMessage.error('文章收藏失败');
  }
}

// 使用 watch 来监听 favoriteId 的变化
watch(favoriteId, (newVal, oldVal) => {
  if (newVal !== oldVal) {
    toggleFavorite();
  }
});

//文章打赏功能
async function articleReward() {
  try {
    const response = await axios.post(`/article/reward`,{
      userId:user_id,
      rewardedUserId:articleAuthorId.value,
      articleId:articleId,  
      rewardCount:input.value,
    });
    if (response.data.code === 1) {
      insertcoinsStatus.value = 1;
      ElMessage.success('文章打赏成功')
      emptyDialogVisible.value = false;
      articleData.value.rewardCount =  response.data.data;
    } else if(response.data.code === 0 && response.data.msg){
      ElMessage.error(response.data.msg.toString());
    }else {
      console.error('文章打赏失败', response.data.msg || 'Unknown error');
      ElMessage.error('文章打赏失败');
    }
  } catch (error) {
    console.error('文章打赏失败:', error.message);
    ElMessage.error('文章打赏失败');
  }
}

//获取文章内容
async function fetchArticleContent(id) {
  try {
    const response = await axios.get(`/article/${id}`);
    if (response.data && response.data.code === 1) {
      articleData.value =  response.data.data;
      articleAuthorId.value = articleData.value.userId;
      await deterFocus(articleAuthorId.value); 
      await fetchAvatar(articleAuthorId.value);
    } else if(response.data.code === 0 && response.data.msg){
        ElMessage.error(response.data.msg.toString());
    }else {
      console.error('获取文章数据失败', response.data.msg || 'Unknown error');
      ElMessage.error('获取文章数据失败');
    }
  } catch (error) {
    console.error('网络错误:', error.message);
    ElMessage.error('获取文章数据失败');
  }
}

//判断点赞状态
async function determineImage(articleId) {
  try {
    const response = await axios.get(`/like/state`,{
      params: {
        id: articleId,
        type: 0,
      }
    });
    if (response.data && response.data.code === 1) {
      likeStatus.value = response.data.data;
    } else if(response.data.code === 0 && response.data.msg){
        ElMessage.error(response.data.msg.toString());
        ElMessage.error('获取点赞状态失败');
    }else {
      console.error(response.data.msg || 'Unknown error');
    }
  } catch (error) {
    console.error('获取点赞状态失败', error.message);
  }
}

//判断收藏状态
async function deterFavorite(articleId) {
  try {
    const response = await axios.get(`/favorite/article/${articleId}`)
    if (response.data && response.data.code === 1) {
      favoriteStatus.value = response.data.data;
    } else if(response.data.code === 0 && response.data.msg){
        ElMessage.error(response.data.msg.toString());
    }else {
      ElMessage.error('判断收藏状态失败');
      console.error(response.data.msg || 'Unknown error');
    }
  } catch (error) {
    console.error('获取点赞状态失败', error.message);
    ElMessage.error('获取收藏状态失败');
  }
}

//判断关注状态
async function deterFocus(id) {
  try {
    const response = await axios.get(`/users/subscribe/state/${id}`)
    if (response.data && response.data.code === 1) {
      focusStatus.value = response.data.data;
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

//判断打赏状态
async function deterReward(articleId) {
  try {
    const response = await axios.get(`/article/reward/state/${articleId}`)
    if (response.data && response.data.code === 1) {
      insertcoinsStatus.value = response.data.data;
    } else if(response.data.code === 0 && response.data.msg){
      ElMessage.error(response.data.msg.toString());
    }else {
      console.error(response.data.msg || 'Unknown error');
      ElMessage.error('获取打赏状态失败');
    }
  } catch (error) {
    console.error('获取打赏状态失败', error.message);
    ElMessage.error('获取打赏状态失败');
  }
}

//点赞相关方法
async function toggleLike() {
  try {
    const config = likeStatus.value === 0
      ? {
        method: 'put',
        url: `/article/like`,
        data: { userId: user_id , articleId: article_id}
      }
      : {
        method: 'delete',
        url: `/article/unlike`,
        data: { userId: user_id , articleId: article_id}
      };
    const response = await axios(config);
    if (response.data && response.data.code === 1) {
      likeStatus.value = likeStatus.value === 0 ? 1 : 0;
      articleData.value.likeCount = response.data.data;
    } else if(response.data.code === 0 && response.data.msg){
      ElMessage.error(response.data.msg.toString());
    }else {
      ElMessage.error('点赞操作失败');
      console.error(response.data.msg || 'Unknown error');
    }
  } catch (error) {
    console.error('点赞/取消赞', error.message);
    ElMessage.error('点赞/取消赞');
  }
}

//关注用户接口
async function followUser() {
  try {
    const response = await axios.put(`users/subscribe/${articleAuthorId.value}`);
    if (response.data.code === 1) {
      focusStatus.value = focusStatus.value === 0 ? 1 : 0;
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

onMounted(() => {
  fetchArticleContent(articleId);
  deterReward(articleId);
  determineImage(articleId);
  deterFavorite(articleId);
});

</script>

<style scoped>
.buttom {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 85%;
    height: auto;  
    padding: 45px 20px;  
    margin: 0px auto;
    box-shadow: 0px 1px #E8E8E8;
    flex-wrap: nowrap;  
}
.user {
  display: flex;
  align-items: center;
  width: 60px;
  height: 60px;
  margin-left: 20px;
  margin-right: 0.5rem;
}
.user1 {
    display: flex;
    align-items: center; 
    height: 70px;
}
.user-button .el-button{
  height: 30px;
  margin-left: 1rem;
  padding: 0px 10px;
  background-color: #9fa9ca;
  border: none;
}
::v-deep .el-button>span{
  color: #00002d;
  font-size: 12px;
  letter-spacing: 1px;
}
.icons-container {
    display: flex;
    gap: 10px;
}
.icon-wrapper {
  display: inline-block; 
  text-align: center;   
  margin: 0 10px;       
}

.like-pic {
  display: block;    
  margin: 0px auto 3px;    
  height: 28px;
  width: 28px;
  cursor: pointer;
}
.like_num {
    text-align: center;
    display: contents;
    color: #2d2d2d;
}

/* 打赏弹框 */
::v-deep .reward .el-dialog__header {
    padding: 0;
    margin-right: 0px;
}
::v-deep .reward .el-dialog__body{
  padding: 0;
}
.bot-bgi {
    height: 35%;
    background: #FDFBF6;
    padding-top: 2rem;
}
.flex-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  margin-bottom: 2rem;
}
.custom-input {
  width: 64px;
  height: 30px;
}
:deep .custom-input .el-input__inner{
  text-align: center;
}
.button-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding-bottom: 15px;
}
.custom-button {
  height: 30px;
  padding: 0px 10px;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  border-radius: 8px;
  background: #9FA9CA;
  cursor: pointer;
}
.navbar-avatar {
    display: inline-block; 
    width: 55px;
    height: 55px;
    border-radius: 50%;
    cursor: pointer;
    margin-right: 10px; 
}
@media (max-width:768px){
  .buttom{
      width: auto;
      padding: 0.5rem;
  }
  .user{
      width: 3rem;
      height: 3rem;
      margin-left: 0px;
      margin-right: 0.1rem;
  }
  .navbar-avatar{
      width: 3rem;
      height: 3rem;
  }
  .user-button .el-button{
    height: 1.7rem;
    padding: 0px 0.5rem;
  }
  .icons-container{
      gap: 0px;
  }
  .like-pic{
      margin: 0 auto;
      height: 1.2rem;
      width: 1.2rem;
  }
  .like_num{
      font-size: 0.8rem;
  }
}
</style>
  
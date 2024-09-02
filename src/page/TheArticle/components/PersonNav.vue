<template>
  <TheHeader></TheHeader>
  <h1 class="title1">
    <div>{{ article.title }}</div>
  </h1>
  <div class="nav2">
    <div class="contain1">
      标签：
      <div class="tag-cla" v-for="label in article.label" :key="label">{{ label }}</div>
    </div>
    <div class="contain2">
    分类:
      <div class="tag-cla">{{ article.subBoardName }}</div>
    </div>
  </div>
  <div class="introduction">
    <div class="content1" >
      <div style="line-height: 1.6;" v-html="article.summary "></div>
    </div>
  </div>

</template>

<script setup>
  import { ref  } from 'vue';
  import axios from '@/utils/request';
  import { ElMessage } from 'element-plus';
  import TheHeader from '../../components/TheHeader.vue';
  import { getUsersAvatarFromCOS } from '@/utils/cosService';

  const userAvatar = ref(null);  // 这里保存从后端获取的头像 URL
  const userData = ref('');//存放文章作者数据
  const article = ref({});

  //获取用户点击文章id
  const getPathParams = () => {
    // 获取当前页面的完整 URL
    const currentURL = window.location.href;
    // 使用正则表达式来匹配 URL 中的数字部分
    const match = currentURL.match(/\/TheArticle\/(\d+)/);
    // 如果匹配成功，match[1] 就包含了数字部分
    if (match) {
        const pageNumber = match[1];
        return pageNumber;
    } else {
        console.log('页面地址中没有找到数字部分。');
    }
  }

  const articleId = getPathParams()
  async function fetchArticleContent(id) {
    try {
      const response = await axios.get(`/article/${id}`);
      if (response.data && response.data.code === 1) {
        const data = response.data.data;
        article.value.userId = data.userId;
        article.value.username = data.username;
        article.value.createTime = data.createTime;
        article.value.summary = data.summary;
        article.value.title = data.title;
        article.value.label = data.label.split(','); 
        article.value.subBoardName = data.subBoardName; 
        fetchAvatar();
      } else if(response.data.code === 0 && response.data.msg){
          ElMessage.error(response.data.msg.toString());
      }else {
        console.error('无法找到匹配文章数据', response.data.msg || 'Unknown error');
      }
    } catch (error) {
      console.error('无法获取接口数据', error.message);
    }
    fetchUserData();
  }

  async function fetchUserData() {
    try {
     // const response = await axios.get(`/users/${article.value.userId}?apifoxApiId=100741633`);
       const response = await axios.get(`/users/${article.value.userId}`);
      if (response.data && response.data.code === 1) {
        userData.value = response.data.data;
      }else if(response.data.code === 0 && response.data.msg){
          ElMessage.error(response.data.msg.toString());
      }else {
        console.error('无法找到匹配文章数据', response.data.msg || 'Unknown error');
      }
    } catch (error) {
      console.error('无法获取接口数据', error.message);
    }
  }


  // 获取用户头像
  const fetchAvatar = async () => {
    try {
        const avatar = await getUsersAvatarFromCOS(article.value.userId);
        userAvatar.value = avatar;
    } catch (error) {
        console.error("Error fetching user avatar:", error);
    }
  };

  // const navigateToUserProfile = () => {
  //     console.log('点击用户头像跳转');
  //     const routeLocation = router.resolve({ path: '/PersonalPage' });
  //     window.open(routeLocation.href, '_blank');
  // };       


  fetchArticleContent(articleId);

</script>


<style scoped>

* {
  margin: 0;
  padding: 0;
}

.title1{
  margin-top: 60px;
  text-align: center;
  color: #000;
  font-family: Microsoft YaHei;
  letter-spacing: 3px;
  font-size: 2.5rem;
  font-style: normal;
  font-weight: 700;
  line-height: normal;
}
body h1 {
  font-weight: normal;
}

.nav2 {
  position: relative;
  height: 55px;
  flex-shrink: 0;
  margin-top: 1vh; 
  background-color: #f7f7f7;
  display: flex;            
  justify-content: center;  
  align-items: center;      
  gap: 1vw; 
}

.contain1, .contain2 {
  display: flex;
  align-items: center;      
  gap: 1vw;  
  white-space: nowrap;     
}
.tag-cla{
  display: inline-block;
  padding: 8px 15px;
  line-height: 1;
  background-color: #fff;
  border: 1px solid #ccc;
  border-radius: 16px;
  font-size: 14px;
  color: #333;
  user-select: none; /* 禁止文本被选中 */
  cursor: default; 
}
.introduction {
    width: 900px;
    padding: 10px 60px;
    background: #fdfcf6;
    margin: 0px auto;
  }

.content1 {
  flex: 1; 
  color: #000;
  font-family: Microsoft YaHei;
  font-size: 16px;
}
@media (max-width:768px){
  .nav2 {
    gap: 2%; 
  }
  .title1{
      font-size: 1.5rem;
  }
  .introduction{
      width: auto;
      padding: 1rem;
  }
}
</style>

<template>
  <div class="all">
    <PersonNav></PersonNav>
    <ArticleContent></ArticleContent>
    <AttachmentContent></AttachmentContent>
    <MainPage></MainPage>
    <UserComment></UserComment>
  </div>
</template>

<script setup>
import { ref,onMounted} from 'vue';
import { useRoute  } from 'vue-router'
import axios from '../../utils/request';
import PersonNav from './components/PersonNav.vue';
import ArticleContent from './components/ArticleContent.vue';
import AttachmentContent from './components/AttachmentContent.vue';
import MainPage from './components/MainPage.vue';
import UserComment from './components/UserComment.vue';
import { ElMessage } from 'element-plus';
import { PageTitle } from '@/utils/fileService.js'

const setPageTitle = PageTitle('正在加载...');
const route = useRoute ();
const articleId = parseInt(route.params.id,10);//路径中的文章ID
const title = ref();

//阅读文章接口
async function deterArticleRead() {
  try {
    await axios.post(`/article/read/${articleId}`);
  } catch (error) {
    console.error('阅读文章接口失败', error.message);
  }
}

//获取文章内容
async function fetchArticleContent() {
  try {
    const response = await axios.get(`/article/${articleId}`);
    if (response.data.code === 1) {
      title.value = response.data.data.title;
      setPageTitle(`${title.value} - 云联知渔`);
    } else if(response.data.code === 0 && response.data.msg){
        ElMessage.error(response.data.msg.toString());
    }else {
      console.error('获取文章数据失败', response.data.msg || 'Unknown error');
    }
  } catch (error) {
    console.error('网络错误:', error.message);
  }
}

onMounted(() => {
  fetchArticleContent();
  deterArticleRead();
});


</script>

<style scoped>
.partial-content {
  max-height: 30vh;
  overflow: hidden;
}
.expand-icon {
  cursor: pointer;
  text-align: center; 
}
.centered-content {
  display: flex;
  flex-direction: column; 
  align-items: center; 
}
.flex-container {
  display: flex;
  align-items: center;
  justify-content: center; 
  gap: 5px;      
  margin-bottom: 40px;    
}
.attachment-money{
  font-weight: 700;
  font-size: 20px;
}
.button-container {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 30px;
  position: absolute;
  right: 10px;
  bottom: 10px;
}
.custom-button,
.custom-button2 {
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
</style>
  
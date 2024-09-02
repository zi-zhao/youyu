<template>
  <TheHeader></TheHeader>
  <div style="width: 100%;background: linear-gradient(179deg, #FDFBF6 6.66%, #FFF 99.45%);">
    <div class="main">
      <div class="tit">
        <div class="back" @click="goBackNewsCenter">
          <img src="@/assets/Back.svg" alt="" class="arrow" />
        </div>
        <span class="text">{{ newsData.title }}</span>
      </div>
      <div class="lab">
        <span class="text2">{{ newsData.createTime }}</span>
        <div style="display: flex;align-items:center ; gap: 3px;">
          <span class="text2">浏览量:</span>
          <span class="text2">{{ newsData.viewCount }}</span>
        </div>
      </div>
      <div class="line"></div>
      <div>
        <span>{{newsData.introduction}}</span>
      </div>
      <div class="content" v-html="newsData.content" style="line-height: 1.6;"></div>
          <div class="text_content">
      <div class="appendix">
        <div style="display: flex;align-items: center;gap: 5px;">
          <el-icon><Link /></el-icon>附件
        </div>
        <div style="margin-top: 5px;color: #3779c6;font-size: 14px;cursor: pointer;" >
          点此下载
        </div>
      </div>
    </div>
    </div>

    <div class="author">
      <span class="au">作者:{{newsData.releaseAdminId }}</span>
      <span class="au">审核员:{{ newsData.auditAdminId }}</span>
    </div>
  </div>
</template>

<script setup>
import TheHeader from '@/page/components/TheHeader.vue'
import axios from '@/utils/request';
import { ElMessage } from 'element-plus';
import { ref} from 'vue';
import { convertDateFormat } from '@/utils/timeFormat'; 
import { useRouter } from 'vue-router'
import { useRoute  } from 'vue-router'

const route = useRoute ();
const newId = parseInt(route.params.id,10);//路径中的文章ID
const newsData = ref('');
const router = useRouter()

const goBackNewsCenter = () =>{
  router.push('/NewsCenter')
} 

//获取新闻内容
async function fetchNewsContent() {
  try {
    // const response = await axios.get(`/news/${id}?apifoxApiId=100820783`);
    const response = await axios.get(`/news/${newId}`);
    if (response.data && response.data.code === 1) {
      newsData.value =  response.data.data;
      newsData.value.createTime = convertDateFormat(newsData.value.createTime);
    } else if(response.data.code === 0 && response.data.msg){
        ElMessage.error(response.data.msg.toString());
    }else {
      console.error('获取新闻数据失败', response.data.msg || 'Unknown error');
      ElMessage.error('获取新闻数据失败');
    }
  } catch (error) {
    console.error('网络错误:', error.message);
    ElMessage.error('获取新闻数据失败');
  }
}

fetchNewsContent(newId);

</script>


<style scoped>
.main {
  width: 1100px;
  margin: 40px auto 0 auto;
  box-shadow: 0px 4px 8px 0px rgba(0, 0, 0, 0.25);
  border: 1px solid #f0f0f0;
  background-color: #fefefe;
  display: flex; 
  flex-direction: column; 
  align-items: center;
  position: relative;
}
.tit {
  display: flex;
  width: 900px;
  justify-content: center;
  margin-top: 10px;
}
.back {
  position: absolute;
  top: 20px;
  left: 30px;
  width: 10px;
  height: 10px;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  padding: 10px;
  border-radius: 2px;
  border: 1px solid #E2E2E2;
  background: #FFF;
  cursor: pointer;
}

.text {
  position: relative;
  color: #000;
  font-family: Microsoft YaHei;
  font-size: 35px;
  font-style: normal;
  font-weight: 700;
  line-height: 1.6; 
}
.lab {
  margin: 20px auto 10px auto;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  gap: 80px;
}
.text2 {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 4px;
  color: #888;
  font-family: Microsoft YaHei;
  font-size: 13px;
  font-style: normal;
  font-weight: 400;
  line-height: 24px; 
}
.line{
  width: 90%;
  height: 1px;
  background: #e2e2e2;
}
.content {
  background-color: #fefefe;
  width: 900px;
  margin: 30px auto 36px auto;
  display: inline-flex;
  flex-direction: column;
  gap: 20px;
}
.author {
  width: 1070px;
  height: 80px;
  margin: 35px auto 0 auto;
  background-color: #fefefe;
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
  gap: 40px;
}
.au {
  color: #000;
  font-family: Inter;
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
  letter-spacing: 2px;
}
.appendix {
  width: 1100px;
  display: flex;
  flex-direction: column;
  padding-left: 50px;
  margin: 15px auto 20px;
}
.appendix span {
  color: #777;
  font-family: Microsoft YaHei;
  margin: 5px;
  font-size: 12px;
}
.appendix .el-icon{
  width: 20px;
  height: 20px;
}
.appendix .el-icon svg{
  width: 20px;
  height: 20px;
}
</style>

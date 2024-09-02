<template>
    <div class="container">
      <div v-for="(item,index) in newsData" :key="index" class="card-item" @click="goToNewsPage(item.id)">
        <h2>{{ item.title }}</h2>
        <div class="card-text">
          {{ item.introduction }}
        </div>
      </div>
      <div class="bottom">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :pager-count="pagerCount"
          :page-count="pageCount"
          @current-change="handleCurrentChange"
        />
      </div> 
    </div>
</template>

<script setup>
import { ref,onMounted } from 'vue';
import axios from '@/utils/request';
import { ElMessage,ElPagination } from 'element-plus';
import { useRouter } from 'vue-router';

const router = useRouter();
const newsData = ref();
const pageSize = ref(4);
const currentPage = ref(1);
const pagerCount = ref(5);
const pageCount =ref(0);



//处理分页的方法，当用户点击页数后请求对应的数据
const handleCurrentChange = (currentChange) => {
  currentPage.value = currentChange;
  fetchData(pageSize.value, currentPage.value);
}

//获取新闻分页数据
const fetchData = async (pageSize, page) => {
  try {
    const response = await axios.get('/news/page', {
      params: {
        pageSize: pageSize,
        page: page
      }
    });
    if(response.data.code === 1){
      pageCount.value = Math.ceil(response.data.data.total / pageSize);
      newsData.value = response.data.data.records;
    }else if(response.data.code === 0 && response.data.msg){
        ElMessage.error(response.data.msg.toString());
    }else{
      ElMessage.error('获取新闻通知失败');
    }
  } catch (error) {
    console.error(error);
    ElMessage.error('获取新闻通知失败');
  }
};

//点击获取跳转新闻详情
const goToNewsPage = (id) =>{
  router.push(`/NewsPage/${id}`)
}


onMounted(() => {
  fetchData(pageSize.value, currentPage.value);
});


</script>

<style scoped>
.container{
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.card-item{
  padding: 1rem 7rem;
  cursor: pointer;
}
.card-item:hover{
  background-color: #A6AFCE;
}
.bottom{
  margin-top: 10px;
}
</style>
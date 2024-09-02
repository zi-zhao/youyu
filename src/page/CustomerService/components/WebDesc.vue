<template>
  <TheHeader/>
  <div class="container">
    <div class="page">
      <div class="sidebar-pc">
        <el-aside width="200px">
          <div class="header">
            <img src="@/assets/CustomerServices/网站说明.svg">
            <div class="text">网站说明</div>
          </div>
          <el-menu>
            <el-menu-item 
              v-for=" item in menuItems" 
              :key=item.id  
              class="item" 
              :default-active="detailTitleId.value" 
              :class="{ 'active': detailTitleId === item.kindId }"   
              @click= handleItemClick(item.kindId,item.kindProblem)>
              {{ item.kindProblem }}
            </el-menu-item>
          </el-menu>
        </el-aside>
      </div>
      <div style="background-color:#fff;width: 72%;">
        <div class="main">
          <div class="summary">{{ detailTitle }}</div>
          <div class="content" v-for="(group, index) in detailItems" :key="group.id">
            <div style="display: flex;gap: 2rem">
              <span style="color: #606fa0;font-weight: 700;">Q{{ index + 1 }}</span>
              <div>
                <div>{{ group.problem }}</div>
                <br>
                <div>{{ group.answer }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import TheHeader from "@/page/components/TheHeader.vue";
import axios from '@/utils/request';
import {ref,onMounted} from 'vue';
import { ElMessage } from 'element-plus';

const detailTitle = ref('')//选中的问题类型名称
const detailTitleId = ref(null)//选中的问题类型ID
const menuItems = ref();//问题类型列表
const detailItems = ref();//某问题类型下对应的问题列表

const handleItemClick = (itemId,itemName) => {
  detailTitleId.value = itemId;
  detailTitle.value = itemName;
  getQuestions(detailTitleId.value);
}

//获取网站说明类型
async function getMenuItems(){
  try {
    const response = await axios.get('/explain/list');
    if(response.data.code === 1){
      menuItems.value = response.data.data;
      if (menuItems.value.length > 0) {
        detailTitleId.value = menuItems.value[0].kindId;//页面加载时获取第一类问题id
        detailTitle.value = menuItems.value[0].kindProblem;//页面加载时获取第一类问题的名称
      } 
      console.log(response.data);
    }else if(response.data.code === 0 && response.data.msg){
        ElMessage.error(response.data.msg.toString());
    }else{
        console.error("获取问题类型数据失败");
        ElMessage.error("获取问题类型数据失败");
    }
  } catch (error) {
    console.error("请求问题类型接口失败", error); 
    ElMessage.error("请求问题类型接口失败");
  }
}

//获取某一网站问题下的所有回答类型
async function getQuestions(id){
  try {
    const response = await axios.get('/explain/problem',{
      params: {
        kindId:id,
      }
    });
    if(response.data.code === 1){
      detailItems.value = response.data.data;
      console.log(response.data); 
    }else if(response.data.code === 0 && response.data.msg){
        ElMessage.error(response.data.msg.toString());
    }else{
        console.error("获取问题类型数据失败");
        ElMessage.error("获取问题类型数据失败");
    }
  } catch (error) {
    console.error("请求问题类型接口失败", error); 
    ElMessage.error("请求问题类型接口失败");
  }
}

onMounted(async () => {
  await getMenuItems();
  await getQuestions(detailTitleId.value);
})

</script>

<style lang="scss" scoped>
body{
  display: flex;
  justify-content: center;
}
.text {
  text-align: center;
  color: #000;
  font-weight: 700;
  font-size: 20px;
  line-height: 24px;
}

.container {
  display: flex;
  justify-content: center;
  padding-top: 3rem;
  width: 100%;
  height: calc(100vh - 3rem);
  background-color: #fafafa;
}

.sidebar-pc{
    background-color: #fff;
    padding: 2rem;
    height: calc(98% - 4rem);
    overflow-y: auto;
    overflow-x: hidden;
}
.page {
  display: flex;
  justify-content: space-around;
  width: 100%;
  background-color: #FAFAFA;
}

.header {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  padding: 1rem 0;
}

.item.active,
.item {
  border-radius: 10px;
  margin: 10px 0;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 16px;
}  
.item.active{
  border: 1px solid;
  color: #606fa0;
  font-weight: 700;
}
.main{
  width: 90%;
  padding-top: 1rem;
  height: calc(98% - 1rem);
  padding-right: 3rem;
  overflow-y: auto;
  margin: 0 auto;
}

.summary{
  display: flex;
  color: #606FA0;
  font-weight: 700;
  font-size: 20px;
  background: #FFF;
  padding: 16px 40px;
  margin-bottom: 1rem;
}

.content{
  background: #FFF;
  padding: 30px 40px;
  border-top: 1px solid #E3E3E3;
}

.item:hover {
  color: #606FA0;
}

/*去掉左侧菜单自带的右侧边框*/
::v-deep .el-menu {
  border: none !important;
}
/* 调整滚动条宽度和颜色 */
::-webkit-scrollbar {
    width: 6px; /* 增加纵向滚动条的宽度 */
    height: 3px; /* 增加横向滚动条的高度 */
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
@media (max-width: 768px) {
  .container{
      justify-content: flex-start;
      width: auto;
  }
  .page{
      width: auto;
  }
}
</style>

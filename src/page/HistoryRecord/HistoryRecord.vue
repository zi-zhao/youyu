<template>
  <TheHeader></TheHeader>
  <div class="top-box">
      <div class="top1">
          <div class="left">
              <img src="@/assets/HistoryRecord/RecordCircle.svg" alt="">
              <span>历史记录</span>
          </div>
          <div class="right">
              <!-- <el-input
                  v-model="input1"
                  class="w-50 m-2"
                  placeholder="输入关键词…"
                  :prefix-icon="Search"
                  style="width: 200px;"
              />
              <div style="display: flex;flex-wrap: wrap;">
                  <el-date-picker
                      v-model="value1"
                      type="date"
                      placeholder="选择您想查找的日期"
                      :size="size"
                      style="width: 200px;"
                  />
              </div> -->
              <div @click="deleteRecordAll" class="empty-btn"><span>清空历史记录</span></div>
          </div>
      </div>
  </div>
  <div class="content-box" v-infinite-scroll="load" infinite-scroll-distance="100" infinite-scroll-immediate="false">
      <el-timeline>
          <el-timeline-item v-for="(item , index) in viewhistoryData" :key="index" :timestamp="item.createTime" placement="top">
              <el-card  class="item-box" >
                  <div v-if="item.type === 0 " class="pic" @click="goToDetail(item)">
                      <img :src='item.newCoverPicture'  alt=" " >
                  </div>
                  <div  v-if="item.type === 1 " class="pic" @click="goToDetail(item)">
                      <img :src='image' v-for= "(image, imgIndex) in item.newCoverPicture.slice(0, 1)"  :key="imgIndex" alt="Share Image" >
                  </div>
                  <div class="right-content" @click="goToDetail(item)">
                      <div class="content-title">
                          <span style="font-size: 16px;font-weight: 700;">{{ item.title }}</span>
                          <div v-if="item.type === 0" class="tag tag1" >文章</div>
                          <div v-if="item.type === 1" class="tag tag2 ">分享</div>
                      </div>
                      <div style="height: 60px;">
                          <span v-if="item.type === 0">{{ item.summary }}</span>
                          <span v-if="item.type === 1">{{ item.content }}</span>
                      </div>
                      <div class="user-info">
                          <img :src="item.newAvater" alt="">
                          <span>{{ item.authorUsername }}</span>
                      </div>
                  </div>
                  <div @click="deleteRecord(item)" class="btn-delete">
                      <img src="@/assets/HistoryRecord/DeleteBtn.svg" alt="" style="width: 20px ; height: 20px;cursor: pointer;">
                  </div>
              </el-card>
          </el-timeline-item>
      </el-timeline>
      <el-empty 
        v-if="!viewhistoryData || viewhistoryData.length === 0" 
        description="您还没有历史记录呢，快去逛逛吧！" 
        :image-size="200" 
      />
      <div v-if="dialogShowVisible">
          <ShareDialog v-model="dialogShowVisible" :Id = id ></ShareDialog>
      </div>
  </div>
</template>
  
<script setup>
// import { Search } from '@element-plus/icons-vue'
import { ref,onMounted } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus';
import { convertDateFormat} from '@/utils/timeFormat'; 
import axios from '@/utils/request';
import { fetchShareCoverage} from '@/utils/fileService'; 
import TheHeader from '../components/TheHeader.vue';
import { useRouter } from 'vue-router';
import ShareDialog from '../ShareShow/components/ShareDialog.vue';
import { getUsersAvatarFromCOS,getArticleCoverageFromCOS } from '@/utils/cosService';
import { openUrl } from '@/utils/routeJudge'

const dialogShowVisible = ref(false);//控制分享展示弹框是否展示
const router = useRouter();
const currentPage = ref(1);
const viewhistoryData = ref([]);
const id = ref(null);

const deleteRecordAll = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要删除全部记录吗？',
      'Warning',
      {
        confirmButtonText: '确认删除',
        cancelButtonText: '取消',
        type: 'warning',
      }
    );
    deletedAllHistoryData();
  } catch {
    console.log('关闭弹框')
  }
}

const deleteRecord = async (item) => {
  try {
    await ElMessageBox.confirm(
      '确定要删除记录吗？',
      'Warning',
      {
        confirmButtonText: '确认删除',
        cancelButtonText: '取消',
        type: 'warning',
      }
    );
    if(item.type === 0){
        deletedHistoryData(item.id);
    }else if(item.type === 1){
        deletedHistoryData(item.id);
    }
  } catch {
    console.log('关闭弹框')
  }
}

async function deletedHistoryData(id){
    try {
        const response = await axios.delete(`/viewhistory/${id}`);
        if(response.data.code === 1){
            ElMessage.success('删除成功');
            viewhistoryData.value =[];
            currentPage.value = 1;
            getViewhistory(currentPage.value);
        }else if(response.data.code === 0 && response.data.msg){
            ElMessage.error(response.data.msg.toString());
        }else{
            console.error("删除该条历史记录失败");
            ElMessage.error('删除该条历史记录失败');
        }
    } catch (error) {
        console.error("删除该条历史记录失败", error); 
        ElMessage.error('删除该条历史记录失败');
    }
}


async function deletedAllHistoryData(){
    try {
        const response = await axios.delete('/viewhistory');
        if(response.data.code === 1){
            ElMessage.success('删除成功');
            viewhistoryData.value =[];
            currentPage.value = 1;
            getViewhistory(currentPage.value);
        }else if(response.data.code === 0 && response.data.msg){
            ElMessage.error(response.data.msg.toString());
        }else{
            console.error("删除历史记录失败");
            ElMessage.error('删除历史记录失败');
        }
    } catch (error) {
        console.error("删除历史记录失败", error); 
        ElMessage.error('删除历史记录失败');
    }
}

// 添加一个锁状态
let isLoading = false;
async function load() {
    if (isLoading) return; // 如果已经在加载中，则直接返回不执行新的加载
    isLoading = true; // 开始加载数据，设置锁状态为true
    try {
        if(currentPage.value === 1){
            currentPage.value++;
        }
        await getViewhistory(currentPage.value);
        currentPage.value++; // 只有在请求成功完成后才递增页码
    } catch (error) {
        console.error(error);
        ElMessage.error('滚动时的未知错误');
    } finally {
        isLoading = false; // 请求完成，无论成功或失败，都释放锁状态
    }
}

//获取用户的历史记录
async function getViewhistory(currentPage) {
  try {
    const response = await axios.get('/viewhistory', {
        params: {
            page:currentPage,
            pazeSize:10,
        }
    });
    if (response.data.code === 1 && response.data.data.records.length > 0) {
        const updates = response.data.data.records.map(async (record) => {
            let newCoverPicture;
            if (record.type === 0) {
                newCoverPicture = await getArticleCoverageFromCOS(record.articleId);
            } else if (record.type === 1) {
                newCoverPicture = await fetchShareCoverage(record.shareId);
            }
            const newAvater = await getUsersAvatarFromCOS(record.authorId);
            const createTime = convertDateFormat(record.createTime);
            return {
                ...record,
                newCoverPicture,
                newAvater,
                createTime
            };
        });
        const updatedRecords = await Promise.all(updates);
        viewhistoryData.value = [...viewhistoryData.value, ...updatedRecords];
    }else if (response.data.code === 1 && response.data.data.records.length === 0) {
        // ElMessage.info('已加载所有数据');
    }else if(response.data.code === 0 && response.data.msg){
        ElMessage.error(response.data.msg.toString());
    }else{
        console.error("获取用户的历史记录失败");
    }
  } catch (error) {
    console.error("请求用户的历史记录失败", error); 
  }
}

onMounted(() => {
    getViewhistory(currentPage.value);
})

const goToDetail = (item) =>{
  if(item.type === 0){
    //   const routeLocation = router.resolve({ path: `/TheArticle/${item.articleId}`});
    //   window.open(routeLocation.href, '_blank');
      openUrl(`/TheArticle/${item.articleId}`)
  }
  else if(item.type === 1){
      //点击打开分享展示弹框
      id.value = item.ShareId;
      dialogShowVisible.value = true
  }
}

</script>

<style scoped>
.top-box{
    width: 1100px;
    height: 85px;
    margin: 50px auto 0px;
    display: flex;
    flex-direction: column;
    gap: 15px;
}
.top1{
    width: 1100px;
    height: 35px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 400px;
}
.left{
    display: flex;
    align-items: center;
    gap: 12px;
}
.left img{
    width: 20px;
    height: 20px;
}
.left span{
    font-size: 20px;
    line-height: 1.6;
}
.right{
    display: flex;
    align-items: center;
    gap: 24px;
}
.empty-btn{
    width: 84px;
    height: 18px;
    color: #FFF;
    display: flex;
    align-items: center;
    font-size: 14px;
    padding: 4px 8px;
    border-radius: 4px;
    line-height: 1.6;
    background: #8290C0;
    cursor: pointer;
}
.content-box{
    width: 1040px;
    margin: 30px auto 0px;
}
.item-box{
    display: flex;
}
.right-content{
    display: flex;
    flex-direction: column;
    height: 130px;
    justify-content: space-between;
    width: 635px;
    cursor: pointer;
}
.content-title{
    display: flex;
    align-items: center;
    gap: 20px;
}
.tag{
    display: flex;
    padding: 2px 6px;
    justify-content: center;
    align-items: center;
    border-radius: 2px;
    height: 18px;
}
.tag1{  
    color: #6B738D;
    background: #E3E7FF;
}
.tag2{
    color: #EEF1FF;
    background: #9FA9CA;
}
.user-info{
    display: flex;
    align-items: center;
    gap: 10px;
}
.pic{
    min-width: 200px;
    min-height: 140px;
    cursor: pointer;
}
.pic img{
    width: 200px;
    height: 140px;
    border-radius: 8px;
}
.user-info img{
    width: 24px;
    height: 24px;
    border-radius: 50%;
}
.user-info span{
    color: #686868;
    font-size: 14px;
}
.btn-delete{
    position: absolute;
    right: 30px;
    top: 50%;
}
:deep .el-card__body{
    width: 100%;
    display: flex;
    gap: 30px;
    align-items: center;
    position: relative;
}
</style>
  
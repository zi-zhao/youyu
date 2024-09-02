<template>
  <div class="main_3">
    <div class="pageshow"  v-infinite-scroll="load" infinite-scroll-distance="100" infinite-scroll-immediate="false">
      <el-timeline>
        <el-timeline-item
          v-for="item in shareData"
          :key="item.id"
          :timestamp="item.createTime"
          placement="top"
          @click="goToDetail(item)"
        >
          <el-card>
            <div class="card">
              <h1 class="phtitle">{{ item.title }}</h1>
              <p class="chtitle2 multi-line-ellipsis-4">{{ item.content }}</p>
              <div >
                <img 
                  :src='image' 
                  v-for= "(image, imgIndex) in item.newCoverPicture.slice(0, 1)"  
                  :key="imgIndex" 
                  alt="Share Image"
                  class="pic2"
                /> 
              </div>  
              <div class="icon_container">
                <div class="cri">
                  <img class="like-pic" src="@/assets/LikeBefore.svg" />
                  <span class="cname">{{ item.likeCount }}</span>
                </div>
                <div class="cri">
                  <img class="like-pic" src="@/assets/Comment.svg" />
                  <span class="cname">{{ item.commentCount }}</span>
                </div>
                <div class="cri">
                  <img class="like-pic" src="@/assets/Transpond.svg" />
                  <span class="cname">{{ item.transmitCount }}</span>
                </div>
                <div class="cri">
                  <img class="like-pic" src="@/assets/FavoriteBefore.svg" />
                  <span class="cname">{{ item.favoriteCount }}</span>
                </div>
              </div>
            </div>
          </el-card>
        </el-timeline-item>
      </el-timeline>
      <el-empty 
          v-if="shareData.length === 0 || !shareData" 
          :image-size="200" 
          description="您还没有分享呢，快去创作吧！"
      />
    </div>
  </div>
  <div v-if="dialogShowVisible">
      <ShareDialog v-model="dialogShowVisible" :Id = shareId ></ShareDialog>
  </div>
</template>


<script setup>
import { ref,onMounted} from 'vue';
import axios from '@/utils/request';
import { fetchShareCoverage } from '@/utils/fileService'; 
import { ElMessage } from 'element-plus';
import { convertDateFormat } from '@/utils/timeFormat'; 
import ShareDialog from '../../ShareShow/components/ShareDialog.vue';
import { getUsersAvatarFromCOS } from '@/utils/cosService';

const currentPage = ref(1);
const shareData = ref([]);
const userId = parseInt(localStorage.getItem("userId")); // 获取用户ID
const shareId = ref();
const dialogShowVisible = ref(false);//控制分享展示弹框是否展示

// 添加一个锁状态
let isLoading = false;
async function load() {
    if (isLoading) return; // 如果已经在加载中，则直接返回不执行新的加载
    isLoading = true; // 开始加载数据，设置锁状态为true
    try {
      if(currentPage.value === 1){
          currentPage.value++;
      }
      await getDynamicData(currentPage.value);
      currentPage.value++; // 只有在请求成功完成后才递增页码
    } catch (error) {
        console.error(error);
        ElMessage.error('滚动时的未知错误');
    } finally {
        isLoading = false; // 请求完成，无论成功或失败，都释放锁状态
    }
}

  // 获取分享和文章数据
  async function getDynamicData(currentPage) {
    try{
      const response = await axios.get(`/users/works`,{
          params: {
              userId:userId,
              page:currentPage,
              pageSize:10,
              type:1,
          }
      });
      if (response.data.code === 1 && response.data.data.records.length > 0) {
        const updates = response.data.data.records.map(async (record) => {
          const avatarPromise = getUsersAvatarFromCOS(record.userId);
          const coverPicturePromise = fetchShareCoverage(record.id);
          const [avatar, newCoverPicture] = await Promise.all([avatarPromise, coverPicturePromise]);
          const createTime = convertDateFormat(record.createTime);
          return {
            ...record,
            avatar,
            newCoverPicture,
            createTime
          };
        });
        const updatedRecords = await Promise.all(updates);
        shareData.value = [...shareData.value, ...updatedRecords];
        ElMessage.success('获取用户动态成功');
      }else if (response.data.code === 1 && response.data.data.records.length === 0) {
          // ElMessage.info('已加载所有数据');
      }else if(response.data.code === 0 && response.data.msg){
          ElMessage.error(response.data.msg.toString());
      }else{
          console.error("获取用户动态失败");
          ElMessage.error('获取用户动态失败');
      }
    } catch (error) {
      console.error("获取用户动态失败", error); 
      ElMessage.error('获取用户动态失败');
    }
  }

  const goToDetail = (item) =>{
    shareId.value = item.id;
    dialogShowVisible.value = true
  }

  onMounted(() => {
    getDynamicData(currentPage.value);
  })

</script>

<style scoped>
.main_3 {
  display: flex;
  padding-left: 0px;
  flex-direction: column;
  align-items: flex-start;
  flex-shrink: 0;
  min-height: 225px;
}
.pageshow {
  width: 90%;
  gap: 12px;
  margin: 30px auto 0px;
  min-height: 100px;
}
.card{
  display: flex;
  flex-direction: column;
  gap: 10px;

}
.phtitle {
  color: #000;
  font-family: Microsoft YaHei;
  font-size: 16px;
  font-style: normal;
  font-weight: 700;
  line-height: 120%; 
}
.chtitle2 {
  width: 800px;
  min-height: 25px;
  line-height: 1.6;
  font-size: 14px;
}
.pic2 {
    width: 182px;
    height: 160px;
    border-radius: 8px;
    border: 1px solid #ebebeb;
}
.icon_container {
  display: flex;
  gap: 20px;
  width: 500px;
  margin-top: 20px;
}
.cri {
  display: flex;
  gap: 4px;
}

.like-pic {
  display: block;
  margin: auto;
  height: 16px;
  width: 16px;
  margin-right: 2px;
  cursor: pointer;
}

.cname {
  color: #2d2d2d;
  font-size: 13px;
  line-height: 120%;
}
</style>

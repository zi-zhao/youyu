<template>
  <div class="main_2">
    <div class="pageshow"  v-infinite-scroll="load" infinite-scroll-distance="100" infinite-scroll-immediate="false">
      <el-timeline>
        <el-timeline-item v-for="item in articleData" :key="item.id" :timestamp="item.createTime" placement="top" @click="goToDetail(item)">          
          <el-card>
            <div class="card">
              <!-- 左侧标题，简介，点赞等图标 -->
              <div style="display: flex;flex-direction: column;">
                <h1 class="phtitle">{{ item.title }}</h1>
                <p class="chtitle multi-line-ellipsis-4">{{ item.summary }}</p>
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
              <!-- 右侧封面图片 -->
              <div>
                <img 
                  :src='item.newCoverPicture'  
                  :key="imgIndex" 
                  alt="Share Image"
                  class="pic" 
                /> 
              </div>  
            </div>
          </el-card>
        </el-timeline-item>
      </el-timeline>
      <el-empty 
          v-if="articleData.length === 0 || !articleData" 
          :image-size="200" 
          description="他还没有文章呢，逛逛别的吧！"
      />
    </div>
  </div>
</template>

<script setup>
import { ref,onMounted } from 'vue';
import axios from '@/utils/request';
import { getArticleCoverageFromCOS } from '@/utils/cosService';
import { ElMessage } from 'element-plus';
import { convertDateFormat } from '@/utils/timeFormat'; 
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import { getUsersAvatarFromCOS } from '@/utils/cosService';
import { openUrl } from '@/utils/routeJudge'

const currentPage = ref(1);
const articleData = ref([]);
const store = useStore();
const userId = store.state.otherUserId;
const router = useRouter();

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
            type:0,
        }
    });
    if (response.data.code === 1 && response.data.data.records.length > 0) {
      const updatesAsync = response.data.data.records.map(async (record) => {
        const avatar = await getUsersAvatarFromCOS(record.userId);
        const newCoverPicture = await getArticleCoverageFromCOS(record.id);
        const createTime = convertDateFormat(record.createTime);
        return {
          ...record,
          avatar,
          newCoverPicture,
          createTime,
        };
      });
      const updatedRecords = await Promise.all(updatesAsync);
      articleData.value = [...articleData.value, ...updatedRecords];
      // ElMessage.success('获取用户动态成功');
      }else if (response.data.code === 1 && response.data.data.records.length === 0) {
          // ElMessage.info('已加载所有数据');
      }else if(response.data.code === 0 && response.data.msg){
          ElMessage.error(response.data.msg.toString());
      }else{
          console.error("获取用户动态失败");
          ElMessage.error("获取用户动态失败");
      }
  } catch (error) {
    console.error("获取用户动态失败", error); 
    ElMessage.error('获取用户动态失败');
  }
}

  const goToDetail = (item) =>{
    // const routeLocation = router.resolve({ path: `/TheArticle/${item.id}`});
    // window.open(routeLocation.href, '_blank');
    openUrl(`/TheArticle/${item.id}`)
  }

onMounted(() => {
  getDynamicData(currentPage.value);
});

</script>

<style scoped>
.main_2 {
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
  justify-content: space-between;
  align-items: center;
}
.phtitle {
  color: #000;
  font-family: Microsoft YaHei;
  font-size: 16px;
  font-style: normal;
  font-weight: 700;
  line-height: 120%; 
}
.chtitle {
  min-height: 58px;
  width: 500px;
  line-height: 1.6;
  font-size: 14px;
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
.cname{
  color: #2d2d2d;
  font-size: 13px;
  line-height: 120%;
}
.pic{
  width: 200px;
  height: 140px;
  flex-shrink: 0;
  border-radius: 8px;
}
</style>



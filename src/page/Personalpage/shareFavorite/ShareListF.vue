<template>
  <div class="cbutton">
    <span class="tatitle">我的分享</span>
  </div>
  <div class="sharepage1" v-infinite-scroll="load" infinite-scroll-distance="100" infinite-scroll-immediate="false">
    <div class="show" v-for="(data, index) in articles" :key="index" @click="goToDetail(data)">
      <span class="title">{{ data.title }}</span>
      <span class="content multi-line-ellipsis-4">{{ data.content }}</span>
      <div class="piccontainer" >
        <img class="pic" :src="image" v-for= "(image, imgIndex) in data.coverPicture.slice(0, 4)"  :key="imgIndex" alt="" />
      </div>
      <div class="lablecontainer">
        <span
          class="lable"
          v-for="(label, labelIndex) in data.label.split(' ')"
          :key="labelIndex"
          >{{ "#" + label }}</span
        >
      </div>
      <div class="icon_container">
        <div class="cri">
          <img class="like-pic" src="@/assets/LikeBefore.svg" />
          <span class="cname">{{ data.likeCount }}</span>
        </div>
        <div class="cri">
          <img class="like-pic" src="@/assets/Comment.svg" />
          <span class="cname">{{ data.commentCount }}</span>
        </div>
        <div>
          <span class="ltime">{{ data.createTime }} 发布了动态</span>
        </div>
      </div>
    </div>
    <el-empty 
        v-if="articles.length === 0 || !articles" 
        :image-size="200" 
        description="您还没有分享呢，快去创作吧！"
    />
  </div>
  <div v-if="dialogShowVisible">
      <ShareDialog v-model="dialogShowVisible" :Id = shareId ></ShareDialog>
  </div>
</template>
    
<script setup>
  import { ref, onMounted} from 'vue';
  import axios from '@/utils/request';
  import { fetchShareCoverage } from '@/utils/fileService'; 
  import { ElMessage } from 'element-plus';
  import { useStore } from 'vuex';
  import ShareDialog from '../../ShareShow/components/ShareDialog.vue';

  const currentPage = ref(1);
  const articles = ref([]);
  const store = useStore();
  const id = store.state.favoriteShareTest;
  const dialogShowVisible = ref(false);//控制分享展示弹框是否展示
  const shareId = ref(null);

  // 添加一个锁状态
  let isLoading = false;
  async function load() {
      if (isLoading) return; // 如果已经在加载中，则直接返回不执行新的加载
      isLoading = true; // 开始加载数据，设置锁状态为true
      try {
          if(currentPage.value === 1){
            currentPage.value++;
          }
          await getColumnShareList(currentPage.value);
          currentPage.value++; // 只有在请求成功完成后才递增页码
      } catch (error) {
          console.error(error);
          ElMessage.error('滚动时的未知错误');
      } finally {
          isLoading = false; // 请求完成，无论成功或失败，都释放锁状态
      }
  }

  async function getColumnShareList(currentPage) {
    try {
      const response = await axios.get('/favorite/share', {
        params: {
          id: id,
          page: currentPage,
          pageSize: 10, 
        }
      });
      if (response.data.code === 1) {
        const updates = response.data.data.records.map(async (share) => {
          const coverPicture = await fetchShareCoverage(share.id);
          return {
            ...share,
            coverPicture
          };
        });
        const updatedShares = await Promise.all(updates);
        articles.value = [...articles.value, ...updatedShares];
      } else if (response.data.code === 0 && response.data.msg) {
        ElMessage.error(response.data.msg.toString());
      } else {
        console.error("获取收藏的分享列表失败");
        ElMessage.error('获取收藏的分享列表失败');
      }
    } catch (error) {
      console.error("获取收藏的分享列表失败", error);
      ElMessage.error('获取收藏的分享列表失败');
    }
  }

  const goToDetail = (item) =>{
    shareId.value = item.id;
    dialogShowVisible.value = true
  }

  // 生命周期钩子
  onMounted(() => {
    getColumnShareList(currentPage.value);
  });

</script>
  
<style scoped>
.sharepage1 {
  height: 81vh;
  width: 100%;
  overflow-y: auto; 
  overflow-x: hidden; 
}
.cbutton{
  border-bottom: 1px solid rgb(212, 212, 212);;
  padding: 9px 1%;
  width: 98%;
}
.tatitle{
  color: #000; 
  text-align: center;
  font-family: Microsoft YaHei;
  font-size: 23px;
  line-height: 1.6; 
}
.show {
  width: 85%;
  display: flex;
  padding: 16px 5%;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  gap: 10px;
  border-radius: 16px;
  border: 1px solid #e7e7e7;
  background: #fffffc;
  margin: 20px auto 40px;
  box-shadow: 1px 1px 7px 0px rgb(112 112 112 / 16%);
}
.title {
  color: #000;
  font-family: Microsoft YaHei;
  font-size: 16px;
  font-style: normal;
  font-weight: 700;
  line-height: 120%; /* 19.2px */
}
.content {
  color: #000;
  font-size: 14px;
  min-height: 40px;
  line-height: 1.6; 
  width: 100%;
  flex-shrink: 0;
}
.lablecontainer {
  width: 690px;
  position: relative;
  display: flex; 
  flex-direction: row; 
  gap: 10px; 
}
.lable {
  display: flex;
  padding: 3px 8px;
  justify-content: center;
  align-items: center;
  gap: 10px;
  border-radius: 16px;
  border: 1px solid #a6a6a6;
  backdrop-filter: blur(10px);
  color: #7d88af;
  font-size: 12px;
}
.ltime {
  position: absolute;
  right: 0px;
  transform: translateY(-50%);
  color: #666666;
  text-align: center;
  font-size: 12px;
  line-height: 1.6;
}
.pic {
  width: 190px;
  height: 160px;
}
.piccontainer{
  display: flex;
  width: 100%;
  flex-wrap: wrap;
  gap: 1rem calc((100% - 760px)/3);
}
.icon_container {
  display: flex;
  gap: 20px;
  width: 100%;
  position: relative;
  height: 16px;
  align-items: center;
  margin-top: 5px;
}
.cri {
  display: flex;
  gap: 5px;
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
  display: inline-block;
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

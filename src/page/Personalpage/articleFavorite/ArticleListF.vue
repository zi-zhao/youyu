<template>
  <div class="cbutton">
    <span class="tatitle">我的文章</span>
  </div>
  <div style="width: 100%;">
    <div v-if="articles || articles.length !== 0" class="hh1" v-infinite-scroll="load" infinite-scroll-distance="100" infinite-scroll-immediate="false">
      <div class="small" v-for="(item, index) in articles" :key="index" @click="goToDetail(item)">
        <div class="container">
          <div class="one">
            <img class="largePicture" :src="item.coverPicture" alt="">
          </div>
          <div class="two">
            <h3 >{{ item.title }}</h3>
            <p class="multi-line-ellipsis-4">{{ item.summary }}</p>
          </div>
        </div>
        <div class="lall">
          <!-- 标签 -->
          <div>
            <div class="classify">
              <span class="cptext">分类</span>
              <span class="clab">{{ item.subBoardName }}</span>
            </div>
            <div class="classify">
              <span class="cptext">标签</span>
              <span class="clab" v-for="label in item.labels" :key="label" round>#{{ label }}</span>
            </div>
          </div>
          <!-- 点赞图标+时间 -->
          <div>
            <!-- 点赞图标 -->
            <div class="attached">
              <div class="cri">
                  <img class="like-pic" src="@/assets/LikeBefore.svg">
                  <span class="cname">{{ item.likeCount }}</span>
              </div>
              <div class="cri">
                  <img class="like-pic" src="@/assets/Comment.svg">
                  <span class="cname">{{ item.commentCount }}</span>
              </div>
            </div>   
            <!-- 时间  -->
            <span class="ptime">{{ item.postTime }}</span>
          </div>
        </div>
      </div>
    </div>
    <el-empty 
        v-else
        :image-size="200" 
        description="您还没有文章呢，快去创作吧！"
    />
  </div>
</template>

<script setup>
  import { ref, onMounted,computed} from 'vue';
  import axios from '@/utils/request';
  import { getArticleCoverageFromCOS } from '@/utils/cosService';
  import { ElMessage } from 'element-plus';
  import { useStore } from 'vuex';
  import { useRouter } from 'vue-router';
  import { openUrl } from '@/utils/routeJudge'

  const currentPage = ref(1);
  const articles = ref([]);
  const store = useStore();
  const id = store.state.favoriteArticleTest;
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
        await getArticleFavorite(currentPage.value);
        currentPage.value++; // 只有在请求成功完成后才递增页码
      } catch (error) {
          console.error(error);
          ElMessage.error('滚动时的未知错误');
      } finally {
          isLoading = false; // 请求完成，无论成功或失败，都释放锁状态
      }
  }

  async function getArticleFavorite(currentPage) {
  try {
    const response = await axios.get('favorite/article', {
      params: {
        id: id,
        page: currentPage,
        pageSize: 10, 
      }
    });
    if (response.data.code === 1 && response.data.data.records.length > 0) {
      const updates = response.data.data.records.map(async (article) => {
        const coverPicture = await getArticleCoverageFromCOS(article.id);
        return {
          ...article,
          labels: article.label ? article.label.split('，') : [], // 添加了检查以确保 article.label 不是 null 或 undefined
          coverPicture
        };
      });
      const updatedArticles = await Promise.all(updates);
      articles.value = [...articles.value, ...updatedArticles];
    } else if (response.data.code === 1 && response.data.data.records.length === 0) {
      // ElMessage.info('已加载所有数据');
    } else if (response.data.code === 0 && response.data.msg) {
      ElMessage.error(response.data.msg.toString());
    } else {
      console.error("获取文章收藏列表失败");
      ElMessage.error("获取文章收藏列表失败");
    }
  } catch (error) {
    console.error("获取文章收藏列表失败", error);
    ElMessage.error('获取文章收藏列表失败');
  }
}


  const goToDetail = (item) =>{
      // const routeLocation = router.resolve({ path: `/TheArticle/${item.id}`});
      // window.open(routeLocation.href, '_blank');
      openUrl(`/TheArticle/${item.id}`)
  }

  // 生命周期钩子
  onMounted(() => {
    getArticleFavorite(currentPage.value);
  });
</script>

    
<style scoped>
.hh1{
  height: 81vh;
  overflow-y: auto;
  margin: 0px;
  overflow-x: hidden;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
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
.small{
  position: relative;
  margin: 20px 25px 40px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding-bottom: 5px;
  width: 90%;
  height: 235px;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  background-color: #fffffc;
  box-shadow: 1px 1px 7px 0px rgb(112 112 112 / 16%);
  transition: transform 0.2s ease-out;
  cursor: pointer;
}
.small:hover {
  transform: translateY(-5px) translateX(5px);
}
.container {
  display: flex;
  justify-content: space-between;
}
.one{
  width: 170px;
  height: 140px;
}
.largePicture{
  width: 170px;
  height: 140px;
  border-radius: 8px;
  border: 1px solid #b4b4b4;
}
.two{
  padding: 0px 20px;
  width: 50%;
}
h3{
  color: #000;
  text-align: center;
  font-size: 16px;
  font-weight: 700;
  margin: 10px 0px 0px;
  line-height: 1.6;
}
p{
  width: 100%;
  height: 90px;
  margin: 10px 0px 10px;
  color: #000;
  font-size: 14px;
  line-height: 1.6;
}
.attached{
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 10px;
}
.ptime{
  color: #666666;
  font-size: 12px;
  line-height: 1.6;
}

.cri {
  display: flex; 
  align-items: center; 
}

.like-pic {
  width: 20px;
  height: 20px;
  display: inline-block;
}
.cname{
  color: #2d2d2d;;
  font-family: Microsoft YaHei;
  font-size: 13px;
  margin: auto 5px;
  display: inline-block;
}
.lall{
  display: flex;
  padding: 10px 10px;
  justify-content: space-between;
  align-items: flex-end;
  gap: 4px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.classify {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 10px;
}

.cptext {
  color: #000;
  font-family: Microsoft YaHei;
  font-size: 13px;
  line-height: 1.6;
}

.clab {
   padding: 2px 4px;
   border-radius: 10px;
   background: rgba(240, 240, 240, 0.63);
   backdrop-filter: blur(5px);
   color: #242424;
   font-size: 12px;
   line-height: 1.6; 
   cursor: pointer;
   user-select: none;
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
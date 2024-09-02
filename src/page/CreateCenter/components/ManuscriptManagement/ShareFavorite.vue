<template>
    <div class="middle">
        <el-tabs v-model="activeTab3">
            <el-tab-pane label="全部" name="all"></el-tab-pane>
            <el-tab-pane label="全部可见" name="allSee"></el-tab-pane>
            <el-tab-pane label="仅我可见" name="MeSee"></el-tab-pane>
        </el-tabs>

        <!-- 搜索框样式 -->
        <div style="display: flex; align-items: center; width: 300px; height: 35px; border: 1px solid #ccc; border-radius: 4px;">
            <input type="text" style="flex: 1; padding: 6px 10px; border: none; outline: none; font-size: 14px;"
                placeholder="请输入关键字" v-model="keyword">
            <div style="padding: 0 10px;" class="search" @click="handleSearch">
                <el-icon>
                    <Search />
                </el-icon>
            </div>
        </div>
    </div>

    <div class="footer" style="display: flex; color: #606060; margin-top: 0.5rem;">
      <div style="flex:53%">排序</div>
      <div style="flex:25%; text-align: center;">操作</div>
      <div style="flex:18%; text-align: center;">是否展示</div>
      <div style="flex:7%; text-align: center;">文章数</div>
    </div>

  <div class="content-container" v-infinite-scroll="load" infinite-scroll-distance="100" infinite-scroll-immediate="false">
    <div class="content-box underline"  v-for="item in shareFavoriteGroups" :key="item.id" style="display: flex; flex-direction: row; gap: 1rem;">
      <img src="@/assets/CreateCenter/小点.svg" style="flex:5%; height: 20px; padding-right: 40px;">
      <div style="flex:20% ;">
        <img :src="item.coverPicture" style="width: 142px;height: 100px;border-radius: 8px; ">
      </div>
      <div style="flex: 25%;text-align: center;">{{ item.name }}</div>

      <div style="display: flex;justify-content: space-evenly; flex: 25%;">
          <el-link type="primary" @click="manage(item.id,item.name)">管理</el-link>
          <el-link type="primary" @click = "handleEdit(item.id)">编辑</el-link>
          <el-link type="danger"  @click="deleteFavoriteShare(item.id)" >删除</el-link>
      </div>

      <div style="flex: 18%;display: flex;justify-content: center;">
          <img src="@/assets/CreateCenter/ShowArticleShare.svg" alt="">
      </div>
      <div style="flex: 7%;text-align: center;">{{ item.number }}</div>
    </div>
    <!-- 当专栏为空时的显示信息 -->
    <el-empty 
      v-if="!shareFavoriteGroups || shareFavoriteGroups.length === 0" 
      :image-size="200" 
      description="您还没有文章专栏呢，快去创建吧！"
    />
  </div>


    <div v-if="dialogFormVisible5">
        <EditDialog v-model="dialogFormVisible5" ClassifyName = "分享收藏" :Id = Id> </EditDialog>
    </div>
</template>
<script setup>
import { ElMessage,ElMessageBox } from 'element-plus';
import { ref,onMounted,defineEmits } from 'vue'
import axios from '@/utils/request';
import { getFavoritePictureFromCOS } from '@/utils/cosService';
import EditDialog from '../../../components/EditDialog';

const userId = localStorage.getItem("userId"); // 获取用户ID
const currentPage = ref(1);
const activeTab3 = ref('all')
const keyword = ref('')
const shareFavoriteGroups = ref([])
const dialogFormVisible5 = ref(false);
const Id = ref();
const centerDialogVisible = ref(false);

const emits = defineEmits({
  manage: payload => {
    if (payload && typeof payload.title === 'string' && typeof payload.id === 'number' && typeof payload.name === 'string') {
      return true;
    }
    ElMessage.error('组件传值错误');
    console.error('组件传值错误');
    return false;
  }
});
const manage = (id,name) => {
  emits('manage',{ title: '分享收藏',id: id ,name:name});
};


const handleSearch = () => {
    // 处理搜索的逻辑
}

const handleEdit = (id) => {
  Id.value = id;
  dialogFormVisible5.value = true;
}
 
//点击删除的弹框
const deleteFavoriteShare= async (id) => {
  try {
    await ElMessageBox.confirm(
      '确定要删除该分享收藏吗？',
      'Warning',
      {
        confirmButtonText: '确认删除',
        cancelButtonText: '取消',
        type: 'warning',
      }
    );
    handleDelete(id);
    getFavoriteShareList();
  } catch {
    console.log('关闭弹框')
  }
}

//删除分享收藏
async function handleDelete(id) {
  centerDialogVisible.value= false;
  try {
    const response = await axios.delete(`/favorite/${id}`);
    if (response.data && response.data.code === 1) {
        ElMessage.success('删除收藏成功！');
    } else if(response.data.code === 0 && response.data.msg){
        ElMessage.error(response.data.msg.toString());
    }else {
        console.error('删除分享收藏失败', response.data.msg);
        ElMessage.error('删除分享收藏失败');
    }
  } catch (error) {
      console.error("删除分享收藏接口失败", error); 
      ElMessage.error('删除分享收藏接口失败');
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
      await getFavoriteShareList(currentPage.value);
      currentPage.value++; // 只有在请求成功完成后才递增页码
    } catch (error) {
        console.error(error);
        ElMessage.error('滚动时的未知错误');
    } finally {
        isLoading = false; // 请求完成，无论成功或失败，都释放锁状态
    }
}

//获取分享收藏列表
async function getFavoriteShareList(currentPage) {
  try {
    const response = await axios.get('/favorite',{ 
      params: { 
        type:1,
        page:currentPage,
        pageSize:10,
        userId:Number(userId),
      } 
    });
    if(response.data.data.records.length > 0 && response.data.code === 1){
      const updates = response.data.data.records.map(record => getFavoritePictureFromCOS(record.id).then(coverPicture => ({
        ...record,
        coverPicture
      })));
      const updatedArticles = await Promise.all(updates);
      shareFavoriteGroups.value = [...shareFavoriteGroups.value, ...updatedArticles];
      console.log(response.data); 
    }else if (response.data.code === 1 && response.data.data.records.length === 0) {
        // ElMessage.info('已加载所有数据');
    }else if(response.data.code === 0 && response.data.msg){
        ElMessage.error(response.data.msg.toString());
    }else{
        console.error("获取分享收藏数据失败");
        ElMessage.error('获取分享收藏数据失败');
    }
  } catch (error) {
    console.error("请求分享收藏接口失败", error); 
    ElMessage.error('获取分享收藏数据失败');
  }
}

onMounted(() => {
    getFavoriteShareList(currentPage.value);
})
 
</script>
 
<style scoped>
::v-deep .el-tabs__nav-wrap::after {
    height: 0px;
}

.content-box {
    display: flex;
    flex-direction: row;
    align-items: center;
    padding-bottom: 1rem;
    margin-top: 1rem;
}

.middle {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.search:hover {
    cursor: pointer;
}

.underline{
    border-bottom: 1px solid #ccc;

}
</style>
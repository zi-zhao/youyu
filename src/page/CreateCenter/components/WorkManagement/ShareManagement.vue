<template>
    <div>
        <div >
            <el-tabs v-model="filter" @tab-change="handleTapageClick">
                    <el-tab-pane label="全部" name="all"></el-tab-pane>
                    <el-tab-pane label="仅我可见" name="mesee"></el-tab-pane>
                    <!-- <el-tab-pane label="审核中"></el-tab-pane>
                    <el-tab-pane label="草稿箱"></el-tab-pane> -->
                    <el-tab-pane label="回收站" name="recycleBin"></el-tab-pane>
            </el-tabs>
            <div class="search">
                <!-- <el-select v-model="selectedColumnCategory" placeholder="专栏分类" @change="handleColumnCategoryChange">
                    <el-option-group>
                        <el-option :value="option.name" v-for="option in columnGroup" :key="option.id"></el-option>
                    </el-option-group>
                </el-select>  -->
                <div style="display: flex; align-items: center; width: 300px; height: 35px; border: 1px solid #ccc; border-radius: 4px;">
                    <input type="text" style="flex: 1; padding: 6px 10px; border: none; outline: none; font-size: 14px;"
                        placeholder="请输入关键字" v-model="keyword">
                    <div style="padding: 0 10px;" class="search-box" @click="handleSearch">
                        <el-icon>
                            <Search />
                        </el-icon>
                    </div>
                </div>
            </div>
        
            <div class="content-container" v-infinite-scroll="load" infinite-scroll-distance="100" infinite-scroll-immediate="false">
                <!-- 分享管理内容 -->
                <div class="content-box" v-for="shareItem in shareGroup" :key="shareItem.id">
                    <div  v-for= "(image, imgIndex) in shareItem.newCoverPicture.slice(0, 1)"  :key="imgIndex">
                        <img :src='image' alt="Share Image" class="image">
                    </div>
                    <div class="title">
                        <div class="head">{{ shareItem.title }}</div>
                        <div class="tags" style="display: flex; gap: 8px;">
                            <el-tag v-for="tag in shareItem.tags" :key="tag" size="mini">{{ tag }}</el-tag>
                        </div>
                        <div class="foot">
                            <div class="icon">
                                <div class="icon-box">
                                    <img src="@/assets/LikeBefore.svg" alt="">
                                    <span class="icon-text">{{ shareItem.likeCount }}</span>
                                </div>
                                <div class="icon-box">
                                    <img src="@/assets/Comment.svg" alt="">
                                    <span class="icon-text">{{ shareItem.commentCount }}</span>
                                </div>
                                <div class="icon-box">
                                    <img src="@/assets/FavoriteBefore.svg" alt="">
                                    <span class="icon-text">{{ shareItem.favoriteCount }}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="time">
                        <div class="detailed-time">{{ shareItem.time }}</div>
                        <div class="btn">
                            <!-- <el-button>
                                <el-icon><Tickets /></el-icon>数据
                            </el-button> -->
                            <el-button @click="openShareDialog(shareItem.id)">
                                查看
                            </el-button>
                            <el-button @click="shareItem.showDeletebtn=true">
                                <el-icon><MoreFilled /></el-icon>
                            </el-button>
                            <div v-show="shareItem.showDeletebtn" @click="deleteShare(shareItem)" @mouseleave="showDeletebtn=false" class="delete-btn">删除</div>
                        </div>
                    </div>
                </div>
                <el-empty 
                    v-if="shareGroup.length === 0 || !shareGroup" 
                    :image-size="200" 
                    description="您还没有分享呢，快去创作吧！"
                />
            </div>
        </div>
        <div v-if="dialogShowVisible">
            <ShareDialog v-model="dialogShowVisible" :Id = shareId></ShareDialog>
        </div>
    </div>
</template>

<script setup>
import { ref,onMounted,watch} from 'vue';
import { fetchShareCoverage } from '@/utils/fileService'; 
import axios from '@/utils/request';
import { convertDateFormat } from '@/utils/timeFormat'; 
import { ElMessageBox , ElMessage } from 'element-plus';
import ShareDialog from '../../../ShareShow/components/ShareDialog.vue'

const currentPageShare = ref(1);
const userId = localStorage.getItem("userId"); // 获取用户ID
const filter = ref('all');
const type = ref(0);
const selectedColumnCategory = ref();
const keyword = ref();
const columnGroup = ref([]);
const shareGroup = ref([]);//获取分享列表
const newColumnArray = ref([]);//存放用户的分享专栏数据
const dialogShowVisible = ref(false)//控制分享展示弹框是否展示
const shareId = ref(null); 

//点击打开分享展示弹框
const openShareDialog = (id) =>{
    shareId.value = id;
    dialogShowVisible.value = true
}

//点击删除的弹框
const deleteShare = async (shareItem) => {
  try {
    await ElMessageBox.confirm(
      '确定要删除该条分享吗？',
      {
        confirmButtonText: '确认删除',
        cancelButtonText: '取消',
        type: 'warning',
      }
    );
    handleDelete(shareItem);
  } catch {
    console.log('关闭弹框')
  }
}

//点击范围分类
function handleTapageClick(tabName){
    if(tabName === 'all' ){
        type.value = 0;
    }else if (tabName === 'mesee'){
        type.value = 1;
    }
    else if (tabName === 'recycleBin'){
        type.value = 4;
    }
    console.log(tabName);
}

// 使用watch来监听type的变化
watch(type, (newValue, oldValue) => {
    currentPageShare.value = 1;
    keyword.value ='';
    getShareList(keyword.value, currentPageShare.value,newValue);
});

// //点击专栏分类
// function handleColumnCategoryChange() {
//     selectedColumnCategory.value = getIdFromColumnName( selectedColumnCategory.value);
//     currentPageShare.value = 1;
//     keyword.value ='';
//     getShareList(selectedColumnCategory.value, keyword.value,currentPageShare.value,type.value);
// }

//点击搜索框
function handleSearch() {
    currentPageShare.value = 1;
    getShareList(keyword.value,currentPageShare.value,type.value);
}

// //根据专栏名获取专栏ID
// function getIdFromColumnName(columnName) {
//     const matchedItem = newColumnArray.value.find(item => item.name === columnName);
//     return matchedItem ? matchedItem.id : null;  
// }

// //根据专栏id获取专栏名
// function getNameFromColumnId(columnId) {
//     const matchedItem = newColumnArray.value.find(item => item.id === columnId);
//     return matchedItem ? matchedItem.name : null;  
// }

//根据分享分页数据判断分享状态
function juageShareStatus(status) {
    if(status === 0) return '草稿'
    if(status === 1) return '审核中'
    if(status === 2) return '已发表'
    if(status === -1) return '审核未通过'
}

//根据分享分页数据判断分享可见范围
function juageShareAccess(access) {
    if(access === 0) return '全部可见'
    if(access === 1) return '仅我可见'
}

//因为要获取多种分享数据列表，所以封装一下获取到分享分类数据后的处理函数
async function processShareGroup(records) {
    const updates = records.map(async (record) => {
        const showDeletebtn = false;
        const newCoverPicture = await fetchShareCoverage(record.id);
        const postTime = convertDateFormat(record.postTime);
        let tags = {}; 
        tags.articleStatus = juageShareStatus(record.status);
        // tags.column = getNameFromColumnId(record.columnId);
        tags.access = juageShareAccess(record.access);
        return {
            ...record, 
            showDeletebtn,
            newCoverPicture, 
            postTime, 
            tags
        };
    });
    // 等待所有的并行操作完成
    return Promise.all(updates);
}

// 添加一个锁状态
let isLoading = false;
async function load() {
    if (isLoading) return; // 如果已经在加载中，则直接返回不执行新的加载
    isLoading = true; // 开始加载数据，设置锁状态为true
    try {
        if(currentPageShare.value === 1){
            currentPageShare.value++;
        }
        await getShareList(keyword.value,currentPageShare.value,type.value);
        currentPageShare.value++; // 只有在请求成功完成后才递增页
    } catch (error) {
        console.error(error);
        ElMessage.error('滚动时的未知错误');
    } finally {
        isLoading = false; // 请求完成，无论成功或失败，都释放锁状态
    }
}

//删除分享接口
async function handleDelete(shareItem) {
    try {
        const response = await axios.delete(`/share/${shareItem.id}`);
        if (response.data.code === 1) {
            shareItem.showDeletebtn = false;
            ElMessage.success('删除分享成功！');
            currentPageShare.value = 1;
            getShareList(keyword.value,currentPageShare.value,type.value);
        } else if(response.data.code === 0 && response.data.msg){
            ElMessage.error(response.data.msg.toString());
        }else {
            console.error('删除分享失败', response.data.msg);
            ElMessage.error('删除分享失败');
        }
    } catch (error) {
        console.error("删除分享失败", error); 
        ElMessage.error('删除分享失败');
    }
}

//获取分享分页数据
async function getShareList(textValue,currentPage,type) {
  try {
    if(currentPage === 1){
        shareGroup.value =[];
    }
    let params = {
        currentPage:currentPage,
        type:type,
    };
    // if (selectedColumnId) params.columnId = selectedColumnId;
    if (textValue) params.title = textValue;
    const response = await axios.get('/users/share/list',{ params: params });
    if (response.data.code === 1 && response.data.data.records.length > 0) {
        const shareGroupNew = response.data.data.records;
        const processedArticleGroup = await processShareGroup(shareGroupNew);
        shareGroup.value = [...shareGroup.value, ...processedArticleGroup];
    }else if (response.data.code === 1 && response.data.data.records.length === 0) {
        // ElMessage.info('已加载所有数据');
    }else if(response.data.code === 0 && response.data.msg){
        ElMessage.error(response.data.msg.toString());
    }else{
        console.error("获取分享数据失败");
        ElMessage.error("获取分享数据失败");
    }
  } catch (error) {
    console.error("请求分享接口失败", error); 
    ElMessage.error("请求分享接口失败");
    
  }
}

// //获取分享专栏列表
// async function getColumnShareList() {
//   try {
//     const response = await axios.get('/column',{
//       params: {
//           type:1,
//           page:1,
//           pageSize:1000,
//           userId:userId,
//         }
//     });
//     if (response.data.code === 1 ) {
//         columnGroup.value = response.data.data.records;
//         console.log(response.data); 
//     }else if(response.data.code === 0 && response.data.msg){
//         ElMessage.error(response.data.msg.toString());
//     }else{
//         console.error("获取分享专栏数据失败");
//         ElMessage.error("获取分享专栏数据失败");
//     }
//   } catch (error) {
//     console.error("请求分享专栏接口失败", error); 
//     ElMessage.error("请求分享专栏接口失败");
//   }
// }

//一定要先等待获取专栏的接口完成，不然在获取分享分页数据时无法确定每篇分享的专栏名称
onMounted(async () => {
    // getColumnShareList();  
    getShareList( keyword.value,currentPageShare.value,type.value);
})
</script>

<style scoped>
.icon-text{
    color:#2d2d2d;
}
.search {
    display: flex;
    gap: 2rem;
}

.search-box {
    cursor: pointer;
}
.content-box {
    display: flex;
    width: 100%;
    border-radius: 4px;
    padding: 1rem 1rem;
    border-bottom: 1px solid #ccc;
}
.image {
    width: 142px;
    height: 100px;
    border-radius: 8px;
}
.title {
    padding-left: 1rem;
    flex: 50%;
    display: flex;
    flex-direction: column;
    gap: 1rem;
}
.icon {
    width: 35%;
    display: flex;
    flex-direction: row;
    justify-content: space-around;
    color: #888;
    gap: 8px;
}
.icon-box {
    display: flex;
    align-items: center;
    gap: 3px;
}
.icon-box span{
    font-size: 14px;
}
.detailed-time {
    font-size: 14px;
}
.time {
    flex: 10%;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    padding-right: 1rem;
    color: #888;
    gap: 1rem;
}
.btn {
    color: black;
    position: relative;
}
.delete-btn{
    position: absolute;
    top: 35px ;
    right: 0px;
    width: 50px;
    height: 26px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 5px; 
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    cursor: pointer;
    font-size: 14px;
    color: #5d5d5d;
}
.underline {
  border: none;
  border-top: 1px solid #ccc;
}

/* 去除el-tabs底部灰色横线 */
::v-deep .el-tabs__nav-wrap::after {
    height: 0px;
}
.el-select-dropdown{
    overflow-y: auto;
    height: 180px;
}
</style>

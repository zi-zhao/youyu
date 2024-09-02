<template>
    <div>
        <el-tabs v-model="filter"  @tab-change="handleTapageClick">
            <el-tab-pane label="全部" name="all"></el-tab-pane>
            <el-tab-pane label="仅我可见" name="mesee"></el-tab-pane>
            <el-tab-pane label="审核中" name="audit"></el-tab-pane>
            <el-tab-pane label="草稿箱" name="draft"></el-tab-pane>
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
            <!-- 文章管理内容 -->
            <div class="content-box" v-for="compositionOption in articleGroup" :key="compositionOption.id">
                <!-- 若封面图片为空，则设置为默认文章封面 -->
                <img :src="compositionOption.tags.articleStatus === '草稿' ? defaultCoverage : compositionOption.newCoverPicture" alt="Composition Image" class="image">
                <div class="title">
                    <div class="head">{{ compositionOption.title }}</div>
                    <div class="tags" style="display: flex; gap: 8px;">
                        <el-tag v-for="tag in compositionOption.tags" :key="tag" size="mini">{{ tag }}</el-tag>
                    </div>
                    <div class="foot">
                        <div class="icon">
                             <div class="icon-box">
                                <img src="@/assets/LikeBefore.svg" alt="">
                                <span class="icon-text">{{ compositionOption.likeCount }}</span>
                            </div>
                            <div class="icon-box">
                                <img src="@/assets/Comment.svg" alt="">
                                <span class="icon-text">{{ compositionOption.commentCount}}</span>
                            </div>
                            <div class="icon-box">
                                <img src="@/assets/InsertCoins.svg" alt="">
                                <span class="icon-text">{{ compositionOption.rewardCount}}</span>
                            </div>
                            <div class="icon-box">
                                <img src="@/assets/FavoriteBefore.svg" alt="">
                                <span class="icon-text">{{ compositionOption.favoriteCount }}</span>
                             </div>
                             <div class="icon-box">
                                <img src="@/assets/Transpond.svg" alt="">
                                <span class="icon-text">{{ compositionOption.transmitCount }}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="time">
                    <div class="detailed-time">{{ compositionOption.postTime }}</div>
                    <div class="btn">
                        <el-button v-if="compositionOption.tags.articleStatus == '已发表'" @click="goToTheArticle(compositionOption.id)">
                            <el-icon><Plus /></el-icon>查看
                        </el-button>
                        <el-button v-if="compositionOption.editorType === 0 && compositionOption.tags.articleStatus == '草稿'" @click="goToReWangEditorEditor(compositionOption.id)">
                            <el-icon><Plus /></el-icon>编辑
                        </el-button>
                        <el-button v-if="compositionOption.editorType === 1 && compositionOption.tags.articleStatus == '草稿'" @click="goToReMarkDownEditor(compositionOption.id)">
                            <el-icon><Plus /></el-icon>编辑
                        </el-button>
                        <!-- <el-button>
                            <el-icon><Tickets /></el-icon>数据
                        </el-button> -->
                        <el-button @click="compositionOption.showDeletebtn=true">
                            <el-icon><MoreFilled /></el-icon>
                        </el-button>
                        <div v-show="compositionOption.showDeletebtn" @click="deleteArticle(compositionOption)" @mouseleave="showDeletebtn=false" class="delete-btn">删除</div>
                    </div>
                </div>
            </div>
            <el-empty 
                v-if="articleGroup.length === 0 || !articleGroup" 
                :image-size="200" 
                description="您还没有文章呢，快去创作吧！"
            />
        </div>
    </div>
</template>

<script setup>
import { ElMessageBox , ElMessage } from 'element-plus';
import { ref,onMounted,watch} from 'vue';
import { getArticleCoverageFromCOS } from '@/utils/cosService';
import axios from '@/utils/request';
import { convertDateFormat } from '@/utils/timeFormat'; 
import { useRouter } from 'vue-router';
import defaultCoverage from '@/assets/CreateCenter/DraftCov.png'
import { openUrl } from '@/utils/routeJudge'

const router = useRouter()
const currentPageArticle = ref(1);
// const userId = localStorage.getItem("userId"); // 获取用户ID
const filter = ref('all');
const selectedColumnCategory = ref();
const keyword = ref();
// const columnGroup = ref([]);
const articleGroup = ref([]);
// const newColumnArray = ref([]);//存放用户的文章专栏数据
const type = ref(0);
const showDeletebtn = ref(false)//控制删除按钮是否显示

//点击编辑按钮，跳转至编辑器数据回显页面
const goToReWangEditorEditor = (articleId) =>{
    // const routeLocation = router.resolve({ path: `/WangEditor/${articleId}` });
    // window.open(routeLocation.href, '_blank');
    openUrl(`/WangEditor/${articleId}`)
    
}

//点击编辑按钮，跳转至编辑器数据回显页面
const goToReMarkDownEditor = (articleId) =>{
    // const routeLocation = router.resolve({ path: `/MarkDown/${articleId}` });
    // window.open(routeLocation.href, '_blank');
    openUrl(`/MarkDown/${articleId}`)
}


//点击查看进入文章展示页面
const goToTheArticle = (articleId) =>{
    // const routeLocation = router.resolve({ path: `/TheArticle/${articleId}`});
    // window.open(routeLocation.href, '_blank');
    openUrl(`/TheArticle/${articleId}`)
}

//点击删除的弹框
const deleteArticle = async (article) => {
  try {
    await ElMessageBox.confirm(
      '确定要删除该文章吗？',
      {
        confirmButtonText: '确认删除',
        cancelButtonText: '取消',
        type: 'warning',
      }
    );
    handleDelete(article);
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
    else if (tabName === 'audit'){
        type.value = 3;
    }
    else if (tabName === 'draft'){
        type.value = 2;
    }
    else if (tabName === 'recycleBin'){
        type.value = 4;
    }
    console.log(tabName);
}

// 使用watch来监听type的变化
watch(type, (newValue, oldValue) => {
    currentPageArticle.value = 1;
    keyword.value ='';
    getArticleList(keyword.value, currentPageArticle.value,newValue);
});


// // 点击专栏分类
// function handleColumnCategoryChange() {
//     selectedColumnCategory.value = getIdFromColumnName( selectedColumnCategory.value);
//     currentPageArticle.value = 1;
//     keyword.value ='';
//     getArticleList(selectedColumnCategory.value, keyword.value, currentPageArticle.value,type.value);
// }

//点击搜索框
function handleSearch() {
    currentPageArticle.value = 1;
    getArticleList(keyword.value, currentPageArticle.value,type.value);
}


// //根据专栏名获取专栏ID
// function getIdFromColumnName(columnName) {
//     const matchedItem = newColumnArray.value.find(item => item.name == columnName);
//     return matchedItem ? matchedItem.id : null;  
// }

// //根据专栏id获取专栏名
// function getNameFromColumnId(columnId) {
//     const matchedItem = newColumnArray.value.find(item => item.id == columnId);
//     return matchedItem ? matchedItem.name : null;  
// }

//根据文章分页数据判断文章类型
function juageArticleType(type) {
    if(type === 0) return '原创'
    if(type === 1) return '转载'
    if(type === 2) return '翻译'
}
//根据文章分页数据判断文章状态
function juageArticleStatus(status) {
    if(status === 0) return '草稿'
    if(status === 1) return '审核中'
    if(status === 2) return '已发表'
    if(status === 4) return '被举报'
    if(status === -1) return '审核未通过'
}
//根据文章分页数据判断文章付费类型
function juageArticlePayType(coin,point) {
    if(coin === 0 && point === 0 ) return '免费'
    else return '付费'
}


//根据文章分页数据判断文章可见范围
function juageArticleAccess(access) {
    if(access === 0) return '全部可见'
    if(access === 1) return '仅我可见'
}

// 添加一个锁状态
let isLoading = false;
async function load() {
    if (isLoading) return; // 如果已经在加载，则直接返回
    isLoading = true; // 设置加载状态为true
    try {
        if(currentPageArticle.value === 1){
            currentPageArticle.value++;
        }
        // 加载类型2的数据
        await getArticleList(keyword.value, currentPageArticle.value,type.value);
        currentPageArticle.value++;
    } catch (error) {
      console.error(error);
    } finally {
      isLoading = false; // 无论加载成功或失败，都重置加载状态
    }
}

//删除文章接口
async function handleDelete(article) {
    try {
        const response = await axios.delete(`/article/${article.id}`);
        if (response.data.code === 1) {
            article.showDeletebtn = false;
            ElMessage.success('删除文章成功！');
            getArticleList(keyword.value, currentPageArticle.value,type.value);
        } else if(response.data.code === 0 && response.data.msg){
            ElMessage.error(response.data.msg.toString());
        }else {
            console.error('删除文章失败', response.data.msg);
            ElMessage.error('删除文章失败');
        }
    } catch (error) {
        console.error("删除文章失败", error); 
        ElMessage.error('删除文章失败');
    }
}


//因为要获取多种文章数据列表，所以封装一下获取到文章分类数据后的处理函数
async function processArticleGroup(articleArray) {
    const updates = articleArray.map(async (record) => {
        const showDeletebtn = false;
        const newCoverPicture = await getArticleCoverageFromCOS(record.id);
        const postTime = convertDateFormat(record.postTime);
        let tags = {}; 
        tags.type = juageArticleType(record.type);
        tags.articleStatus = juageArticleStatus(record.status);
        // tags.column = getNameFromColumnId(record.columnId);
        tags.payType = juageArticlePayType(record.requiredCoin,record.requiredPoint);
        tags.access = juageArticleAccess(record.access);
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

//获取文章分页数据
async function getArticleList(textValue,currentPage,type) {
  try {
    if(currentPage === 1){
        articleGroup.value =[];
    }
    let params = {
        currentPage:currentPage,
        type:type,
    };
    // if (selectedColumnId) params.columnId = selectedColumnId;
    if (textValue) params.title = textValue;
    const response = await axios.get('/users/article/list',{ params: params });
    if (response.data.code === 1 && response.data.data.records.length > 0) {
        const articleGroupNew = response.data.data.records;
        const processedArticleGroup = await processArticleGroup(articleGroupNew);
        articleGroup.value = [...articleGroup.value, ...processedArticleGroup];
    }else if (response.data.code === 1 && response.data.data.records.length === 0) {
        // ElMessage.info('已加载所有数据');
    }else if(response.data.code === 0 && response.data.msg){
        ElMessage.error(response.data.msg.toString());
    }else{
        console.error("获取文章数据失败");
    }
  } catch (error) {
    console.error("请求文章接口失败", error); 
  }
}

// // 获取文章专栏列表
// async function getColumnArticleList() {
//   try {
//     const response = await axios.get('/column',{
//       params: {
//           type:0,
//           page:1,
//           pageSize:1000,
//           userId:userId,
//         }
//     });
//     if (response.data.code === 1 ){
//         columnGroup.value = response.data.data.records;
//         console.log(columnGroup.value);
//     }else if(response.data.code === 0 && response.data.msg){
//         ElMessage.error(response.data.msg.toString());
//     }else{
//         console.error("获取文章专栏数据失败");
//         ElMessage.error("获取文章专栏数据失败");
//     }
//   } catch (error) {
//     console.error("请求文章专栏接口失败", error); 
//     ElMessage.error("请求文章专栏接口失败");
//   }
// }

//一定要先等待获取专栏的接口完成，不然在获取文章分页数据时无法确定每篇文章的专栏名称
onMounted(async () => {
    // await getColumnArticleList();  
    await getArticleList(keyword.value, currentPageArticle.value,type.value);
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
    width: 50%;
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

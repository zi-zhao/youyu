<template>
    <div class="filter">
        <!-- 后端实现这个筛选稍有困难，故暂时删去这个分类 -->
        <!-- <el-select v-model="selectedCategory" placeholder="全部文章" @change="handleTextChange">
            <el-option-group>
                <el-option v-for="option in options" :key="option.value" :label="option.label"></el-option>
            </el-option-group>
        </el-select> -->

        <!-- <el-tabs v-model="activeTab" @tab-change="handleTapageClick">
            <el-tab-pane label="最近发布" name="near"></el-tab-pane>
            <el-tab-pane label="点赞最多" name ="like"></el-tab-pane>
            <el-tab-pane label="回复最多" name ="reply"></el-tab-pane>
        </el-tabs> -->
    </div>
    
    <el-checkbox @change="handleAllSelected" v-model="isChecked" label="全选" style="padding-right: 2rem;" />
    <el-button @click="deletedCommentFunction" type="danger" plain >删除</el-button>

    <div class="content-container" v-infinite-scroll="load" infinite-scroll-distance="100" infinite-scroll-immediate="false">
        <div class="content-box underline" v-for="item in postCommentGroups" :key="item.id">
            <div class="left-content">
                <el-checkbox v-model="item.isSelected"></el-checkbox>
                <div class="detail-content">
                    <div style="display: flex;align-items: center;">
                        <div style="display: flex;gap: 0.8rem;align-items: center;">
                            <img :src="newAvater" alt="" class="image">
                            <div style="display: flex;align-items: center;gap: 3px;">
                                <div>{{ username }}</div>
                                <img  v-if="item.verified1 === 1" src="@/assets/VerifiedUser.svg" style="width: 16px;height: 16px;" alt="">
                            </div>
                        </div>
                        <div v-if="item.flag === 2" style="display: flex;">
                            <div style="margin-left: 20px;">回复</div>
                            <div style="display: flex;align-items: center;gap: 10px;margin-left: 10px;">
                                <div style="color: black;">{{ item.replyUsername }}</div>
                                <img  v-if="item.verified2 === 1" src="@/assets/VerifiedUser.svg" style="width: 16px;height: 16px;margin-right: 10px;" alt="">
                                <div>的评论</div>
                            </div>
                        </div>
                    </div>
                    <div style="margin-left: calc(36px + 0.5rem);">{{ item.content }}</div>
                    <div style="margin-left: calc(36px + 0.5rem);">
                        <span style="font-size: 14px;">{{ item.createTime }}</span>
                        <div style="display: flex;align-items: center;gap: 3px;font-size: 14px;">
                            <img src="@/assets/LikeBefore.svg" alt="">
                            <span class="icon-text">{{ item.likeCount }}</span>
                        </div>
                        <div v-if="item.flag === 1" style="display: flex;align-items: center;gap: 3px;font-size: 14px;">
                            <img src="@/assets/Comment.svg" alt="">
                            <span class="icon-text">{{ item.replyCount }}</span>
                        </div>
                        <!-- <span style="font-size: 14px;">回复</span> -->
                    </div>
                </div>
            </div>
            <div class="right-content">"{{ item.worksTitle}}"</div>
        </div>
        <el-empty 
            v-if="!postCommentGroups || postCommentGroups.length === 0 " 
            :image-size="200" 
            description="您还没有发表过评论呢，快去互动呀！"
        />
    </div>
</template>

<script setup>
import { ref,onMounted } from 'vue'
import axios from '@/utils/request';
import { getUsersAvatarFromCOS } from '@/utils/cosService';
import { convertDateFormat } from '@/utils/timeFormat'; 
import { ElMessage,ElMessageBox} from 'element-plus';

const currentPage = ref(1);
// const activeTab = ref('near')
const isChecked = ref(false) //判断某条评论是否被选中
const type = ref(0)
const postCommentGroups = ref([])
const userId = localStorage.getItem("userId"); // 获取用户ID
const username = localStorage.getItem("userName"); // 获取用户ID
const newAvater = ref('');

// const tabValueMapping = {
//     'near': 0,
//     'like': 1,
//     'reply': 2
// };

//选择评论排序方式，在map中匹配对应的值
// const handleTapageClick = (tabName) => {
//     if (tabValueMapping[tabName] !== undefined) {
//         type.value = tabValueMapping[tabName];
//         getPostComment(type.value);
//     }
// };

//当全部选择时候，统一改变所有分享评论的选中状态（无视对某条评论的单选状态）
const handleAllSelected = () => {
    postCommentGroups.value.forEach(item => {
        item.isSelected = isChecked.value;
    });
};

//点击删除的弹框
const deletedCommentFunction = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要删除评论吗？',
      {
        confirmButtonText: '确认删除',
        cancelButtonText: '取消',
        type: 'warning',
      }
    );
    handleDelete();
  } catch {
    console.log('关闭弹框')
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
        await getPostComment( type.value,currentPage.value);
        currentPage.value++; // 只有在请求成功完成后才递增页码
    } catch (error) {
        console.error(error);
        ElMessage.error('滚动时的未知错误');
    } finally {
        isLoading = false; // 请求完成，无论成功或失败，都释放锁状态
    }
}

async function handleDelete(){
    const selectedComments = postCommentGroups.value.filter(item => item.isSelected === true);
    for( let record of selectedComments){
        if(record.flag === 1){
            deletedComment(record.id);
        }else if(record.flag ===2){
            deletedReplyComment(record.id,record.worksId,record.worksTitle);
        }
    }
}

async function deletedComment(commentId){
    try {
        const response = await axios.delete('/comment/delete',{  
            commentId: commentId
        });
        if(response.data.code === 1){
            ElMessage.success('删除成功');
            const index = postCommentGroups.value.findIndex(comment => comment.id === commentId);
            if (index !== -1) {
                postCommentGroups.value.splice(index, 1);
            }
        }else if(response.data.code === 0 && response.data.msg){
            ElMessage.error(response.data.msg.toString());
        }else{
            console.error("删除发表过的评论数据失败");
            ElMessage.error('删除发表过的评论数据失败');
        }
    } catch (error) {
        console.error("删除发表过的评论数据失败", error); 
        ElMessage.error('删除发表过的评论数据失败');
    }
}

async function deletedReplyComment(id,worksId,worksTitle){
    try {
        const response = await axios.delete('/comment/reply/delete',{
            id:id, 
            worksId:worksId, 
            worksTitle:worksTitle 
        });
        if(response.data.code === 1){
            ElMessage.success('删除成功');
            const index = postCommentGroups.value.findIndex(comment => comment.id === id);
            if (index !== -1) {
                postCommentGroups.value.splice(index, 1);
            }
        }else if(response.data.code === 0 && response.data.msg){
            ElMessage.error(response.data.msg.toString());
        }else{
            console.error("删除发表过的评论数据失败");
            ElMessage.error('删除发表过的评论数据失败');
        }
    } catch (error) {
        console.error("删除发表过的评论数据失败", error); 
        ElMessage.error('删除发表过的评论数据失败');
    }
}



//获取对自己发表的评论列表
async function getPostComment( type,currentPage ) {
  try {
    let params = {
        pageSize:10,
        currentPage:currentPage,
        type:type,
        category:1
    };
    const response = await axios.get('/manage/comment/list',{ params: params });
    if(response.data.data.records.length > 0 && response.data.code === 1){
        const updates = response.data.data.records.map(async (record) => {
            const verified1 = await fetchUserInformation(userId);
            const verified2 = record.flag === 2 ? await fetchUserInformation(record.replyUserId): null;
            const newReplyAvater = record.flag === 2 ? await getUsersAvatarFromCOS(record.replyUserId) : null;
            return {
                ...record,
                verified2:verified2,
                verified1:verified1,
                newReplyAvater: newReplyAvater,
                isSelected: isChecked.value,
                createTime: convertDateFormat(record.createTime)
            };
        });
        const updatedComments = await Promise.all(updates);
        postCommentGroups.value = [...postCommentGroups.value, ...updatedComments];
        newAvater.value = await getUsersAvatarFromCOS(userId);
    }else if (response.data.code === 1 && response.data.data.records.length === 0) {
        // ElMessage.info('已加载所有数据');
    }else if(response.data.code === 0 && response.data.msg){
        ElMessage.error(response.data.msg.toString());
    }else{
    console.error("获取发表过的评论数据失败");
    }
  } catch (error) {
    console.error("请求发表过的评论接口失败", error); 
  }
}

// 获取用户信息
const fetchUserInformation = async (userId) => {
    try {
        const response = await axios.get(`/users/${userId}`);
        if(response.data.code === 1){
            return (response.data.data.verified);
        }else if(response.data.code === 0 && response.data.msg){
            ElMessage.error(response.data.msg.toString());
        }else{
            ElMessage.error('获取用户信息失败');
        }
    } catch (error) {
        console.error("获取用户信息失败", error);
        ElMessage.error('获取用户信息失败');
    }
};


onMounted(() => {
    getPostComment( type.value,currentPage.value);
})



</script>

<style scoped>
.icon-text{
    color:#2d2d2d;
}
.filter {
    display: flex;
    justify-content: space-between;
    margin-top: 2rem;
}

.content-box {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 0;
}

.left-content {
    display: flex;
    align-items: center;
    gap: 1rem;
    min-height: 7rem;
}


.detail-content {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    gap: 1rem;
    margin: 0.8rem 1rem;
}

.detail-content div:first-child {
    color: #9B9B9B;
}

.detail-content div:nth-child(3) {
    display: flex;
    align-items: center;
    color: #9B9B9B;
    gap: 4rem;
}

.image {
    width: 36px;
    height: 36px;
    border-radius: 36px;
    margin-top: 0.6rem;
}

.underline {
  border-bottom: 1px solid #ccc;
}

::v-deep .el-tabs__nav-wrap::after {
    height: 0px;
}</style>
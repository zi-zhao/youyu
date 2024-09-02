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
    <!-- <el-checkbox @change="handleAllSelected" v-model="isChecked" label="全选" style="padding-right: 2rem;" /> -->
    <!-- <el-link type="danger"  @click="dialogVisible = true" >举报</el-link> -->

    <div class="content-container"  v-infinite-scroll="load" infinite-scroll-distance="100" infinite-scroll-immediate="false">
        <div class="content-box underline" v-for="item in shareCommentGroups" :key="item.id">
            <div class="left-content">
                <!-- <el-checkbox  v-model="item.isSelected"></el-checkbox> -->
                <div class="detail-content">
                    <div style="display: flex;gap: 0.8rem;align-items: center;">
                        <img :src="item.coverPicture" alt="" class="image">
                        <div style="display: flex;align-items: center;gap: 3px;">
                            <div>{{ item.username }}</div>
                            <img v-if="item.verified === 1" src="@/assets/VerifiedUser.svg" style="width: 16px;height: 16px;" alt="">
                        </div>
                    </div>
                    <div style="margin-left: calc(36px + 0.5rem);">{{ item.content }}</div>
                    <div style="margin-left: calc(36px + 0.5rem);">
                        <span style="font-size: 14px;">{{ item.createTime }}</span>
                        <div style="display: flex;align-items: center;gap: 3px;font-size: 14px;">
                            <img src="@/assets/LikeBefore.svg" alt="">
                            <span class="icon-text">{{ item.likeCount }}</span>
                        </div>
                        <div style="display: flex;align-items: center;gap: 3px;font-size: 14px;">
                            <img src="@/assets/Comment.svg" alt="">
                            <span class="icon-text">{{ item.replyCount }}</span>
                        </div>
                        <span style="font-size: 14px;">回复</span>
                        <el-link type="danger"  @click="commentReport(item.id,0)" >举报</el-link>
                    </div>
                </div>
            </div>
            <div class="right-content">{{ item.articleTitle }}</div>
        </div>
        <el-empty 
            v-if="!shareCommentGroups || shareCommentGroups.length === 0 " 
            :image-size="200" 
            description="您的分享还暂时没有评论呢，请耐心等待呀！"
        />
     </div>   
     <div v-if="dialogVisible">
        <CreportedDialog v-model="dialogVisible" :id="workId" :type="type" ></CreportedDialog>
    </div> 
</template>

<script setup>
import { ref,onMounted } from 'vue'
import axios from '../../../../utils/request';
import { getUsersAvatarFromCOS } from '@/utils/cosService';
import { convertDateFormat } from '../../../../utils/timeFormat'; 
import CreportedDialog from '@/page/components/CreportedDialog.vue';
import { ElMessage } from 'element-plus';

const currentPage = ref(1);
const activeTab = ref('near');
const isChecked = ref(false); //判断某条评论是否被选中
const flag = ref(0);
const workId = ref();
const type = ref(0);
const shareCommentGroups = ref([]);
const dialogVisible = ref(false);//控制评论举报弹框是否显示

const tabValueMapping = {
    'near': 0,
    'like': 1,
    'reply': 2
};
//选择评论排序方式，在map中匹配对应的值
const handleTapageClick = (tabName) => {
    if (tabValueMapping[tabName] !== undefined) {
        flag.value = tabValueMapping[tabName];
        getShareComment(flag.value);
    }
};

//当全部选择时候，统一改变所有分享评论的选中状态（无视对某条评论的单选状态）
const handleAllSelected = () => {
  shareCommentGroups.value.forEach(item => {
    item.isSelected = isChecked.value;
  });
};

//向举报弹窗赋值的函数
const commentReport = (id,typeNum) =>{
    workId.value = id;
    type.value = typeNum;
    dialogVisible.value = true;
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
        await getShareComment( flag.value,currentPage.value );
        currentPage.value++; // 只有在请求成功完成后才递增页码
    } catch (error) {
        console.error(error);
        ElMessage.error('滚动时的未知错误');
    } finally {
        isLoading = false; // 请求完成，无论成功或失败，都释放锁状态
    }
}

//获取对自己分享的评论列表
async function getShareComment( flag ,currentPage) {
    if(currentPage === 1){
        shareCommentGroups.value =[];
    }
    try {
        let params = {
            pageSize:10,
            currentPage:currentPage,
            flag:flag,
            type:1
        };
        const response = await axios.get('/comment/list/receive',{ params: params });
        if (response.data.code === 1 && response.data.data.records.length > 0) {
            const commentUpdates = response.data.data.records.map(async (record) => {
                const coverPicturePromise = getUsersAvatarFromCOS(record.userId);
                const formattedDate = convertDateFormat(record.createTime);
                const verified = await fetchUserInformation(record.userId);
                const coverPicture = await coverPicturePromise;
                return {
                    ...record,
                    verified:verified,
                    coverPicture: coverPicture,
                    createTime: formattedDate,
                    isSelected: isChecked.value  
                };
            });
            const updatedComments = await Promise.all(commentUpdates);
            shareCommentGroups.value = [...shareCommentGroups.value, ...updatedComments];
            console.log(response.data); 
            // ElMessage.success('获取分享评论成功');
        }else if (response.data.code === 1 && response.data.data.records.length === 0) {
        ElMessage.info('已加载所有数据');
        }else if(response.data.code === 0 && response.data.msg){
            ElMessage.error(response.data.msg.toString());
        }else {
            console.error("获取分享评论数据失败");
        }
    } catch (error) {
        console.error("请求分享评论接口失败", error);
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
    getShareComment( flag.value,currentPage.value );
})


</script>

<style scoped>
.filter {
    display: flex;
    justify-content: space-between;
    /* margin-top: 2rem; */
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
.icon-text{
    color:#2d2d2d;
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
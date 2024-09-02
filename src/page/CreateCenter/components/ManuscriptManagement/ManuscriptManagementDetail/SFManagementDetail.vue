<template>
    <div class="container1">
        <div class="page">
            <div class="hierarchy-title">
                <span>收藏管理</span>
                <span>></span>
                <span>{{ props.Name }}</span>
                <span>></span>
                <span>管理</span>
            </div>
            <button @click="back" class="back-btn"><el-icon><Back /></el-icon></button>
            <div class="footer" style="display: flex; color: #606060; margin-top: 0.5rem;">
                <div style="flex:56%">排序</div>
                <div style="flex:35%;text-align: center;">操作</div>
                <div style="flex:9%;text-align: center;">是否展示</div>
            </div>
            <div class="content-container" v-infinite-scroll="load"  infinite-scroll-distance="100" infinite-scroll-immediate="false">
                <div class="content-box underline"  v-for="item in shareFavoriteGroups" :key="item.id">
                    <img src="@/assets/CreateCenter/小点.svg" alt="" style="flex: 5%;height: 20px; padding-right: 40px;">
                     <div style="flex: 20%;" v-for= "(image, imgIndex) in item.newCoverPicture.slice(0, 1)"  :key="imgIndex">
                        <img :src='image' alt="" style="width: 142px;height: 100px;border-radius: 8px;">
                    </div>
                    <div style="flex: 30%;text-align: center;">{{ item.title }}</div>
                    <div style="display: flex; flex-direction: row;justify-content: center; flex: 35%;gap: 2rem;">
                        <el-link type="primary" @click="openShareDialog(item.id)">查看</el-link>
                        <!-- <el-link type="primary" @click = handleRemoveBefore(item.id)>移动</el-link>       -->
                    </div>
                    <div style="flex: 10%;display: flex;justify-content: center;">
                        <img v-if="showColumnArticle" src="@/assets/CreateCenter/ShowArticleShare.svg" alt="">
                    </div>
                    <div v-if="dialogFormVisible">
                        <CfDialog  v-model="dialogFormVisible" @updateValue="handleUpdateValue" ClassifyName="分享收藏"></CfDialog>
                    </div>
                </div>
                <el-empty 
                    v-if="!shareFavoriteGroups || shareFavoriteGroups.length === 0" 
                    :image-size="200" 
                    description="您的收藏夹里面还没有分享呢，快去寻找吧！"
                />
            </div>
        </div>
        <div v-if="dialogShowVisible">
            <ShareDialog v-model="dialogShowVisible" :Id = shareId></ShareDialog>
        </div>
    </div>
</template>

<script setup>
import { ref,onMounted,defineProps,defineEmits,watch } from 'vue'
import axios from '@/utils/request';
import { fetchShareCoverage } from '@/utils/fileService'; 
import { ElMessage } from 'element-plus';
import CfDialog from '../../../../components/CfDialog';
import ShareDialog from '../../../../ShareShow/components/ShareDialog.vue'

const currentPage = ref(1);
const showColumnArticle = ref(true)//收藏里的某一篇文章是否展示
const shareFavoriteGroups = ref([])
const dialogFormVisible = ref(false)//控制cfdialog弹窗（显示分享收藏列表）是否弹出
const favoriteId = ref();//用户选择的ID
const tempFavoriteId = ref()//存放用户临时选择的文章ID
const dialogShowVisible = ref(false)//控制分享展示弹框是否展示
const shareId = ref(null);

const props = defineProps({
    Name: String,
    Id:Number,
});

//点击打开分享展示弹框
const openShareDialog = (id) =>{
    shareId.value = id;
    dialogShowVisible.value = true;
}

//点击管理或返回切换组件的定义事件之一
const emits = defineEmits({
    switchToComponent: payload => {
        if (payload && typeof payload.title === 'string' ) {
        return true;
        }
        ElMessage.error('组件传值错误');
        console.error('组件传值错误');
        return false;
    }
});
const back = () => {
    emits("switchToComponent",{title:"分享收藏"});
};

const handleRemoveBefore = (ID) => {
    tempFavoriteId.value = ID;
    dialogFormVisible.value = true;
}

//接受cfdialog返回的数据，从而确定Id
const handleUpdateValue = (data) => {
    favoriteId.value = data[0];
}

// 使用 watch 来监听 favoriteId 的变化
watch(favoriteId, (newVal, oldVal) => {
    if (newVal !== 0 && newVal !== oldVal) {
        handleRemove();
    }
});

const handleRemove = async () => {
    await handleDelete();
    await handleInsert();
    await getShareList();
    favoriteId.value = 0;
}

//删除收藏中的分享
async function handleDelete() {
    try {
        const response = await axios.delete(`/favorite/share`,{favoriteId:props.Id, contentId:tempFavoriteId.value});
        if (response.data && response.data.code === 1) {
            console.success('删除收藏分享成功');
        } else if(response.data.code === 0 && response.data.msg){
            ElMessage.error(response.data.msg.toString());
        }else {
            console.error('删除收藏分享失败', response.data.msg);
            ElMessage.error('删除收藏分享失败');
        }
    } catch (error) {
        console.error("删除收藏分享失败", error); 
        ElMessage.error('删除收藏分享失败');
    }
}

//增添收藏中的分享
async function handleInsert() {
    try {
        const response = await axios.post(`/favorite/share`,{favoriteId:favoriteId.value, contentId:tempFavoriteId.value});
        if (response.data && response.data.code === 1) {
            ElMessage.success('移动分享成功');
        } else if(response.data.code === 0 && response.data.msg){
            ElMessage.error(response.data.msg.toString());
        }else {
            console.error('增添收藏分享失败', response.data.msg);
            ElMessage.error('增添收藏分享失败');
        }
    } catch (error) {
        console.error("增添收藏分享失败", error); 
        ElMessage.error('增添收藏分享失败');
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
        await  getShareList(currentPage.value);
        currentPage.value++; // 只有在请求成功完成后才递增页码
    } catch (error) {
        console.error(error);
        ElMessage.error('滚动时的未知错误');
    } finally {
        isLoading = false; // 请求完成，无论成功或失败，都释放锁状态
    }
}

//获取收藏分享列表
async function getShareList(currentPage) {
    try {
    const response = await axios.get('/favorite/share',{
        params: {
            id:props.Id,
            page:currentPage,
            pageSize:100
        }
    });
    if (response.data.code === 1 && response.data.data.records.length > 0) {
      const updates = response.data.data.records.map(async (record) => {
        const newCoverPicture = await fetchShareCoverage(record.id);
        return { ...record, newCoverPicture };
      });
      const updatedRecords = await Promise.all(updates);
      shareFavoriteGroups.value = [...shareFavoriteGroups.value, ...updatedRecords];
      console.log(response.data);
    }else if (response.data.code === 1 && response.data.data.records.length === 0) {
        ElMessage.info('已加载所有数据');
    }else if(response.data.code === 0 && response.data.msg){
        ElMessage.error(response.data.msg.toString());
    }else{
        console.error("获取分享收藏数据失败");
        ElMessage.error("获取分享收藏数据失败");
    }
    } catch (error) {
    console.error("获取分享收藏数据失败", error); 
    ElMessage.error("获取分享收藏数据失败");
    }
}

onMounted(() => {
    getShareList(currentPage.value);
})

</script>

<style scoped>
.container1 {
    background-color: #F5F5F5;
    display: flex;
    justify-content: center;
}
.page {
    background-color: #fff;
    width: 100%;
    position: relative;
}
.back-btn{
    position: absolute;
    display: flex;
    width: 23px;
    height: 18px;
    align-items: center;
    justify-content: center;
    top: 12px;
    left: -35px;
    cursor: pointer;
}
.hierarchy-title {
    display: flex;
    align-items: center;
    gap: 5px;
    margin: 10px 0px 60px;
    color: #9B9B9B;
}
::v-deep .el-tabs__nav-wrap::after {
    height: 0px;
}

.content-box {
    display: flex;
    flex-direction: row;
    align-items: center;
    padding-bottom: 1rem;
    margin-top: 1rem;
    gap: 1rem;
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
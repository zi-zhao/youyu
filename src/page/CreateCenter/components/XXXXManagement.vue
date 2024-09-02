<template>
    <div >
        <!-- <div class="page-box"> -->
            <el-tabs v-model="activeTab1" @tab-change="handleTapageClick1">
                 <!-- 专栏管理内容 -->
                <el-tab-pane label="专栏管理" name="column"></el-tab-pane>
                <!-- 收藏管理内容 -->
                <el-tab-pane label="收藏管理" name="favorite"></el-tab-pane>
            </el-tabs>
            <hr>
            <div class="header">
                <el-tabs v-model="activeTab2" @tab-change= "handleTapageClick2">
                    <el-tab-pane label="文章" name="article" ></el-tab-pane>
                    <el-tab-pane label="分享" name="share" ></el-tab-pane>
                </el-tabs>

                <el-button type="info" style="width: 70px;
                height: 30px;" @click="handleCreate">新建</el-button>
            </div>
            <hr>
            <edit-dialog ClassifyName="专栏"></edit-dialog>
            <div>
                <component @manage="forwardManage" :is="selectedComponent"></component>
            </div>
        <!-- </div> -->
        
        <div v-if="dialogFormVisible">
              <CreateDialog v-model="dialogFormVisible" :ClassifyName=popboxInform></CreateDialog>
        </div>
    </div>
</template>

<script setup>
import { ref,defineEmits,watchEffect ,defineProps } from 'vue'
import { ElMessage } from 'element-plus';
import ArticleColumn from './ManuscriptManagement/ArticleColumn';
import ShareColumn from './ManuscriptManagement/ShareColumn';
import ArticleFavorite from './ManuscriptManagement/ArticleFavorite';
import ShareFavorite from './ManuscriptManagement/ShareFavorite';
import CreateDialog from '../../components/CreateDialog';

// 数据定义
const activeTab1 = ref('column')
const activeTab2 = ref('article')
const selectedComponent = ref(ArticleColumn)
const tab1 = ref('column') //保存用户对专栏/收藏的选择
const tab2 = ref('article')//保持用户对文章/分享的选择
const popboxInform = ref("")
const dialogFormVisible = ref(false);

const props = defineProps({
    ClassifyName: String,
});


watchEffect(() => {
    let newVal = props.ClassifyName;
    switch (newVal) {
        case '文章专栏':
            activeTab1.value = 'column';
            activeTab2.value = 'article';
            selectedComponent.value = ArticleColumn;
            break;
        case '文章收藏':
            activeTab1.value = 'favorite';
            activeTab2.value = 'article';
            selectedComponent.value = ArticleFavorite;
            break;
        case '分享专栏':
            activeTab1.value = 'column';
            activeTab2.value = 'share';
            selectedComponent.value = ShareColumn;
            break;
        case '分享收藏':
            activeTab1.value = 'favorite';
            activeTab2.value = 'share';
            selectedComponent.value = ShareFavorite;
            break;
    }
});

//点击管理或返回切换组件的定义事件之一
const emits = defineEmits({
    switchToAManagementDetail: payload => {
        if (payload && typeof payload.title === 'string' && typeof payload.id === 'number') {
        return true;
        }
        ElMessage.warn('组件传值错误');
        console.warn('组件传值错误');
        return false;
    }
});

//处理从子组件那到的数据
const forwardManage = (payload) => {
  console.log(payload); 
  emits("switchToAManagementDetail",payload);
};

const handleTapageClick1 = (tabName) => {
    if(tabName === 'column' && tab2.value === 'article'){
        tab1.value = 'column';
        selectedComponent.value = ArticleColumn;
    }else if (tabName === 'favorite' && tab2.value === 'article'){
        tab1.value = 'favorite';
        selectedComponent.value = ArticleFavorite;
    }else if (tabName === 'column' && tab2.value === 'share'){
        tab1.value = 'column';
        selectedComponent.value = ShareColumn;
    }else if (tabName === 'favorite' && tab2.value === 'share'){
        tab1.value = 'favorite';
        selectedComponent.value = ShareFavorite;
    }
}



const handleTapageClick2 = (tabName) => {
    if(tabName === 'article' && tab1.value === 'column'){
        tab2.value = 'article';
        selectedComponent.value = ArticleColumn;
    }else if (tabName === 'share' && tab1.value === 'column'){
        tab2.value = 'share';
        selectedComponent.value = ShareColumn;
    }else if (tabName === 'article' && tab1.value === 'favorite'){
        tab2.value = 'article';
        selectedComponent.value = ArticleFavorite;
    }else if (tabName === 'share' && tab1.value === 'favorite'){
        tab2.value = 'share';
        selectedComponent.value = ShareFavorite;
    }
};

const handleCreate = () => {
    if(activeTab1.value === 'column' && activeTab2.value === 'article'){
        popboxInform.value = "文章专栏";
    }else if (activeTab1.value === 'favorite' && activeTab2.value === 'article'){
        popboxInform.value = "文章收藏";
    }else if (activeTab1.value === 'column' && activeTab2.value === 'share'){
        popboxInform.value = "分享专栏";    
    }else if (activeTab1.value === 'favorite' && activeTab2.value === 'share'){
        popboxInform.value = "分享收藏";    
    }
    dialogFormVisible.value = true;
}

</script>

<style scoped>
.container-box {
    display: flex;
    flex-direction: column;
}

.page-box {
    background-color: #fff;
    width: 100%;
    padding: 2rem 3rem;
}

.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
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
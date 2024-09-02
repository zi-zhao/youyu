<template>
    <div class="container">
        <div class="page">
            <el-tabs v-model="activeTab" @tab-change="handleTapageClick">
                <el-tab-pane label="文章管理" name="article" ></el-tab-pane>
                <el-tab-pane label="分享管理" name="share" ></el-tab-pane>
            </el-tabs>
            <hr>
        
            <!-- <div class="search"> -->
                <!-- 文章的二级板块筛选按键，先删去 -->
                <!-- <el-select v-if="activeTab === 'article'" v-model="selectedTextCategory" placeholder="文章分类"
                    @change="handleTextCategoryChange">
                    <el-option-group v-for="group in categoryGroups" :key="group.label">
                        <el-option v-for="option in group.options" :key="option.value" :label="option.label"
                            :value="option.value"></el-option>
                    </el-option-group>
                </el-select>-->

                <!-- 原来的注释 -->
                <!-- <el-input style="width: 300px;
    height: 32px;" v-model="keyword" suffix-icon="el-icon-search" placeholder="请输入关键字" clearable @clear="handleClear"
                    @search="handleSearch">
                </el-input> -->
            <!-- </div> -->
            <div>
                <component :is="selectedComponent"></component>
            </div>
        </div>
    </div>
</template>
<script setup>
import { ref } from 'vue';
import ArticleManagement from './WorkManagement/ArticleManagement';
import ShareManagement from './WorkManagement/ShareManagement';

const selectedComponent = ref(ArticleManagement);
const activeTab = ref('article');


function handleTapageClick(tabName) {
    if(tabName === 'article'){
        selectedComponent.value = ArticleManagement
    }else if(tabName === 'share'){
        selectedComponent.value = ShareManagement
    }
}

// mounted(){
//     this.shareGroupCount = this.shareGroup.length; 
//     this.compositionGroup = this.compositionGroup.length
// },

</script>

  

<style scoped>
.container {
    background-color: #F5F5F5;
    width: 86%;
    display: flex;
    justify-content: center;
}

.page {
    background-color: #fff;
    width: 92%;
    padding: 2rem 3rem;
}

.underline {
  border: none;
  border-top: 1px solid #ccc;
}

/* 去除el-tabs底部灰色横线 */
::v-deep .el-tabs__nav-wrap::after {
    height: 0px;
}
</style>
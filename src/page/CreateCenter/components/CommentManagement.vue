<template>
    <div class="container">
        <div class="page">
            <el-tabs v-model="activeTab1"  @tab-change="handleTapageClick">
                <el-tab-pane label="文章评论" name="article"></el-tab-pane>
                <el-tab-pane label="分享评论" name="share"></el-tab-pane>
                <el-tab-pane label="我发表的评论" name="me"></el-tab-pane>
            </el-tabs>
            <hr>
            <div>
                <component :is="selectedComponent"></component>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import ArticleComment from './CommentManagement/ArticleComment'
import ShareComment from './CommentManagement/ShareComment'
import CommentPost from './CommentManagement/CommentPost'


const activeTab1 = ref('article')
const selectedComponent = ref(ArticleComment)

const handleTapageClick = (tabName) => {
    if(tabName === 'article'){
        selectedComponent.value = ArticleComment;
    }else if(tabName === 'share'){
        selectedComponent.value = ShareComment;
    }else if(tabName === 'me'){
        selectedComponent.value = CommentPost;
    }
}

</script>

<style scoped>
.container {
    background-color: #F5F5F5;
    display: flex;
    justify-content: center;
    width: 86%;
}

.page {
    background-color: #fff;
    width: 92%;
    padding: 2rem 3rem;
}

.underline {
  border-bottom: 1px solid #ccc;
}

::v-deep .el-tabs__nav-wrap::after {
    height: 0px;
}</style>
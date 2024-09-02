<script>
/***
 * 创作中心的侧边栏
 */
export default {
    methods: {
        showComponent(component){
            /* 一旦触发showComponent事件，即触发自定义事件show-component
            同时传递组件名称*/
            this.$emit('show-component',component)
        }
    }
}
</script>

<template>
    <el-row>
        <el-col>
            <span style="display: flex; justify-content: center;width: 150px; align-items: center; gap: 0.5rem;">
                <img src="@/assets/CreateCenter/Frame.svg" style="width: 20px; height: 20px;">
                <h2 class="mb-2" style="text-align: center;">创作中心</h2>
            </span>
            <el-menu default-active="1" class="el-menu-vertical-demo" @open="handleOpen" @close="handleClose">
                <!-- 首页 -->
                <el-menu-item index="1" @click="showComponent('MainSection')">
                    <el-icon>
                        <House />
                    </el-icon>
                    <span>首页</span>
                </el-menu-item>
                <!-- 管理 -->
                <el-sub-menu index="2">
                    <template #title>
                        <el-icon>
                            <Memo />
                        </el-icon>
                        <span>管理</span>
                    </template>
                    <el-menu-item-group>
                        <el-menu-item index="2-1" @click="showComponent('WorkManagement')">作品管理</el-menu-item>
                        <el-menu-item index="2-2" @click="showComponent('CommentManagement')">评论管理</el-menu-item>
                        <el-menu-item index="2-3" @click="showComponent('XXXXGeneral')">专栏和收藏管理</el-menu-item>
                    </el-menu-item-group>
                </el-sub-menu>
                <!-- 数据 -->
                <el-sub-menu index="3">
                    <template #title>
                        <el-icon>
                            <DataLine />
                        </el-icon>
                        <span>数据</span>
                    </template>
                    <el-menu-item-group>
                        <el-menu-item index="3-1" @click="showComponent('ArticleData')">文章数据</el-menu-item>
                        <el-menu-item index="3-2" @click="showComponent('ShareData')">分享数据</el-menu-item>
                        <el-menu-item index="3-3" @click="showComponent('IncomeData')">收益数据</el-menu-item>
                        <!-- <el-menu-item index="3-4" @click="showComponent('FansData')">粉丝数据</el-menu-item> -->
                    </el-menu-item-group>
                </el-sub-menu>
            </el-menu>
        </el-col>
    </el-row>
</template>
  
<style scoped>

</style>
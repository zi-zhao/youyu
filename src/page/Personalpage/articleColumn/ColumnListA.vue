<template>
    <div class="cbutton">
        <span class="tatitle">我的文章专栏</span>
    </div>
    <div class="hh" v-infinite-scroll="load" infinite-scroll-distance="100" infinite-scroll-immediate="false">
        <div class="show" v-for="item in articleColumnData" :key="item.id"  >
            <div style="display: flex;flex-direction: column;justify-content: space-between;height: 100%;">
                <span class="title">{{ item.name }}</span>
                <span class="content multi-line-ellipsis-2 ">{{ item.profile }}</span>
                <div class="more">
                    <span class="time">创建时间{{ item.createTime }}</span>
                    <span class="time">文章数量 {{ item.number }}</span>
                    <span class="time">获赞数 {{ item.likeCount }}</span>
                    <span class="text" @click="setActive(item)">进入专栏</span>
                </div>
            </div>
            <img :src="item.coverPicture" alt="" class="carepic">        
        </div>
        <el-empty 
            v-if="articleColumnData.length === 0 || !articleColumnData" 
            :image-size="200" 
            description="您还没有文章专栏呢，快去创作吧！"
        />
    </div>
</template>
    
<script setup>
    import { ref, onMounted,defineEmits} from 'vue';
    import axios from '@/utils/request';
    import { getColumnPictureFromCOS } from '@/utils/cosService';
    import { ElMessage } from 'element-plus';

    const currentPage = ref(1);
    const emits = defineEmits(['dataFromChild']);
    const articleColumnData = ref([]);
    const userId = localStorage.getItem("userId"); // 获取用户ID
   
    const setActive = (item) => {
        const name = '文章专栏';
        const id = item.id;
        emits('dataFromChild', name,id);
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
            await getArticleColumn(currentPage.value);
            currentPage.value++; // 只有在请求成功完成后才递增页码
        } catch (error) {
            console.error(error);
            ElMessage.error('滚动时的未知错误');
        } finally {
            isLoading = false; // 请求完成，无论成功或失败，都释放锁状态
        }
    }

    async function getArticleColumn(currentPage) {
        try {
            const response = await axios.get('/column', {
                params: {
                    type: 0,
                    page: currentPage,
                    pageSize: 10,
                    userId: Number(userId),
                }
            });
            if (response.data.code === 1 && response.data.data.records.length > 0) {
                const updates = response.data.data.records.map(async (record) => {
                    const coverPicture = await getColumnPictureFromCOS(record.id);
                    return {
                        ...record,
                        coverPicture
                    };
                });
                const updatedRecords = await Promise.all(updates);
                articleColumnData.value = [...articleColumnData.value, ...updatedRecords];
            } else if (response.data.code === 1 && response.data.data.records.length === 0) {
                // ElMessage.info('已加载所有数据');
            } else if (response.data.code === 0 && response.data.msg) {
                ElMessage.error(response.data.msg.toString());
            } else {
                console.error("获取文章专栏数据失败");
                ElMessage.error("获取文章专栏数据失败");
            }
        } catch (error) {
            console.error('获取文章专栏数据失败', error);
            ElMessage.error("获取文章专栏数据失败");
        }
    }


    onMounted(() => {
        getArticleColumn(currentPage.value);
    });

</script>
    
<style scoped>
.hh{
    display: flex;
    flex-direction: column;
    height: 81vh;
    width: 100%;
    overflow-y: auto;
    overflow-x: hidden;
}
.cbutton{
    border-bottom: 1px solid rgb(212, 212, 212);
    padding: 9px 1%;
    width: 98%;
}
.tatitle{
    color: #000; 
    text-align: center;
    font-family: Microsoft YaHei;
    font-size: 23px;
    line-height: 1.6; 
}
.show{
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 30px 30px;
    gap: 16px;
    border-radius: 4px;
    background-color: #fffffc;
    border-bottom: 1px solid rgb(240 240 240);
}
.title{
    color: #000;
    font-size: 18px;
    font-weight: 700;
    line-height: 120%; 
}
.content{
    width: 600px;
    margin: 15px 0px;
    color: #646464;
    line-height: 1.6;
}
.more{
    display: flex;
    gap: 40px;
    margin-top: 15px;
}
.time{
    color: #76849f;;
    font-size: 14px;
    line-height: 120%;
}
.text{
    color: #2B6AE8;
    text-align: center;
    font-size: 14px;
    line-height: 120%; 
    cursor: pointer;
}
.carepic{
    width: 170px;
    height: 110px;
    border-radius: 8px;
}
/* 调整滚动条宽度和颜色 */
::-webkit-scrollbar {
    width: 6px; /* 增加纵向滚动条的宽度 */
    height: 8px; /* 增加横向滚动条的高度 */
    background: transparent;
}

/* 定义滚动条轨道，设置为透明 */
::-webkit-scrollbar-track {
    box-shadow: inset 0 0 8px rgba(0, 0, 0, 0); /* 内阴影 */
    background: transparent; /* 将轨道背景设置为透明 */
}

/* 定义滑块，设置为浅灰色并增加内阴影 */
::-webkit-scrollbar-thumb {
    box-shadow: inset 0 0 8px rgba(145, 145, 145, 0.3); /* 添加淡灰色内阴影 */
    background-color: #e2e2e2; /* 滑块的颜色改为浅灰色 */
    border-radius: 10px; /* 保持圆角不变 */
}
/* 当鼠标悬停在滚动条滑块上时改变滑块的颜色 */
::-webkit-scrollbar-thumb:hover {
    background: #c8c8c8;
}
</style>
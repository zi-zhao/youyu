<!-- 用户已经创建的专栏或收藏列表，有以下几种触发方式：
1、浏览其他人的作品，想要收藏至自己的收藏夹
2、创作文章或分享时，需要选择将这篇作品放置在哪个专栏下 -->
<template>
    <div>
        <el-dialog  v-model="localDialogVisible" :title="ClassifyName + '信息'" style="margin-top: 9vh">
            <!-- <div class="cbutton">
                <span class="tatitle">TA的文章专栏</span>
            </div> -->
            <div class="hh">
                <div class="show" v-for="item in dataData" :key="item.id" @click="setActive(item.id,item.name)" tabindex="0">
                    <div class="left">
                        <span class="title">{{ item.name }}</span>
                        <span class="content">{{ item.profile }}</span>
                    </div>
                    <div class="right">
                        <img :src="item.coverPicture" alt="" class="carepic">
                    </div>
                </div>
            </div>
            <template #footer>
            <span class="dialog-footer">
                <el-button @click="localDialogVisible = false">取消</el-button>
                <el-button type="primary" @click="someMethodInChildComponent()">
                确定
                </el-button>
            </span>
            </template>
        </el-dialog>
    </div>
</template>
    
<script setup>
    import { ref, onMounted,defineProps,defineEmits,watchEffect} from 'vue';
    import axios from '../../utils/request';
    import { ElMessage } from 'element-plus';
    import { getColumnPictureFromCOS,getFavoritePictureFromCOS } from '@/utils/cosService';

    const userId = localStorage.getItem("userId"); // 获取用户ID
    const props = defineProps({
        ClassifyName: String,
        modelValue: Boolean,
    });
    const emits = defineEmits(['updateValue', 'update:modelValue']);
    const localDialogVisible = ref(props.modelValue);
    watchEffect(() => {
    if (localDialogVisible.value !== props.modelValue) {
        emits('update:modelValue', localDialogVisible.value);
    }
    });

    const dataData =ref([]);
    const columnId = ref();
    const columnName = ref();


    const setActive = (itemId,itemName) => {
        columnId.value = itemId;
        columnName.value = itemName;
    }

    //将专栏ID传回父组件的函数
    const someMethodInChildComponent = () => {
        const data = [columnId.value, columnName.value];
        emits('updateValue', data);
        localDialogVisible.value = false;
    }

    //根据父组件传回的classifyname判断应该调用的接口类型（这个方法只是增加一个判断值）
    const submitData = () => {
        if(props.ClassifyName === "文章专栏"){
            fetchArticleColumnData();
        }else if(props.ClassifyName === "分享专栏"){
            fetchShareColumnData();
        }else if(props.ClassifyName === "文章收藏"){
            fetchArticleFavoriteData();
        }else if(props.ClassifyName === "分享收藏"){
            fetchShareFavoriteData();
        }
    }

    //获取文章专栏
    async function fetchArticleColumnData() {
        try {
            const response = await axios.get('/column', {
                    params: {
                        type:0,
                        page:1,
                        pazeSize:100,
                        userId:Number(userId),
                    }
                });
            if(response.data.code === 1){
                dataData.value = response.data.data.records;
                const updatesAsync = dataData.value.map(async (record) => {
                    const coverPicture = await getColumnPictureFromCOS(record.id);
                    return {
                        ...record,
                        coverPicture
                    };
                });
                dataData.value = await Promise.all(updatesAsync);
            } else if(response.data.code === 0 && response.data.msg){
                ElMessage.error(response.data.msg.toString());
            }else {
                    console.error("获取文章专栏列表数据失败");
                    ElMessage.error("获取文章专栏列表数据失败");
                }
            } catch (error) {
                console.error("请求文章专栏接口失败", error);
                ElMessage.error("请求文章专栏接口失败");
            }
    }


    //获取分享专栏
    async function fetchShareColumnData() {
        try {
            const response = await axios.get('/column', {
                    params: {
                        type:1,
                        page:1,
                        pazeSize:1000,
                        userId:Number(userId),
                    }
                });
            if(response.data.code === 1){
                dataData.value = response.data.data.records;
                const updatesAsync = dataData.value.map(async (record) => {
                    const coverPicture = await getColumnPictureFromCOS(record.id);
                    return {
                        ...record,
                        coverPicture
                    };
                });
                dataData.value = await Promise.all(updatesAsync);
            } else if(response.data.code === 0 && response.data.msg){
                ElMessage.error(response.data.msg.toString());
            }else {
                    console.error("获取分享专栏列表数据失败");
                    ElMessage.error("获取分享专栏列表数据失败");
                }
            } catch (error) {
                console.error("请求分享专栏接口失败", error);
                ElMessage.error("请求分享专栏接口失败");
            }
    }


    //获取文章收藏
    async function fetchArticleFavoriteData() {
        try {
            const response = await axios.get('/favorite', {
                    params: {
                        type:0,
                        page:1,
                        pazeSize:100,
                        userId:Number(userId),
                    }
                });
            if(response.data.code === 1){
                dataData.value = response.data.data.records;
                const updatesAsync = dataData.value.map(async (record) => {
                    const coverPicture = await getFavoritePictureFromCOS(record.id);
                    return {
                        ...record,
                        coverPicture
                    };
                });
                dataData.value = await Promise.all(updatesAsync);
            } else if(response.data.code === 0 && response.data.msg){
                ElMessage.error(response.data.msg.toString());
            }else {
                    console.error("获取文章收藏列表数据失败");
                    ElMessage.error("获取文章收藏列表数据失败");
                }
        } catch (error) {
            console.error("请求文章收藏接口失败", error);
            ElMessage.error("请求文章收藏接口失败");
        }
    }


    //获取分享收藏
    async function fetchShareFavoriteData() {
        try {
            const response = await axios.get('/favorite', {
                    params: {
                        type:1,
                        page:1,
                        pazeSize:100,
                        userId:Number(userId),
                    }
                });
            if(response.data.code === 1){
                dataData.value = response.data.data.records;
                const updatesAsync = dataData.value.map(async (record) => {
                    const coverPicture = await getFavoritePictureFromCOS(record.id);
                    return {
                        ...record,
                        coverPicture
                    };
                });
                const updatedRecords = await Promise.all(updatesAsync);
                dataData.value = updatedRecords;
            } else if(response.data.code === 0 && response.data.msg){
                ElMessage.error(response.data.msg.toString());
            }else {
                    console.error("获取分享收藏列表数据失败");
                    ElMessage.error("获取分享收藏列表数据失败");
                }
            } catch (error) {
                console.error("请求分享收藏接口失败", error);
                ElMessage.error("请求分享收藏接口失败");
            }
        }

    onMounted(() => {
        submitData();
    });

</script>
    
<style scoped>
::v-deep  .el-dialog{
    width: 75%;
    height: 80%;
}
::v-deep .el-dialog__body{
    padding: 10px 30px;
    height: 73%;
}
::v-deep  .el-dialog__header{
    text-align: center;
}
::v-deep  .el-dialog__title {
    font-weight: 700;
    font-size: 20px;
}
.hh{
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
    overflow-y: auto; 
    overflow-x: hidden; 
    }
.cbutton{
    position: relative;
    gap: 22px;
    border-bottom: 1px solid rgb(212, 212, 212);;
    padding: 14px 12px;
    width: 866px;
}
.tatitle{
    color: #000; 
    text-align: center;
    font-family: Microsoft YaHei;
    font-size: 23px;
    line-height: 120%; 
}
.show{
    position: relative;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    width: 90%;
    height: 120px;
    padding: 10px 50px;
    margin: 0px auto;
    border-radius: 4px;
    background-color: #fffffc;
    border-bottom: 1px solid rgb(240 240 240);
    cursor: pointer;
}
.show:focus,
.show:hover{
    background-color:#dde9f5;
}
.left {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-top: 5px;
}
.title{
    color: #000;
    font-family: Microsoft YaHei;
    font-size: 18px;
    font-style: normal;
    font-weight: 700;
    line-height: 120%; 
}
.content{
    width: 500px;
    color: #646464;
    font-family: Microsoft YaHei;
    font-size: 16px;
    font-style: normal;
    font-weight: 400;
    line-height: 120%; 
}
.carepic{
    width: 160px;
    height: 100px;
    flex-shrink: 0;
    border-radius: 8px;
}
</style>
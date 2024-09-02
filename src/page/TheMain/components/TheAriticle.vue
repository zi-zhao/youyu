<template>
    <div v-if="content.length > 0" class="large" v-infinite-scroll="load" infinite-scroll-distance="150" infinite-scroll-immediate="false">
        <!-- 遍历渲染盒子内容-->
        <div class="small" v-for="(source,index) in content" :key="index" @click="toArticle(source.id)">
            <img v-if="source.purchaseState === 1" class="top-icon" src="@/assets/TheMain/baitTop.svg" alt="">
            <!-- <img class="top-icon" src="@/assets/TheMain/baitTop.svg" alt=""> -->
            <img v-if="source.purchaseState === 2" class="top-icon" src="@/assets/TheMain/coinTop.svg" alt="">
            <!-- <img  class="top-icon" src="@/assets/TheMain/coinTop.svg" alt=""> -->
            <div class="one">
                <img src="@/assets/TheMain/LeftTop.svg" style="position: absolute;left: 0px;top: 0px;opacity: 0.5;" alt="">
                <img class="largePicture" :src="source.coverage" alt="">
                <img src="@/assets/TheMain/RightBottom.svg" style="position: absolute;right: 0px;bottom: 0px;opacity: 0.5;" alt="">
            </div>
            <div class="two">
                <h3 style="margin-bottom: 0.5rem;">{{ source.title }}</h3>
                <p>{{ source.summary }}</p>               
            </div>
            <div class="three">
                <div class="three_header">
                    <!-- 用户名 -->
                    <div style="display: flex;align-items: center;gap: 3px;">
                        <span class="subBoardNameClass">{{ source.subBoardName }}</span>
                        <img v-if="source.verified === 1" src="@/assets/VerifiedUser.svg" style="width: 16px;height: 16px;" alt="">
                    </div>
                    <div style="display: flex;align-items: center;justify-content: space-between;gap: 15px;">
                        <div class="frame1">
                            <img src="@/assets/LikeBefore.svg" alt="" >
                            <span class="count">{{ source.likeCount }}</span>
                        </div>
                        <div class="frame2">
                            <img src="@/assets/FavoriteBefore.svg" alt="" >
                            <span class="count">{{ source.favoriteCount }}</span>
                        </div>
                    </div>
                </div>
                <div class="three_middle" v-for="(label,index) in source.labels" :key="index">
                    <span v-if="index <2">
                        {{ '#' }}
                        {{ label }}
                    </span>
                    <span v-if="index === 3">
                        {{ '...' }}
                    </span>
                </div>
            </div>
            <div class="three_bottom">
                <span class="data">{{ formatDate(source.date) }}</span>
            </div>
            <img v-if="source.purchaseState === 1" class="pay-icon" src="@/assets/TheMain/baitPay.svg" alt="">
            <img v-if="source.purchaseState === 2" class="pay-icon" src="@/assets/TheMain/coinPay.svg" alt="">
        </div>
    </div>
    <el-empty 
        v-else
        :image-size="200" 
        description="该板块暂时还没有数据哦，期待您的作品以解锁此地！"
        style="margin-top: 18vh;"
    />
</template>

<script setup>
import {reactive,onMounted,computed,watch} from 'vue';
import axios from '@/utils/request'
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import qs from 'qs';
import { getArticleCoverageFromCOS } from '@/utils/cosService';
import { ElMessage } from 'element-plus';
import { openUrl } from '@/utils/routeJudge'

const router = useRouter()
const store = useStore()
// 放置请求过来的数据
let content = reactive([])
// 页面滚动时再次请求数据
const n = reactive({ value: 3 });

const api = axios.create({
    paramsSerializer: params => {
        // 使用 'qs' 库和 'repeat' 选项将参数序列化，该选项确保数组元素没有索引
        return qs.stringify(params, { arrayFormat: 'repeat' })
    }
});

const fetchPurchaseState = (point,coin) =>{
    if(point != 0) return 1;
    else if(coin != 0) return 2;
    else return 0;
}

/**
 * 这是网站的核心方法之一，之前代码存在的问题是没有正确处理传入参数为空时的情况
 * 导致路径中出现类似“title=&subBoard=xx”这种情况，实际上title值为空，不应该传给后端的
 */
const getArticleList = async (num, tempSubBoardName, title, labels) => {
    try {
        console.log(num, tempSubBoardName, title, labels);
        let params = {
            currentPage: num,
            pageSize: 6,
        };
        if (tempSubBoardName) params.subBoard = tempSubBoardName;
        if (title) params.title = title;
        if (labels && Array.isArray(labels)) {
            params.labels = labels;
        }
        // 获取Token
        const token = localStorage.getItem('token');
        // 创建请求头对象
        const headers = {};
        if (token) {
            headers.Authorization = `${token}`;
        }
        // 在请求中添加请求头
        const response = await api.get('/article/list', { 
            params: params,
            headers: headers // 添加Token到请求头
        });
        if(response.data.code === 1){
            const recordsToProcess = response.data.data.records.slice(0, 6);
            const coveragePromises = recordsToProcess.map(async record => {
                const coverage = await getArticleCoverageFromCOS(record.id);
                const verified = await fetchUserInformation(record.userId);
                const purchaseState = fetchPurchaseState(record.requiredPoint,record.requiredCoin);
                return {
                    id: record.id,
                    coverage,
                    verified,
                    title: record.title,
                    summary: record.summary,
                    date: record.createTime,
                    subBoardName: record.username,
                    likeCount: record.likeCount,
                    favoriteCount: record.favoriteCount,
                    requiredCoin: record.requiredCoin,
                    labels: record.label.split(','),
                    purchaseState,
                };
            });
            const results = await Promise.all(coveragePromises);
            results.forEach(result => content.push(result));
        }else if(response.data.code === 0 && response.data.msg){
            ElMessage.error(response.data.msg.toString());
        }else{
            ElMessage.error('获取文章数据失败');
        }
    }catch (error) {
        console.error(error);
        ElMessage.error('获取文章数据失败');
    }
}

// 添加一个锁状态
let isLoading = false;
async function load() {
    if (isLoading) return; // 如果已经在加载中，则直接返回不执行新的加载
    isLoading = true; // 开始加载数据，设置锁状态为true
    try {
        await getArticleList(n.value, store.state.subBoardName, store.state.customValue, store.state.selectLabel);
        n.value++; // 只有在请求成功完成后才递增页码
    } catch (error) {
        console.error(error);
    } finally {
        isLoading = false; // 请求完成，无论成功或失败，都释放锁状态
    }
}

/**
 * 下面的这三个方法在功能上是相似的，都是通过computed监视Vuex store里指定参数的变化情况
 * 然后调用watch函数，在watch函数中再讲变化值传给获取文章分页的getArticleList函数
 * 因为在getArticleList函数中处理好了参数为空的情况，所以这里可以大胆从store直接取值，不需要再加判断
 * 对于Vuex的原理我不是很懂，但相比这样反复更改页面的全局变量或许会有更好的解决方法？
 */
// 点击二级板块后获取文章数据
const subBoardNameNow2 = computed(()=>{ return store.state.subBoardName })
watch(subBoardNameNow2, async (newValue) => {
    if(newValue !== '') {
        content.splice(0);  // 清空 content 数组
        n.value = 3;
        // 确保按照顺序加载文章列表
        for (let i = 1; i <= 3; i++) {
            await getArticleList(i, newValue, store.state.customValue, store.state.selectLabel);
        }
    }
});
//用户点击（或回车）搜索框后调用该方法
const selectState = computed(()=>{ return store.state.selectState })
watch(selectState,async (newValue)=>{
    if(newValue!==0){
        content.splice(0)
        n.value = 3;
        for (let i = 1; i <= 3; i++) {
            await getArticleList(i, store.state.subBoardName,store.state.customValue,store.state.selectLabel);
        }
    }
    store.commit('SELECTSTATE',0);
})

// // 选中标签获取文章数据
// const selectLabelJoined = computed(() => {
//     return store.state.selectLabel;
// });
// watch(selectLabelJoined, async (newValue) => {
//     if (newValue.length > 0) { // 检查数组是否有元素
//         content.splice(0);
//         n.value = 4;
//         const newLabels = []; // 使用普通数组，不是 ref
//         newValue.forEach(label => {
//             newLabels.push(label);
//         });
//         for (let i = 1; i <= 3; i++) {
//             await getArticleList(i, store.state.subBoardName, store.state.customValue, newLabels);
//         }
//     }
// }),{ deep: true };

//点击获取跳转文章详情
function toArticle(articleId){
    // const routeLocation = router.resolve({ path: `/TheArticle/${articleId}` });
    // window.open(routeLocation.href, '_blank');
    openUrl(`/TheArticle/${articleId}`)
}

//时间数据格式化
function formatDate(dateStr) {
    const date = new Date(dateStr);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
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

onMounted(async () => {
    for (let i = 1; i <= 2; i++) {
        await getArticleList(i);
    }
});


</script>

<style scoped>
.large{
    width: auto;
    height: 100%;
    margin-top: 60px;
    display: flex;
    padding: 0px 20px;
    margin: 50px auto;
    justify-content: flex-start;
    flex-wrap: wrap;
    gap: 100px 67px;
    min-height: 100vh;
}
.small{
    width: 330px;
    height: 510px;
    margin: 0px auto;
    border-radius: 8px;
    background-color: #fff;
    border: 1px solid #f5f5f5;
    box-shadow: 15px 15px 20px 0px rgba(0, 0, 0, 0.16);
    transition: transform 0.2s ease-out;
    cursor: pointer;
    position: relative;
}
.small:hover {
    transform: translateY(-5px) translateX(5px);
}
.top-icon{
    position: absolute;
    top: 0px;
    right: 0px;
    z-index: 999;
}
.one{
    display: inline-block;
    width: 100%;
    height: 180px;
    border-radius: 8px;
    background-image: url('@/assets/TheMain/ArticleBackground.png');
    background-size: cover;
    background-repeat: no-repeat;
    background-position: center center;
    margin: 0;
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
}
.largePicture{
    width: 250px;
    height: 155px;
}
.smallPicture{
    width: 20px;
    height: 20px;
    margin: 20px 4px 8px 10px;
}
.two{
    display: block;
    height: 200px;
    width: 265px;
    margin: 1rem auto 0.5rem;
}
h3{
    color: #000;
    text-align: center;
    font-family: Microsoft YaHei;
    font-size: 16px;
    font-style: normal;
    font-weight: 700;
    line-height: 120%; 
}
p{
    color: #000;
    font-family: -apple-system,BlinkMacSystemFont,Helvetica Neue,PingFang SC,Microsoft YaHei,Source Han Sans SC,Noto Sans CJK SC,WenQuanYi Micro Hei,sans-serifssss;
    font-size: 14px;
    font-style: normal;
    font-weight: 400;
    line-height: 1.6;
}
.three{
    display: block;
    height: 55px;
    width: 275px;
    margin: auto;
}
.three_header{
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    margin-bottom: 10px;
}
.subBoardNameClass{
    font-size: 14px;
    font-style: normal;
    font-weight: 700;
    line-height: 120%;
    left: 5px;
}
.frame1, .frame2{
    display: flex;
    align-items: center;
    gap: 3px;
}
.frame1 img{
    width: 16px;
    height: 16px;
    cursor: pointer;
}
.frame2 img{
    width: 18px;
    height: 18px;
    cursor: pointer;
}
.count{
    color: #2d2d2d;
    font-family: Microsoft YaHei;
    font-size: 12px;
    display: inline-block;
   
}

.three_middle{
    height: 23px;
    margin: auto;
    overflow-wrap: break-word;
    overflow: hidden;
    display: inline-block;
    flex-wrap: nowrap; 
}
.three_middle span {
    display: inline-block;
   /* 设置外部方块样式 */
    height: 23px;
    margin: auto 3px;
    padding: 0px 10px ;
    /* 设置内部文字样式 */
    color:#242424;
    border-radius: 15px;
    font-size: 12px;
    font-family: Microsoft YaHei;
    line-height: 23px;
    background: rgba(230, 227, 227, 0.63);
    backdrop-filter: blur(5px);
    /* 设置鼠标悬停样式 */
    cursor: pointer;
    user-select: none;
}
.three_bottom{
    width: 78px;
    height: 17px;
    margin: 6px auto 0px;
}
.data{
    color: #666666;
    font-size: 13px;
}
.pay-icon{
    position: absolute;
    right: 3px;
    bottom: 3px;
    width: 20px;
}
/* 对手机屏幕和小尺寸屏幕的样式调整 */
@media (max-width: 768px) {
    .large {
        margin-top: 30px;
        padding: 0 10px; /* 减少边距 */
        gap: 50px 20px; /* 调整元素间距 */
    }

    .small {
        margin: 0px auto 20px;
        height: auto;
        margin-bottom: 20px;
    }


    .largePicture {
        width: 76%;
        height: 88%;
    }

    .two, .three {
        width: 90%;
        height: auto;
        margin: 20px auto 10px;
    }
    .three_header{
        margin-bottom: 15px;
    }
    .three_bottom{
        margin: 10px auto 15px;
    }
    h3, p, .subBoardNameClass, .count, .three_middle span, .data {
        font-size: smaller; /* 调整字体大小 */
    }

    /* 可以继续添加其他必要的样式调整 */
}
</style>
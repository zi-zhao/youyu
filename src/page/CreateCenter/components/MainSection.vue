<template>
    <div class="container">
        <div class="issue">
            <p class="issue-p font"><img src="@/assets/CreateCenter/Frame.jpg" style="height: 20px;
            width: 20px; margin-right: 0.5rem;">稿件发布</p>
            <div class="imgBx">
                <img src="@/assets/CreateCenter/渔渔·文章发布.png" alt="">
                <button @click="goToArticle">文章发布</button>
            </div>
            <div class="imgBx">
                <img src="@/assets/CreateCenter/渔渔·分享发布.png" alt="">
                <button @click="goToShare">分享发布</button>
            </div>
        </div>
        <div class="stat">
            <div class="manuscript">
                <p class="font">稿件数据</p>
                <div class="content-row" v-for="(row, index) in manuDataRows" :key="index">
                    <div class="content-box" v-for="item in row" :key="item.id">
                        <div style="margin-bottom: 5px; color: #ACACAC">{{ item.name }}</div>
                        <div style="margin-bottom: 5px; color:#606FA0; font-size: larger; font-weight: 600;text-align: center;">{{ item.data }}
                        </div>
                        <div style="color: #ACACAC;">昨日：<span style="color: #606FA0;">{{ item.lastWeekData }}</span></div>
                    </div>
                </div>
            </div>
            <div class="income">
                <p class="font">收益明细</p>
                <div class="income-container">
                    <div class="income-box" v-for="item in incomeData" :key="item.id" :style="{'flex-direction':item.name=== '持有能量值' ? 'row':'column'}">
                        <div style="color: #ACACAC; margin: 1rem 0;">{{ item.name }}</div>
                        <div style="font-size: larger; font-weight: 600; margin-bottom: 1rem;text-align: center;"
                            :style="{ color: item.name === '持有金币数' ? '#FFC960' : (item.name === '持有能量值' ? '#51B541' : '#606FA0') }">
                            {{ item.data }}</div>
                        <div style="color: #ACACAC;">上周：<span
                                :style="{ color: item.name === '持有金币数' ? '#FFC960' : (item.name === '持有能量值' ? '#51B541' : '#606FA0') }">{{
                                    item.lastSevenDayData }}</span></div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref,onMounted,computed} from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import axios from '@/utils/request';


const router = useRouter();
const userId = ref();
const userData = ref({});
const userCurrencyData = ref({});
const userCurrencyLastData = ref({});
const userCreateArticleData = ref({});
const userCreateShareData = ref({});
const userCreateData = ref({});
const userCreateLastData = ref({});

const manuData = computed(() => [
    { id: 1, name: '粉丝数', key: 'fanCount', data: userData.value.fanCount, lastWeekData: userData.value.fanCount  },
    { id: 2, name: '阅读量', key: 'read', data: userCreateData.value.articleRead, lastWeekData: userCreateLastData.value.articleRead  },
    { id: 3, name: '评论数', key: 'comment', data: userCreateData.value.comment, lastWeekData: userCreateLastData.value.comment  },
    { id: 4, name: '收藏数', key: 'favorite', data: userCreateData.value.favorite, lastWeekData: userCreateLastData.value.favorite},
    { id: 5, name: '转发数', key: 'read', data: userCreateData.value.articleTransmit, lastWeekData: userCreateLastData.value.articleTransmit  },
    { id: 6, name: '点赞数', key: 'like', data: userCreateData.value.like, lastWeekData: userCreateLastData.value.like  },
]);

userId.value = localStorage.getItem("userId"); // 获取用户ID

const manuDataRows = computed(() => {
    const rows = [];
    for (let i = 0; i < manuData.value.length; i += 3) {
        rows.push(manuData.value.slice(i, i + 3));
    }
    return rows;
});

const incomeData = computed(() => [
    { id: 1, name: '持有金币数', key: 'coin', data: '', lastSevenDayData: '' },
    { id: 2, name: '持有鱼饵数', key: 'point', data: '', lastSevenDayData: '' },
    { id: 3, name: '持有能量值', key: 'energy', data: '', lastSevenDayData: '' },
]);


const goToArticle = () => {
    prePostArticle();
    router.push('/WangEditor')
};
const goToShare = () => {
    router.push('/ShareEditor')
};

//预提交文章的接口（页面刚加载就会调用，用于获取文章ID）
async function prePostArticle(){
    try {
        const response = await axios.post('/article/draft');
        if(response.data.code ===1) {
            localStorage.setItem('articleId',response.data.data) ;//将获取的文章id存入local
        }else if(response.data.code === 0 && response.data.msg){
            ElMessage.error(response.data.msg.toString());
        }
        else ElMessage.error('预发表文章失败');
    } catch (error) {
        console.log(error);
        ElMessage.error('预发表文章失败');
    }
}

//获取用户货币数据列表
async function getUserCurrency() {
  try{
    const response = await axios.get(`/currency`);
    if(response.data.code === 1){
        userCurrencyData.value = response.data.data;
        incomeData.value.forEach(item => {
            item.data = userCurrencyData.value[item.key];//这里用了计算属性名
        });
        // ElMessage.success('获取用户货币数据成功');
    }else if(response.data.code === 0 && response.data.msg){
        ElMessage.error(response.data.msg.toString());
    }else{
        console.error("获取用户货币数据失败");
        ElMessage.error('获取用户货币数据失败');
    }
  } catch (error) {
    console.error("获取用户货币数据失败", error); 
    ElMessage.error('获取用户货币数据失败');
  }
}

//获取用户七天前货币数据列表
async function getUserLastCurrency() {
  try{
    const response = await axios.get(`/currency/last7days`);
    if(response.data.code === 1){
        userCurrencyLastData.value = response.data.data;
        incomeData.value.forEach(item => {
            item.lastSevenDayData = userCurrencyLastData.value[item.key];//这里用了计算属性名
        });
        // ElMessage.success('获取用户货币数据成功');
    }else if(response.data.code === 0 && response.data.msg){
        ElMessage.error(response.data.msg.toString());
    }else{
        console.error("获取用户货币数据失败");
        ElMessage.error('获取用户货币数据失败');
    }
  } catch (error) {
    console.error("获取用户货币数据失败", error); 
    ElMessage.error('获取用户货币数据失败');
  }
}

//获取用户信息列表
async function getUserInform() {
  try{
  const response = await axios.get(`/users/${userId.value}?apifoxApiId=100741633`);
      //const response = await axios.get(`/users/${userId.value}`);
    if(response.data.code === 1){
        userData.value = response.data.data;
        // manuData.value.forEach(item => {
        //     item.data = userData.value[item.key];//这里用了计算属性名
        //     item.yesterdayData = userData.value[item.key];
        // });
    }else if(response.data.code === 0 && response.data.msg){
        ElMessage.error(response.data.msg.toString());
    }else{
        console.error("获取用户数据失败");
        ElMessage.error('获取用户数据失败');
    }
  } catch (error) {
    console.error("获取用户数据失败", error); 
    ElMessage.error('获取用户数据失败');
  }
}

//获取用户稿件数据
async function getCreatedata() {
  try {
    const response1 = await axios.get('/articledata');
    const response2 = await axios.get('/sharedata');
    if(response1.data.code === 1 && response2.data.code === 1){
        userCreateArticleData.value = response1.data.data;
        userCreateShareData.value = response2.data.data;
        userCreateData.value.articleRead = userCreateArticleData.value.articleRead;
        userCreateData.value.articleTransmit = userCreateArticleData.value.articleTransmit;
        userCreateData.value.favorite =  Number(userCreateArticleData.value.articleFavorite)+ Number(userCreateShareData.value.shareFavorite);
        userCreateData.value.comment =  Number(userCreateArticleData.value.articleComment)+ Number(userCreateShareData.value.shareComment);
        userCreateData.value.like =  Number(userCreateArticleData.value.articleLike)+ Number(userCreateShareData.value.shareLike);
        // ElMessage.success('获取用户稿件数据成功');
    }else if(response1.data.code === 0 && response1.data.msg){
        ElMessage.error(response1.data.msg.toString());
    }else if(response2.data.code === 0 && response2.data.msg){
        ElMessage.error(response2.data.msg.toString());
    }else{
        console.error("获取用户稿件数据失败");
        ElMessage.error("获取用户稿件数据失败");
    }
  } catch (error) {
    console.error("获取用户稿件数据失败", error); 
    ElMessage.error("获取用户稿件数据失败");
  }
}

//获取用户上周稿件数据列表
async function getUserLastCreatedata() {
  try{
    const response = await axios.get(`/createdata/last7days`);
    if(response.data.code === 1){
        userCreateLastData.value = response.data.data;
        userCreateLastData.value.favorite =  Number(userCreateLastData.value.articleFavorite)+ Number(userCreateLastData.value.shareFavorite);
        userCreateLastData.value.comment =  Number(userCreateLastData.value.articleComment)+ Number(userCreateLastData.value.shareComment);
        userCreateLastData.value.like =  Number(userCreateLastData.value.articleLike)+ Number(userCreateLastData.value.shareLike);
        // ElMessage.success('获取用户货币数据成功');
    }else if(response.data.code === 0 && response.data.msg){
        ElMessage.error(response.data.msg.toString());
    }else{
        console.error("获取用户货币数据失败");
        ElMessage.error('获取用户货币数据失败');
    }
  } catch (error) {
    console.error("获取用户货币数据失败", error); 
    ElMessage.error('获取用户货币数据失败');
  }
}

onMounted(() => {
    getUserInform();
    getUserCurrency();
    getUserLastCurrency();
    getCreatedata();
    getUserLastCreatedata();
})



</script>


<style scoped>
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

.container {
    background-color: #F5F5F5;
    width: 100%;
}

.issue {
    background-color: #ffffff;
    width: 90%;
    height: 350px;
    border-radius: 16px;
    margin-top: 3rem;
    display: flex;
    flex-direction: row;
    justify-content: space-evenly;
    position: relative;
}

.issue-p {
    width: 20%;
    display: flex;
    align-items: center;
    position: absolute;
    left: -10px;
    top: -10px;
}

.imgBx {
    display: flex;
    flex-direction: column;
    justify-content: space-evenly;
    align-items: center;
}

.stat {
    width: 90%;
    height: 450px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 0 50px;
    gap: 1rem;
}

.manuscript {
    width: 700px;
    height: 350px;
    background-color: #ffffff;
    border-radius: 16px;
}

.income {
    width: 400px;
    height: 350px;
    background-color: #ffffff;
    border-radius: 16px;
}

.content-row {
    display: flex;
    justify-content: center;
    margin-bottom: 1rem;
}

.content-box {
    width: calc(33.33% - 1rem);
    height: 120px;
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
    background-color: #f5f7ff;
    padding: 1rem;
    margin: 0 24px;
}

.income-box {
    background-color: FFFFFF;
    height: 100px;
    border-radius: 16px;
    padding: 1rem;
}

.income-container {
    display: flex;
    justify-content: space-evenly;
}

p {
    padding: 2rem 2rem 1.5rem;
    font-weight: 600;
}

img {
    width: 300px;
    height: 200px;
}


button {
    width: 150px;
    height: 50px;
    background-color: #FFC960;
    color: #FFFFFF;
    border: none;
    padding: 10px 20px;
    border-radius: 5px;
    font-size: 16px;
    cursor: pointer;
}

button:hover {
    background-color: #FFB040;
}
</style>

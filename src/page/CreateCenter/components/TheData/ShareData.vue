<template>
  <div style="width: 100%;">
    <div class="radar_bar">
        <!-- 雷达图容器 -->
        <div ref="radarContainer" class="radarbox"></div>
        <!-- 柱状图容器 -->
        <component :is = cold></component>
    </div>
    <div class="showdata">
        <p class="font">分享数据</p>
        <div class="content_box">
            <div class="content_row" :class="{ 'selected-box': selectedId === item.id }" v-for="(item, index) in manuData" :key="index">
                <div @click="selectSpecificData(item.id)">
                    <div class="up">
                        <img :src="item.imgSrc" alt="">
                        <div class="name">{{ item.name }}</div>
                    </div>
                    <div class="down">
                        <div class="data" >{{ item.data }}</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div >
        <component :is = headache></component>
    </div>
  </div>
</template>

<script setup>
import { ElMessage } from 'element-plus';
import axios from '@/utils/request';
import { ref, onMounted,computed } from 'vue';
import * as echarts from 'echarts';
import favoriteImg from '@/assets/FavoriteBefore.svg'
import commentImg from '@/assets/Comment.svg'
import likeImg from '@/assets/LikeBefore.svg'
import CommentData from '@/page/CreateCenter/components/TheData/ShareDataPage/CommentData'
import FavoriteData from '@/page/CreateCenter/components/TheData/ShareDataPage/FavoriteData'
import LikeData from '@/page/CreateCenter/components/TheData/ShareDataPage/LikeData'
import CommentDataRatio from '@/page/CreateCenter/components/TheData/ShareDataRatio/CommentData'
import FavoriteDataRatio from '@/page/CreateCenter/components/TheData/ShareDataRatio/FavoriteData'
import LikeDataRatio from '@/page/CreateCenter/components/TheData/ShareDataRatio/LikeData'

const userId = localStorage.getItem("userId"); // 获取用户ID
const userCreateData = ref([]);
const radarContainer = ref(null);
const headache = ref(FavoriteData);
const cold = ref(FavoriteDataRatio);
const user = ref({});

// 添加一个响应式属性来存储当前选中的项目 ID
const selectedId = ref(0); // 默认为0，即收藏数

const manuData = computed(() => [
    { id: 0, name: '收藏数', data: userCreateData.value.shareFavorite, imgSrc: favoriteImg},
    { id: 1, name: '评论数', data: userCreateData.value.shareComment , imgSrc: commentImg},
    { id: 2, name: '点赞数', data: userCreateData.value.shareLike, imgSrc: likeImg},
]);

const selectSpecificData = (type) =>{
    selectedId.value = type; // 更新选中的ID
    getRecentCreatedata(type);
}

const getRecentCreatedata =(type) =>{
    if(type == 0){
        headache.value = FavoriteData;
        cold.value = FavoriteDataRatio;
    }else if(type == 1){
        headache.value = CommentData;
        cold.value = CommentDataRatio;
    }else if(type == 2){
        headache.value = LikeData;
        cold.value = LikeDataRatio;
    }
}


// 获取用户信息
const fetchAvatar = async () => {
    try {
        const response = await axios.get(`/users/${userId}`);
        if(response.data.code === 1){
            user.value = response.data.data;
            user.value.manuscript = Number(user.value.shareCount);
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


//获取用户稿件数据
async function getCreatedata() {
  try {
    const response = await axios.get('/sharedata')
    if(response.data.code === 1){
        userCreateData.value = response.data.data;
        // ElMessage.success('获取用户稿件数据成功');
    }else if(response.data.code === 0 && response.data.msg){
        ElMessage.error(response.data.msg.toString());
    }else{
        console.error("获取用户稿件数据失败");
        ElMessage.error("获取用户稿件数据失败");
    }
  } catch (error) {
    console.error("获取用户稿件数据失败", error); 
    ElMessage.error("获取用户稿件数据失败");
  }
}


onMounted(async () => {
    await fetchAvatar();
    await getCreatedata();
    // 雷达图配置
    const radarOption = {
        title: {
        text: '我的表现'
        },
        tooltip: {},
        radar: {
            //指示器
            indicator: [
                { name: '评论数', max: 150 },
                { name: '投稿', max: 150 },
                { name: '点赞数', max: 150 },
                { name: '收藏数', max: 150 },
            ]
        },
        series: [{
            name: 'A vs B',
            type: 'radar',
            data: [
                { 
                    value: [userCreateData.value.shareComment,user.value.manuscript, userCreateData.value.shareLike,  userCreateData.value.shareFavorite],
                    name: 'A',
                    //设置填充面积
                    areaStyle: {
                        color: 'rgba(128, 128, 128, 0.3)'
                    } 
                },
                // { 
                //     value: [35, 30, 40, 11], 
                //     name: 'B',
                //     areaStyle: {
                //         color: 'rgba(128, 128, 128, 0.3)'
                //     }
                // },
                // {   
                //     value: [78, 105, 13, 78], 
                //     name: 'C' ,
                //     areaStyle: {
                //         color: 'rgba(128, 128, 128, 0.3)'
                //     }
                // }
            ]
        }]
    };

    // 初始化图表
    const radarChart = echarts.init(radarContainer.value);
    radarChart.setOption(radarOption);
});
</script>

<style scoped>
.radar_bar{
    display: flex;
    width: 960px;
    justify-content: space-between;
    margin: 10px auto 40px;
}
.radarbox,
.barbox,
.showdata,
.linechart{
    border: 1px solid #eaeaea;
    box-shadow: 0px 0px 20px 0px rgba(96, 111, 160, 0.25), 0px 4px 4px 0px rgb(0 0 0 / 21%);
    border-radius: 20px;
    padding: 20px 30px;
}
.radarbox,
.barbox{
    width: 370px;
    height: 260px;
}
.showdata,
.linechart{
    width: 900px;
    margin: 20px auto 40px; 
}
.showdata{
    height: 180px;
}
.font{
    font-size: 18px;
    font-weight: 700;
}
.content_box {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    gap: 25px 50px;
    margin-bottom: 1rem;
    margin-top: 2rem;
}
.content_row {
    width: 170px;
    height: 70px;
    background-color: #FBFBFB;
    border-radius: 10px;
    padding: 15px;
}
.content_row:hover,
.selected-box{
    background-color: #F5F7FF;
    cursor: pointer;
}
.up,
.down{
    display: flex;
    align-items: center;
    gap: 5px;
}
.up img,
.name,
.data{
    display: inline-block;
}
.up img{
    width: 20px;
    height: 20px;
}
.name{
    /* color: #ACACAC; */
    color: #2d2d2d;
}
.down {
    justify-content: center;
    margin-top: 15px;
}
.data{
    color:#606FA0; 
    font-size: larger; 
    font-weight: 600; 
    text-align: center;
}
.linebox{
    width: 100%;
    height: 300px;
}
</style>

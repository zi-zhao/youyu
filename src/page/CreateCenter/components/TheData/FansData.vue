<template>
  <div style="width: 100%;">
    <div class="showdata">
        <p class="font">粉丝数据</p>
        <div class="content_box">
            <div class="content_row" v-for="(item, index) in manuData" :key="index">
                <div class="up">
                    <div class="name">{{ item.name }}</div>
                </div>
                <div class="down">
                    <div class="data" >{{ item.data }}</div>
                </div>
            </div>
        </div>
    </div>
    <div class="linechart">
        <!-- 折线图容器 -->
        <div ref="lineContainer" class="linebox"></div>
    </div>
    <!-- <div class="fansrank">
        <p class="font">粉丝排行</p>
        <div class="content_box2">
            <div class="content_row2" v-for="(item, index) in fansData" :key="index">
                <div class="up2">
                    <div class="title">{{ item.title }}</div>
                </div>
                <div class="down2">
                   <div class="fans_row" v-for="(entry, index) in item.fans" :key="index">
                        <div class="rank" >{{ entry.rank }}</div>
                        <div class="fanspic">
                            <img src="../../../../assets/fish.png" alt="">
                        </div>
                        <div class="fansname" >{{ entry.name }}</div>
                   </div>
                </div>
            </div>
        </div>
    </div> -->
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import * as echarts from 'echarts';
// import { ElMessage } from 'element-plus';
// import axios from '../../../../utils/request';

const lineContainer = ref(null);

const manuData = ref([
    { id: 1, name: '粉丝量', data: '10'},
    { id: 2, name: '新增粉丝', data: '1000'},
    { id: 3, name: '净增粉丝', data: '180' },
    { id: 4, name: '取消关注', data: '140'}
]);
// const fansData = ref([
//     { 
//         id: 1, 
//         title: '累积阅读文章数排行',
//         fans: [
//             { rank: 1, fansId:1 , name: '鱼鱼' },
//             { rank: 2, fansId:1 , name: '鱼鱼' },
//             { rank: 3, fansId:1 , name: '鱼鱼' }
//     ]},
//     { 
//         id: 2, 
//         title: '累积打赏金额数排行', 
//         fans: [
//             { rank: 1, fansId:1 , name: '鱼鱼' },
//             { rank: 2, fansId:1 , name: '鱼鱼' },
//             { rank: 3, fansId:1 , name: '鱼鱼' }
//     ]},
//     { 
//         id: 3, 
//         title: '累积分享互动数排行', 
//          fans: [
//             { rank: 1, fansId:1 , name: '鱼鱼' },
//             { rank: 2, fansId:1 , name: '鱼鱼' },
//             { rank: 3, fansId:1 , name: '鱼鱼' }
//     ]},
//     { 
//         id: 4, 
//         title: '累积提问金额数排行', 
//          fans: [
//             { rank: 1, fansId:1 , name: '鱼鱼' },
//             { rank: 2, fansId:1 , name: '鱼鱼' },
//             { rank: 3, fansId:1 , name: '鱼鱼' }
//     ]},
// ]);

//获取用户近7天货币总收益
// async function getRecentTotalIncomedata() {
//   try {
//     const response = await axios.get(`/currency/last7days`)
//     if(response.data.code === 1){
//         userSevenTotalIncomeData.value = response.data.data;
//         ElMessage.success('获取用户近7天货币数据成功');
//     }else{
//         console.error("获取用户近7天货币数据失败");
//         ElMessage.error("获取用户近7天货币数据失败");
//     }
//   } catch (error) {
//     console.error("获取用户近7天货币数据失败", error); 
//     ElMessage.error("获取用户近7天货币数据失败");
//   }
// }

onMounted(() => {


    // 折线图配置
    const lineOption = {
        title: {
            text: '近7天阅读量'
        },
        tooltip: {},
        grid:{
            height: "75%"
        },
        xAxis: {
            type: 'category',
            data: ['10/1', '10/2', '10/3', '10/4', '10/5', '10/6', '10/7']
        },
        yAxis: {
            type: 'value',
            splitNumber: 4
        },
        series: [{
            data: [10,20,20,20,30,40,10],
            type: 'line',
            smooth: true,
            barWidth: 60,
        }]
    };

    // 初始化图表
    const lineChart = echarts.init(lineContainer.value);
    lineChart.setOption(lineOption);
});
</script>

<style scoped>
.showdata,
.linechart,
.fansrank{
    border: 1px solid #eaeaea;
    box-shadow: 0px 0px 20px 0px rgba(96, 111, 160, 0.25), 0px 4px 4px 0px rgb(0 0 0 / 21%);
    border-radius: 20px;
    padding: 20px 30px;
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
.content_box,
.content_box2 {
    display: flex;
    justify-content: center;
    margin-bottom: 1rem;
}
.content_box{
    gap: 25px 45px;
}
.content_row{
    width: 110px;
    height: 60px;
    background-color: #FBFBFB;
    border-radius: 10px;
    padding: 15px;
}
.content_row:hover{
    background-color: #F5F7FF;
    cursor: pointer;
}
.up,
.down{
    display: flex;
    align-items: center;
    gap: 5px;
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
    height: 350px;
}
.fansrank{
    height: 290px;
}
.content_box2 {
    gap: 25px 30px;
    margin-top: 25px;
}

.content_row2{
    width: 150px;
    height: 170px;
    border: 1px solid #e0e0e0;
    border-radius: 10px;
    padding: 15px 20px;
}
.up2{
    display: flex;
    align-items: center;
    gap: 5px;
    margin-bottom: 20px;
}
.title{
    font-size: 16px;
}
.down2{
    display: flex;
    flex-direction: column;
    gap: 10px;
}
.fans_row{
    display: flex;
    justify-content: flex-start;
    align-items: center;
    gap: 10px;
}
.rank{
    font-size: 20px;
    font-weight: 700;
}
.fanspic img{
    width: 32px;
    height: 32px;
}
.fansname{
    font-size: 16px;
}
</style>

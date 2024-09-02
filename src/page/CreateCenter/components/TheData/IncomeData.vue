<template>
  <div style="width: 100%;">
    <div class="showdata">
        <p class="font">总收益</p>
        <div class="content_box">
            <div class="content_row" v-for="(item, index) in manuData" :key="index">
                <div class="boxborder">
                    <div class="left" :style="{ 'background-color': item.bgccolor }">
                        <img :src="item.imgSrc" alt="">
                    </div>
                    <div class="right">
                        <div class="name">{{ item.name }}</div>
                        <div class="data" :style="{ 'color': item.textcolor }">{{ item.data }}</div>
                        <div style="display: flex; gap: 8px; font-size: 14px;">
                            <div class="thisweek">本周</div>
                            <div class="weekdata" :style="{ 'color': item.textcolor }">+{{ item.weekadd }}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="linechart">
        <!-- 折线图容器 -->
        <div ref="lineContainer" class="linebox"></div>
    </div>
    <div class="barchart">
        <!-- 柱状图容器 -->
        <div ref="barContainer" class="barbox"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted,computed } from 'vue';
import { ElMessage } from 'element-plus';
import axios from '@/utils/request';
import * as echarts from 'echarts';
import baitNumImg from '@/assets/CreateCenter/baitNum.svg'
import yellowCoinsImg from '@/assets/CreateCenter/yellowCoins.svg'
import energyImg from '@/assets/CreateCenter/energy.svg'

const lineContainer = ref(null);
const barContainer = ref(null);
const userCurrencyData = ref({});//保存用户当前的货币数据
const userSevenIncomeData = ref([]);//获取近7天的分别收益
const userSevenTotalIncomeData = ref({});//获取近7天的总收益
const coinData = ref([]);//获取近7天的鱼饵收益
const pointData = ref([]);//获取近7天的渔币收益
const energyData = ref([]);//获取近7天的能量收益
const userYearTotalIncomeData = ref([]);//获取近一年的总收益
// const coinYearData = ref([]);//获取近一年的鱼饵收益
// const pointYearData = ref([]);//获取近一年的渔币收益
// const energyYearData = ref([]);//获取近一年的能量收益

const manuData = computed(() => [
    { id: 1, name: '鱼饵数', data: userCurrencyData.value.point, weekadd:userSevenTotalIncomeData.value.point, imgSrc: baitNumImg , bgccolor:'#E4E8FF' , textcolor:'#606FA0'},
    { id: 2, name: '渔币数', data: userCurrencyData.value.coin, weekadd:userSevenTotalIncomeData.value.coin, imgSrc:  yellowCoinsImg , bgccolor:'#FDEFD4' , textcolor:'#FFC960'},
    { id: 3, name: '能量值', data: userCurrencyData.value.energy, weekadd:userSevenTotalIncomeData.value.energy, imgSrc: energyImg , bgccolor:'#D9FFD2' , textcolor:'#51B541'},
]);

// 转换数据为 ECharts 需要的格式
const transformDataForECharts = (data) => {
    const dataSource = [['product', '鱼饵', '渔币', '能量']];
    // 获取当前月份
    const currentMonth = new Date().getMonth();
    const monthAbbreviations = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    // 创建一个包含当前月份以及之前 11 个月份的数组
    const lastTwelveMonths = Array.from({ length: 12 }, (_, i) => {
        const monthIndex = (currentMonth - i + 12) % 12;
        return monthAbbreviations[monthIndex];
    }).reverse();
    data.forEach((item, index) => {
        const row = [
            lastTwelveMonths[index], 
            item.point, 
            item.coin,  
            item.energy 
        ];
        dataSource.push(row);
    });
    return dataSource;
};

//获取用户当前货币数据
async function getCurrencydata() {
  try {
    const response = await axios.get(`/currency`)
    if(response.data.code === 1){
        userCurrencyData.value = response.data.data;
        // ElMessage.success('获取用户当前货币数据成功');
    }else if(response.data.code === 0 && response.data.msg){
        ElMessage.error(response.data.msg.toString());
    }else{
        console.error("获取用户当前货币数据失败");
        ElMessage.error("获取用户当前货币数据失败");
    }
  } catch (error) {
    console.error("获取用户当前货币数据失败", error); 
    ElMessage.error("获取用户当前货币数据失败");
  }
}

//获取用户近7天货币数据
async function getRecentIncomedata() {
  try {
    const response = await axios.get(`/currency/last7day`)
    if(response.data.code === 1){
        userSevenIncomeData.value = response.data.data;
        userSevenIncomeData.value.forEach((item) => {
            coinData.value.push(item.coin);
            pointData.value.push(item.point);
            energyData.value.push(item.energy);
        });
        // ElMessage.success('获取用户近7天货币数据成功');
    }else if(response.data.code === 0 && response.data.msg){
        ElMessage.error(response.data.msg.toString());
    }else{
        console.error("获取用户近7天货币数据失败");
        ElMessage.error("获取用户近7天货币数据失败");
    }
  } catch (error) {
    console.error("获取用户近7天货币数据失败", error); 
    ElMessage.error("获取用户近7天货币数据失败");
  }
}

//获取用户近7天货币总收益
async function getRecentTotalIncomedata() {
  try {
    const response = await axios.get(`/currency/last7days`)
    if(response.data.code === 1){
        userSevenTotalIncomeData.value = response.data.data;
        // ElMessage.success('获取用户近7天货币数据成功');
    }else if(response.data.code === 0 && response.data.msg){
        ElMessage.error(response.data.msg.toString());
    }else{
        console.error("获取用户近7天货币数据失败");
        ElMessage.error("获取用户近7天货币数据失败");
    }
  } catch (error) {
    console.error("获取用户近7天货币数据失败", error); 
    ElMessage.error("获取用户近7天货币数据失败");
  }
}

//获取用户1年货币总收益
async function getYearIncomedata() {
  try {
    const response = await axios.get(`/currency/last12month`)
    if(response.data.code === 1){
        userYearTotalIncomeData.value = response.data.data;
        // ElMessage.success('获取用户近7天货币数据成功');
    }else if(response.data.code === 0 && response.data.msg){
        ElMessage.error(response.data.msg.toString());
    }else{
        console.error("获取用户近7天货币数据失败");
        ElMessage.error("获取用户近7天货币数据失败");
    }
  } catch (error) {
    console.error("获取用户近7天货币数据失败", error); 
    ElMessage.error("获取用户近7天货币数据失败");
  }
}

onMounted(async () => {
    await getCurrencydata();
    await getRecentIncomedata();
    await getRecentTotalIncomedata();
    await getYearIncomedata();

    // 折线图配置
    const lineOption = {
        title: {
            text: '近7天收益'
        },
        tooltip: {
            trigger: 'axis'
        },
        legend: {
            data: ['能量', '渔币', '鱼饵'],
        },
        grid: {
            bottom: '3%',
            containLabel: true,
            height: "80%"
        },
        toolbox: {
            feature: {
                saveAsImage: {}
            }
        },
        xAxis: {
            type: 'category',
            boundaryGap: false,
            data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        },
        yAxis: {
            type: 'value',
            splitLine :{
                lineStyle:{
                    type:'dashed'//虚线
                },
                show: true
            }
        },
        series: [
            {
                name: '能量',
                type: 'line',
                stack: 'Total',
                data:  energyData.value,
                lineStyle: {
                    width: 1
                },
                symbol: 'image://' + require('@/assets/CreateCenter/incomeData3.svg'),
                symbolSize: [18,12],
            },
            {
                name: '渔币',
                type: 'line',
                stack: 'Total',
                data:  coinData.value,
                lineStyle: {
                    width: 1
                },
                symbol: 'image://' + require('@/assets/CreateCenter/incomeData1.svg'),
                symbolSize: [18,12],
            },
            {
                name: '鱼饵',
                type: 'line',
                stack: 'Total',
                data:  pointData.value,
                lineStyle: {
                    width: 1
                },
                symbol: 'image://' + require('@/assets/CreateCenter/incomeData2.svg'),
                symbolSize: [18,12],
            },
        ]
    };

    //柱状图配置
    const barOption = {
        title: {
            text: '年收益一览'
        },
        legend: {
            itemGap:20
        },
        tooltip: {},
        grid: {
            bottom: '3%',
            left:'10%',
            top:'60px',
            containLabel: true,
            width : "70%",
            height: "80%"
        },
        dataset: {
           source: transformDataForECharts(userYearTotalIncomeData.value)
        },
        xAxis: { type: 'category' },
        yAxis: {},
        series: [{ type: 'bar' }, { type: 'bar' }, { type: 'bar' }]
    };

    // 初始化图表
    const lineChart = echarts.init(lineContainer.value);
    lineChart.setOption(lineOption);

    const barChart = echarts.init(barContainer.value);
    barChart.setOption(barOption);
});
</script>

<style scoped>
.showdata,
.linechart,
.barchart{
    border: 1px solid #eaeaea;
    box-shadow: 0px 0px 20px 0px rgba(96, 111, 160, 0.25), 0px 4px 4px 0px rgb(0 0 0 / 21%);
    border-radius: 20px;
    padding: 20px 30px;
}
.barbox{
    width: 370px;
    height: 260px;
}
.showdata,
.linechart,
.barchart{
    width: 900px;
    margin: 20px auto 40px; 
}
.showdata{
    height: 140px;
}
.font{
    font-size: 18px;
    font-weight: 700;
    margin: 5px 0px;
}
.content_row:nth-child(1),
.content_row:nth-child(2){
    border-right: 1px solid #D4DCEC;
}
.boxborder{
    width: 180px;
    height: 80px;
    padding: 10px 50px;
    display: flex;
    align-items: center;
    gap: 22px;
}
.boxborder:hover{
    background-color: #F5F7FF;
    border-radius: 15px;
    cursor: pointer;
}
.content_box {
    display: flex;
    justify-content: center;
    margin-bottom: 1rem;
}
.left{
    width: 60px;
    height: 60px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
}
.right{
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
}
.left img,
.name,
.data,
.thisweek{
    display: inline-block;
}
.left img{
    width: 24px;
    height: 24px;
}
.name,
.thisweek{
    color: #ACACAC;
    font-size: 14px;
}
.data{
    color:#606FA0; 
    font-size: larger; 
    font-weight: 600; 
    text-align: center;
}
.linebox,
.barbox{
    width: 100%;
    height: 350px;
    padding: 20px;
}
</style>

<template>
    <div class="linechart">
        <!-- 折线图容器 -->
        <div ref="lineContainer" class="linebox"></div>
    </div>
</template>

<script setup>
import { ElMessage } from 'element-plus';
import { ref, onMounted} from 'vue';
import axios from '@/utils/request';
import * as echarts from 'echarts';

let lineChart ;
const lineContainer = ref(null);
const userRecentCreateData = ref([]);
const dates = ref([]);//存放近七天的日期，供折线图的X轴

const getPastSevenDays = () => {
    let currentDate = new Date();
    for (let i = 0; i < 7; i++) {
        dates.value.unshift(
        `${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`
        );
        currentDate.setDate(currentDate.getDate() - 1);
    }
};

//获取用户近7天评论数据
async function getSevenCommentData() {
  try {
    const response = await axios.get(`/articledata/comment`)
    if(response.data.code === 1){
        userRecentCreateData.value = response.data.data;
        // ElMessage.success('获取用户近7天评论数据成功');
    }else if(response.data.code === 0 && response.data.msg){
        ElMessage.error(response.data.msg.toString());
    }else{
        console.error("获取用户近7天评论数据失败");
        ElMessage.error("获取用户近7天评论数据失败");
    }
  } catch (error) {
    console.error("获取用户近7天评论数据失败", error); 
    ElMessage.error("获取用户近7天评论数据失败");
  }
}



onMounted(async () => {
    getPastSevenDays();
    await getSevenCommentData();

    // 折线图配置
    const lineOption = {
        title: {
            text: '近7天评论数'
        },
        tooltip: {},
        grid:{
            height: "70%"
        },
        xAxis: {
            type: 'category',
            data: dates.value,
        },
        yAxis: {
            type: 'value',
            splitNumber: 4
        },
        series: [{
            data: userRecentCreateData.value,
            type: 'line',
            smooth: true,
            barWidth: 60
        }]
    };

    // 初始化图表
    lineChart = echarts.init(lineContainer.value);
    lineChart.setOption(lineOption);
});




</script>

<style scoped>
.linechart{
    border: 1px solid #eaeaea;
    box-shadow: 0px 0px 20px 0px rgba(96, 111, 160, 0.25), 0px 4px 4px 0px rgb(0 0 0 / 21%);
    border-radius: 20px;
    padding: 20px 30px;
}
.linebox{
    width: 100%;
    height: 300px;
}
</style>

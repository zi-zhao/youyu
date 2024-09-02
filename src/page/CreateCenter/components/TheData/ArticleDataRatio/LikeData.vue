<template>
    <div ref="barContainer" class="barbox"></div>
</template>

<script setup>
import { ElMessage } from 'element-plus';
import { ref, onMounted,computed} from 'vue';
import axios from '@/utils/request';
import * as echarts from 'echarts';

let barChart;
const userCreateData = ref([]);
const userCreateDataRatio = ref([]);
const barContainer = ref(null)
const num = ref(0)//记录稿件占比数据userCreateDataRatio中数组的个数

const manuData = computed(() => [
    { id: 0, name: '阅读量', data: userCreateData.value.articleRead },
    { id: 1, name: '投币数', data: userCreateData.value.articleReward},
    { id: 2, name: '转发数', data: userCreateData.value.articleTransmit},
    { id: 3, name: '收藏数', data: userCreateData.value.articleFavorite},
    { id: 4, name: '评论数', data: userCreateData.value.articleComment},
    { id: 5, name: '点赞数', data: userCreateData.value.articleLike},
]);

//判断返回的占比数据到底有没有4条，如果有4条，判断是否用户所有稿件刚好等于4，没有“其他”
const checkUserCreateDataRatio = (userCreateDataRatio,type) => {
    if (userCreateDataRatio.length === 4) {
        let sum = 0;
        for (let i = 0; i < 4; i++) {
            sum +=  Number(userCreateDataRatio[i].count);
        }
        if(sum === manuData.value[type].data) return 4;//这里不取0或1是因为有可能和底下的返回值重复,并且返回5刚好可以做到无论什么情况返回的都是userCreateDataRatio中数组的个数
        else return 5;
    } else {
        return userCreateDataRatio.length;
    }
}


//获取用户稿件数据
async function getCreatedata() {
  try {
    const response = await axios.get('/articledata')
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

//获取用户稿件占比数据
async function getCreatedataRatio(type) {
  try {
    const response = await axios.get(`/articledata/${type}`);
    if(response.data.code === 1){
        userCreateDataRatio.value = response.data.data;
        num.value = checkUserCreateDataRatio(userCreateDataRatio.value,type);
        const numData = ref(0);
        if(num.value === 5){
            for(let record of userCreateDataRatio.value ){
                numData.value +=  Number(record.count); 
                record.count = (Number(record.count) / Number(manuData.value[type].data)) * 100;
            }
            const tempData =(1-(numData.value / Number(manuData.value[type].data)))* 100;
            const newRecord = {
                title:"其他",
                count:tempData,
            }
            userCreateDataRatio.value.push(newRecord);
            numData.value = 0;
        }else{
            for(let record of userCreateDataRatio.value ){
                record.count =  (Number(record.count) /  Number(manuData.value[type].data))* 100;
            }
        }
        if (Array.isArray(userCreateDataRatio.value)) {
            userCreateDataRatio.value = userCreateDataRatio.value.map(item => {
                return {
                    ...item,
                    count: parseFloat(item.count.toFixed(2))
                };
            });
        }
        // ElMessage.success('获取用户稿件占比数据成功');
    }else if(response.data.code === 0 && response.data.msg){
        ElMessage.error(response.data.msg.toString());
    }else{
        console.error("获取用户稿件占比数据失败");
        ElMessage.error("获取用户稿件占比数据失败");
    }
  } catch (error) {
    console.error("获取用户稿件占比数据失败", error); 
    ElMessage.error("获取用户稿件占比数据失败");
  }
}



onMounted(async () => {
    getCreatedata();
    await getCreatedataRatio(5);

    //将柱状图最大值设为深色
    let dataValues = [];
    let dataLabels = [];

    if (userCreateDataRatio.value) {
        for (let i = 0; i < num.value && i < userCreateDataRatio.value.length; i++) {
            dataValues.push(userCreateDataRatio.value[i].count);
            dataLabels.push(userCreateDataRatio.value[i].title);
        }
    } else {
        console.log("未知的错误,num的值不是数量");
        ElMessage.error('未知的错误,num的值不是数量');
    }

    let maxVal = Math.max(...dataValues);
    let seriesData = dataValues.map((value, index) => {
        let color = value === maxVal ? '#606fa0' : '#bdc2e3';
        return {
            value: value,
            itemStyle: {
                color: color,
                borderRadius: [10, 10, 10, 10]
            },
            name: dataLabels[index]
        };
    }).sort((a, b) => b.value - a.value); 

    //柱状图配置
    const barOption = {
        title: {
            text: '数据来源稿件占比',
            left: 'left',
            textStyle: {
                fontSize: 18,
                fontWeight: 'bold'
            }
        },
        grid: {
            containLabel: true,
            bottom: "10%"
        },
        xAxis: {
            max: 100,
            splitNumber: 1,
            axisLine: {
                show: false
            },
            axisTick: {
                show: false
            },
            axisLabel: {
                show: false
            },
            splitLine: {
                show: false
            }
        },
        yAxis: {
            type: 'category',
            data: seriesData.map(item => item.name).reverse(),
            axisTick: {
                show: false
            },
            axisLine: {
                show: false
            }
        },
        series: [{
            name: '数据来源占比',
            type: 'bar',
            data: seriesData.reverse(),
            label: {
                show: true,
                position: 'right',
                formatter: '{c}%'
            },
            barWidth: 10
        }]
    };

    // 初始化图表
    barChart = echarts.init(barContainer.value);
    barChart.setOption(barOption);
});




</script>

<style scoped>
.barbox{
    width: 370px;
    height: 260px;
}
</style>

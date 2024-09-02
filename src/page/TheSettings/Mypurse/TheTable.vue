<template>
    <div class="record">
      <el-table :data="userCoinData" style="width: 100%">
      <el-table-column prop="createTime" label="日期" width="160" />
      <el-table-column prop="currencyChange" label="变化量" width="100" />
      <el-table-column prop="reason" label="变化原因" width="500"/>
    </el-table>
    </div>
</template>

<script setup>
import {ref,onMounted,defineProps,watchEffect } from "vue";
import { ElMessage } from 'element-plus';
import axios from '@/utils/request';
import { convertDateFormat } from '@/utils/timeFormat'; 

const props = defineProps({
  selectdType: Number,
});

const userId = ref('');
const userCoinData = ref([]);


watchEffect(() => {
  switch(props.selectdType) {
    case '0':
      getUserPointChangeList();
      break;
    case '1':
      getUserCoinChangeList();
      break;
    case '2':
      getUserEnergyChangeList();
      break;
    case '3':
      getUserExchange();
      break;
    default:
      ElMessage.error('传参错误！')
  }
});
//获取用户鱼饵数据变化列表
async function getUserPointChangeList() {
  try{
    const response = await axios.get(`/currency/point/page`, {
        params: {
            id:userId.value,
            page:1,
            pazeSize:100
        }
    });
    if(response.data.code === 1){
      userCoinData.value = response.data.data.records;
      for(let record of userCoinData.value){
        record.createTime = convertDateFormat(record.createTime);
      }
      // ElMessage.success('获取用户鱼饵数据变化列表成功');
    }else if(response.data.code === 0 && response.data.msg){
        ElMessage.error(response.data.msg.toString());
    }else{
      console.error("获取用户鱼饵数据变化列表失败");
      ElMessage.error('获取用户鱼饵数据变化列表失败');
    }
  } catch (error) {
    console.error("获取用户鱼饵数据变化列表失败", error); 
    ElMessage.error('获取用户鱼饵数据变化列表失败');
  }
}

//获取用户渔币数据变化列表
async function getUserCoinChangeList() {
  try{
    const response = await axios.get(`/currency/coin/page`, {
        params: {
            id:userId.value,
            page:1,
            pazeSize:100
        }
    });
    if(response.data.code === 1){
      userCoinData.value = response.data.data.records;
      for(let record of userCoinData.value){
        record.createTime = convertDateFormat(record.createTime);
      }
      // ElMessage.success('获取用户渔币数据变化列表成功');
    }else if(response.data.code === 0 && response.data.msg){
        ElMessage.error(response.data.msg.toString());
    }else{
      console.error("获取用户渔币数据变化列表失败");
      ElMessage.error('获取用户渔币数据变化列表失败');
    }
  } catch (error) {
    console.error("获取用户渔币数据变化列表失败", error); 
    ElMessage.error('获取用户渔币数据变化列表失败');
  }
}

//获取用户能量数据变化列表
async function getUserEnergyChangeList() {
  try{
    const response = await axios.get(`/currency/energy/page`, {
        params: {
            id:userId.value,
            page:1,
            pazeSize:100
        }
    });
    if(response.data.code === 1){
      userCoinData.value = response.data.data.records;
      for(let record of userCoinData.value){
        record.createTime = convertDateFormat(record.createTime);
      }
      // ElMessage.success('获取用户能量数据变化列表成功');
    }else if(response.data.code === 0 && response.data.msg){
        ElMessage.error(response.data.msg.toString());
    }else{
      console.error("获取用户能量数据变化列表失败");
      ElMessage.error('获取用户能量数据变化列表失败');
    }
  } catch (error) {
    console.error("获取用户能量数据变化列表失败", error); 
    ElMessage.error('获取用户能量数据变化列表失败');
  }
}



//获取用户渔币兑换鱼饵变化列表
async function getUserExchange() {
  try{
    const response = await axios.get(`/currency/exchange`, {
        params: {
            page:1,
            pazeSize:100
        }
    });
    if(response.data.code === 1){
      userCoinData.value = response.data.data.records;
      for(let record of userCoinData.value){
        record.createTime = convertDateFormat(record.createTime);
        record.currencyChange = (record.exchangeCount)*10;
        record.reason = '使用渔币兑换鱼饵'
      }
      // ElMessage.success('获取用户渔币数据变化列表成功');
    }else if(response.data.code === 0 && response.data.msg){
        ElMessage.error(response.data.msg.toString());
    }else{
      console.error("获取用户渔币数据变化列表失败");
      ElMessage.error('获取用户渔币数据变化列表失败');
    }
  } catch (error) {
    console.error("获取用户渔币数据变化列表失败", error); 
    ElMessage.error('获取用户渔币数据变化列表失败');
  }
}



onMounted(() => {
    userId.value = localStorage.getItem("userId"); // 获取用户ID
  })


</script>

<style scoped>

.record {
  margin: 16px 0px;
  border-radius: 12px;
}
:deep .el-table .cell{
  text-align: center;
}
::v-deep .el-table-v2__header-cell{
  justify-content: center;
  background-color: #FAFAFA;
  border-top: 1px solid #EBEBEB;
  border-left: 1px solid #EBEBEB;
}
::v-deep .el-table-v2__header-cell:first-child {
    border-radius: 12px 0px 0px 0px;
}
::v-deep .el-table-v2__header-cell:last-child {
    border-right: 1px solid #EBEBEB;
    border-radius: 0px 12px 0px 0px;
}
::v-deep .el-table-v2__header-cell-text {
    color: #5B5B5B;
}
</style>
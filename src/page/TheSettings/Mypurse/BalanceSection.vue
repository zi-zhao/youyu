<template>
  <div class="T_M" style="display: flex;flex-direction: column;">
    <TitleSection :message=msg :show-btn=false />
    <div class="page3" >
      <div class="balance">
        <div class="title-b">余额总览</div>
        <div class="outside">
          <div class="item-box" v-for="(item,index) in content" :key="index">
            <div class="title-line">
              <div class="item-title">{{item.title}}</div>
            </div>
            <div class="count-line">{{item.count}}</div>
          </div>
        </div>
      </div>

      <div class="bottom-table">
        <div class="title-b">交易记录</div>
        <el-menu mode="horizontal" @select="handleMenuSelect" class="menu">
          <div style="display: flex;">
            <el-menu-item index="bait">鱼饵</el-menu-item>
            <el-menu-item index="coins">渔币</el-menu-item>
            <el-menu-item index="energy">能量</el-menu-item>
          </div>

          <el-select v-model="selectedOption" placeholder="全部" @change="handleSelectChange">
            <el-option label="全部" value="all"></el-option>
            <el-option label="消费记录" value="consumption"></el-option>
            <el-option label="充值记录" value="recharge"></el-option>
          </el-select>
        </el-menu>
        <TheTable :selectdType=selectdType></TheTable>
      </div>

    </div>
  </div>
  
</template>

<script setup>

import TitleSection from "@/page/TheSettings/components/TitleSection.vue";
import TheTable from './TheTable.vue'
import {ref,onMounted} from "vue";
import { ElMessage } from 'element-plus';
import axios from '@/utils/request';


const msg = '我的余额'
const userId = ref()
const userCurrencyData = ref('')
const content = ref([
  { title: '鱼饵数', msg: '去兑换', count:''},
  { title: '渔币数', msg: '去充值', count:'' },
  { title: '能量值', msg: '去提现', count:'' },
]);

const selectedOption = ref('all');
const selectdType = ref('0');

const handleMenuSelect = (index) => {
  switch (index) {
    case 'bait':
      selectdType.value = '0';
      break;
    case 'coins':
      selectdType.value = '1';
      break;
    case 'energy':
      selectdType.value = '2';
      break;
  }
};

// 处理选择框变化事件
const handleSelectChange = (value) => {
  console.log('选择框的值：', value);
};



//获取用户货币数据列表
async function getUserCurrency() {
  try{
    const response = await axios.get(`/currency`);
    if(response.data.code === 1){
        userCurrencyData.value = response.data.data;
        content.value[0].count = userCurrencyData.value.point;
        content.value[1].count = userCurrencyData.value.coin;
        content.value[2].count = userCurrencyData.value.energy;
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
    userId.value = localStorage.getItem("userId"); // 获取用户ID
    getUserCurrency();
})

</script>

<style scoped>
.page3{
  padding: 15px 30px 30px;
  background-color: #FAFAFA;
  overflow: auto;
  min-height: 82%;
}

.balance{
  width: 88%;
  margin: 0px auto 15px;
  background-color: #fff;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  padding: 15px 30px;
}

.outside{
  display: flex;
  justify-content: space-between;
}

.title-b{
  padding-bottom: 1rem;
  font-weight: 700;
  margin-left: -15px;
}

.title-line{
  display: flex;
  align-items: center;
  gap: 10px;
  padding-bottom: 8px;
}

.item-box{
  padding: 16px;
  width: 175px;
  height: 65px;
  background-color: #F5F7FF;
}

.item-title{
  color:#ACACAC;
  font-size: 14px;
  font-weight: 400;
}
.count-line{
  color: #606FA0;
  font-size: 20px;
  font-weight: 700;
}
.bottom-table{
  width: 88%;
  background-color: #fff;
  border-radius: 8px;
  padding: 15px 30px;
  margin: 0px auto;
  min-height: 61%;
}
.menu{
  display: flex;
  align-items: center;
  justify-content: space-between;
}
::v-deep .el-menu-item{
  color: #7D7D7D;
  font-weight: 700;
  border-radius: 6px;
  height: 32px;
}

::v-deep .el-menu{
  border: none;
  text-decoration: none;
}

/* ::v-deep .el-menu-item:hover{
  color: #7D7D7D !important;
  background-color: #fff;

} */
/* ::v-deep .el-menu-item:hover  i {
    color: #757575;
  } */
/* ::v-deep .el-menu-item.is-active {
  color: #606FA0;;
  border-bottom: 1px solid #606FA0;;
  border: none;
  background-color: #fff;

} */
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
    box-shadow: inset 0 0 8px rgba(115, 115, 115, 0.3); /* 添加淡灰色内阴影 */
    background-color: #dbdbdb; /* 滑块的颜色改为浅灰色 */
    border-radius: 10px; /* 保持圆角不变 */
}
/* 当鼠标悬停在滚动条滑块上时改变滑块的颜色 */
::-webkit-scrollbar-thumb:hover {
    background: #c6c6c6;
}
</style>
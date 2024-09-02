<template>
  <div class="T_M" style="display: flex;flex-direction: column;">
    <TitleSection :message=msg :show-btn="false" />
    <div class="page4">
      <div class="header">
        <div class="imgBx">
          <img :src=userAvatar>
          <div class="name">{{username}}</div>
        </div>

        <div class="account">
          <div style="color:#757575;font-weight: 400 ">账户余额</div>
          <div class="balance">{{userCurrencyData.coin}}<span class="unit">渔币</span></div>
        </div>

        <div class="box">
          <el-input v-model=count placeholder="自定义渔币数量" class="input">{{count}}</el-input>
          <YyButton theme="purple" style="margin:0">确认</YyButton>
        </div>
      </div>


      <div class="center">
        <div class="item" v-for="(item,index) in price1" :key="index" tabindex="0">
          <div class="num"><span class="num-text">{{item.num}}</span><span >渔币</span></div>
          <div class="price"><span>￥</span>{{item.price}}</div>
        </div>
      </div>

      <div class="center">
        <div class="item" v-for="(item,index) in price2" :key="index" tabindex="0">
          <div  class="num"><span class="num-text">{{item.num}}</span><span>渔币</span></div>
          <div class="price"><span>￥</span>{{item.price}}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {ref,onMounted} from 'vue'
import TitleSection from "@/page/TheSettings/components/TitleSection.vue";
import { ElMessage } from 'element-plus';
import axios from '@/utils/request'
import { getUsersAvatarFromCOS } from '@/utils/cosService';
import YyButton from "@/page/components/YyButton.vue";

const msg = '渔币充值'

const userId = ref()
const username = ref()
const userAvatar = ref()
const userData = ref()
const userCurrencyData = ref('');

const count = ref()//输入框中自定义的金额
const price1 = ref([
    {num:1,price:'6.00'},
    {num:18,price:'18.00'},
    {num:30,price:'30.00'},
    {num:68,price:'68.00'},
])

const price2 = ref([
  {num:118,price:'118.00'},
  {num:198,price:'198.00'},
  {num:348,price:'348.00'},
  {num:648,price:'648.00'},
])

//获取用户货币数据列表
async function getUserCurrency() {
  try{
    const response = await axios.get(`/currency`);
    if(response.data.code === 1){
        userCurrencyData.value = response.data.data;
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
   // const response = await axios.get(`/users/${userId.value}?apifoxApiId=100741633`);
    const response = await axios.get(`/users/${userId.value}`);
    if(response.data.code === 1){
        userData.value = response.data.data;
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

  // 获取用户头像
  const fetchAvatar = async () => {
    try {
      userAvatar.value = await getUsersAvatarFromCOS(userId.value);
    } catch (error) {
        console.error("Error fetching user avatar:", error);
        ElMessage.error('获取用户头像失败')
    }
  };


onMounted(() => {
    userId.value = localStorage.getItem("userId"); // 获取用户ID
    username.value = localStorage.getItem("userName"); // 获取用户ID
    fetchAvatar();
    getUserInform();
    getUserCurrency();
})



</script>

<style scoped>
.page4{
  padding: 30px 30px 15px;
  background-color: #FAFAFA;
  overflow: auto;
  min-height: 83%;
}
img{
  width: 60px;
  height: 60px;
}

.header{
  display: flex;
  justify-content: space-between;
}

.imgBx{
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 4px;
  flex: 10%;
}

.account{
  flex: 10%;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.balance{
  color: #606FA0;
  font-size: 32px;
  font-weight: 700;
}

.unit{
  color: #8290C0;
  font-weight: 400;
  font-size:16px;
  display: inline-block;
  padding-left: 6px;
}

.box{
  flex: 30%;
  display: flex;
  align-items: center;
  position: relative;
  gap: 50px;
}

::v-deep .el-input{
  width: 230px;
  height: 70px;
}

.center{
  padding: 8px 32px;
  display: flex;
  justify-content: space-around;
}
.item{
  display: flex;
  width: 100%;
  flex-direction: column;
  gap: 1rem;
  margin: 20px 20px 8px 20px;
  border: 1px solid #E3E3E3;
  border-radius: 8px;
  overflow: hidden;
}
.item:hover,
.item:focus{
  cursor: pointer;
  border: 1px solid #6E7DAF;
  color: #6E7DAF;
}
.num{
  display: flex;
  justify-content: center;
  align-items: flex-end;
  padding: 32px 0px 5px;
}
.num-text{
  font-size: 24px;
  margin: 0px 8px -3px;
}
.num span{
  line-height: 1.6;
}
.price{
  display: flex;
  justify-content: center;
  width: 100%;
  padding: 8px 0px;
  background-color: #EAEAF3;
}
</style>
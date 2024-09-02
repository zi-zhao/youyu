<template>
  <div class="T_M" style="display: flex;flex-direction: column;">
    <TitleSection :message=msg :show-btn="false" />
    <div class="page">
        <div class="content">
          <div class="imgBx">
            <img :src=userAvatar>
            <div class="name">{{username}}</div>
          </div>

          <div class="yubi">
            <div class="text-grey">可兑换渔币数</div>
            <div class="num">{{ userCoinData.coin }}<span class="unit">渔币</span></div>
          </div>

          <div class="yuer">
            <div class="text-grey">当前鱼饵值</div>
            <div class="num">{{ userCoinData.point }}<span class="unit">鱼饵</span></div>
          </div>

          <div class="tip">1渔币=10鱼饵</div>
        </div>

        <div class="exchange">
          <div class="input">
            <el-input v-model="coinCount" placeholder="请输入兑换渔币数"></el-input>
            个渔币 = <span class="num-ex">{{ num }}</span>个鱼饵
          </div>
          <YyButton theme="purple" @click="exchangeCurrency" style="margin: 0;">兑换</YyButton>
        </div>
        <div style="display: flex;align-items: center;justify-content: flex-end;margin-bottom: 2rem;margin-right: 4rem;">
            <div class="read-text">请注意：点击兑换代表您已阅读并同意</div>
            <span class="agreement" @click="goToCurrencyAgreement">《{{ agreementName }}》</span>
        </div>
        <!-- <div class="record-title">
          <div class="header">
            <span class="text-grey">兑换记录</span>
            <el-date-picker
                v-model="startDate"
                placeholder="开始时间"
            ></el-date-picker>
            <span class="text-grey">至</span>
            <el-date-picker
                v-model="endDate"
                placeholder="结束时间"
            ></el-date-picker>
            <ButtonSection :msg=msgbtn2 style="position: absolute;top: 30px;right: -260px"/>
          </div>
        </div> -->
          <div class="bottom-table">
            <div class="title-b">兑换记录</div>
            <div v-if="dialogVisible">
              <TheTable selectdType=3></TheTable>
            </div>
          </div>
      </div>
  </div>
</template>

<script setup>
import {computed, ref,onMounted} from 'vue'
import TitleSection from "@/page/TheSettings/components/TitleSection.vue";
import { ElMessage } from 'element-plus';
import { getUsersAvatarFromCOS } from '@/utils/cosService';
import TheTable from './TheTable.vue';
import axios from '@/utils/request';
import YyButton from "@/page/components/YyButton.vue";
import { useRouter } from 'vue-router';
import { openUrl } from '@/utils/routeJudge'

const router = useRouter()

const agreementName = ref('有渔货币协议')

const msg = '鱼饵兑换'
// const msgbtn2 = '查询' 
const userId = ref();
const username = ref();
const userAvatar = ref('');
const userCoinData = ref('');
const dialogVisible = ref(true);
const coinCount = ref(null);
const num = computed(() => coinCount.value * 10)
if (coinCount.value === null) {
  num.value = 0
}



// const startDate = ref()
// const endDate = ref()

//一定要严格遵循顺序
const exchangeCurrency = async () => {
  await exchangeUserCurrency();
  await getUserCurrency();
}
//获取用户货币数据列表
async function getUserCurrency() {
  try{
    const response = await axios.get(`/currency`);
    if(response.data.code === 1){
      userCoinData.value = response.data.data;
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

async function exchangeUserCurrency() {
  try{
    const response = await axios.post(`/currency/coin2point/${coinCount.value}`);
    if(response.data.code === 1){
      dialogVisible.value = false;
      ElMessage.success('兑换鱼饵成功');
      setTimeout(() => {
        dialogVisible.value = true;
      }, 400); // 1秒后重新渲染子组件
    }else if(response.data.code === 0 && response.data.msg){
        ElMessage.error(response.data.msg.toString());
    }else{
      console.error("兑换鱼饵失败");
      ElMessage.error('兑换鱼饵失败');
    }
  } catch (error) {
    console.error("兑换鱼饵失败", error); 
    ElMessage.error('兑换鱼饵失败');
  }
}

// 跳转至货币协议
const goToCurrencyAgreement = () =>{
    // const routeLocation = router.resolve({ path: `/CurrencyAgreement` });
    // window.open(routeLocation.href, '_blank');
    openUrl(`/CurrencyAgreement`)
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
    getUserCurrency();
})



</script>

<style scoped>
.page{
  padding: 15px 30px 0px 30px;
  background-color: #FAFAFA;
  overflow: auto;
  height: 90%;
}
.imgBx {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  justify-content: center;
}

::v-deep .el-input {
  width: 230px;
  height: 40px;
  margin-right: 1rem;
}

.input {
  font-size: 24px;
}

.content {
  width: 88%;
  background-color: #fff;
  margin: 0 auto 15px;
  border-radius: 8px;
  display: flex;
  justify-content: space-around;
  padding: 15px 30px;
  align-items: flex-end;
}

.yubi, .yuer {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: space-between;
  border: 1px solid #E3E3E3;
  border-radius: 4px;
  padding: 8px 30px;
  gap: 2rem;
}

.text-grey {
  color: #757575;
}
.read-text{
    font-size: 0.6rem;
}
.agreement{
    font-size: 0.6rem;
    padding: 0 0.1rem;
    color: #00A6DA;
    border-bottom: 1px solid #00A6DA;
    cursor: pointer;
}
.num, .num-ex {
  color: #606FA0;
  font-size: 32px;
  font-weight: 700;
}

.num-ex {
  padding: 0 1rem;
}

.unit {
  font-size: 16px;
  font-weight: 400;
  padding-left: 4px;
}

img {
  width: 60px;
  height: 60px;
}

.tip {
  color: #F6A200;;
}

.exchange {
  width: 88%;
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 20px 45px;
}
.bottom-table{
  width: 88%;
  background-color: #fff;
  border-radius: 8px;
  padding: 15px 30px;
  margin: 0px auto;
  min-height: 61%;
}
.title-b{
  padding-bottom: 1rem;
  font-weight: 700;
  margin-left: -15px;
}
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
<template>
  <div class="T_M" style="display: flex;flex-direction: column;">
    <TitleSection :message=msg :show-btn=false />
    <div class="page">
      <div class="is-consult">
        <span class="little-title">接受咨询</span>
        <div class="consult-switch">
          <el-switch v-model="switch1" inline-prompt active-text="on" inactive-text="off" class="item-switch"/>
        </div>
      </div>

      <div class="anserer-say">
        <span class="little-title">答主说</span>
        <div class="saying-input">
          <el-input
              v-model="textarea"
              maxlength="1000"
              placeholder="分享一下最近的趣事或心情吧"
              show-word-limit
              type="textarea"
              size="large"
              resize="none"
              :autosize = "{ minRows: 2, maxRows: 30 }"
              class="input_el"
          />
        </div>
      </div>

      <div class="money-set">
        <span class="little-title">问题金额设置</span>
        <div class="my-2 flex items-center text-sm" >
          <el-radio-group v-model="radio1" class="radio_share">
            <el-radio label="1">指定金额</el-radio>
            <el-radio label="2">金额区间</el-radio>
          </el-radio-group>
          <div v-if="radio1 === '1'" class="money-num">
            <input type="text" v-model="text1">
            <span class="text1" >鱼饵</span>
          </div>
          <div v-if="radio1 === '2'" class="money-num">
            <input type="text" v-model="text2">
            <span style="margin-right: 10px;" class="text1">至</span>
            <input type="text" v-model="text3">
            <span class="text1">鱼饵</span>
          </div>
        </div>
      </div>

      <div class="max-question">
        <span class="little-title">最多接受</span>
        <div>
          <input type="text" v-model="text4">
          <span class="text1">条追问</span>
        </div>
      </div>
      <div style="display:flex;margin-bottom: 2rem;">
        <YyButton theme="purple" @click="putUserInform">保存</YyButton>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref,onMounted } from 'vue';
import TitleSection from "@/page/TheSettings/components/TitleSection.vue";
import { ElMessage } from 'element-plus';
import axios from '@/utils/request';
import YyButton from "@/page/components/YyButton.vue";

const userId = localStorage.getItem("userId"); // 获取用户ID
const msg = '问答设置'
const textarea = ref('')
const text1 = ref();
const text2 =ref();
const text3 = ref();
const text4 = ref();
const switch1 = ref(true);
const radio1 = ref('')//指定金额还是金额区间
const answererInfo = ref({})//保存用户的问答设置信息

//获取答主具体信息
async function getAnswererInfo() {
  try{
    const response = await axios.get(`/answer/${userId}`)
    if(response.data.code === 1){
        answererInfo.value = response.data.data;
        if( answererInfo.value.accept == 1){
          switch1.value = true;
        }else if(answererInfo.value.accept == 0)
          switch1.value = false;
        if(answererInfo.value.priceLow === answererInfo.value.priceHigh){
          radio1.value = '1';
          text1.value =  answererInfo.value.priceLow;
        }else{
          radio1.value = '2';
          text2.value =  answererInfo.value.priceLow;
          text3.value =  answererInfo.value.priceHigh;
        }
        textarea.value = answererInfo.value.answererInfo;
        text4.value =  answererInfo.value.number;
        // ElMessage.success('获取答主具体信息成功');
    }else if(response.data.code === 0 && response.data.msg){
        ElMessage.error(response.data.msg.toString());
    }else{
        console.error("获取答主具体信息失败");
        ElMessage.error('获取答主具体信息失败');
    }
  } catch (error) {
    console.error("获取答主具体信息失败", error); 
    ElMessage.error('获取答主具体信息失败');
  }
}

//修改问答信息
async function putUserInform() {
  const acceptStatus = switch1.value ? 1 : 0;
  let payload = {};
  if (radio1.value === '1') {
    payload = {
      accept: acceptStatus,
      answererInfo: textarea.value,
      priceLow: text1.value,
      priceHigh: text1.value,
      number: text4.value,
      type:0,
    };
  }
  if (radio1.value === '2') {
    payload = {
      accept: acceptStatus,
      answererInfo: textarea.value,
      priceLow: text2.value,
      priceHigh: text3.value,
      number: text4.value,
      type:0,
    };
  }

  try {
    const response = await axios.put('/answer', payload);
    if(response.data.code === 1){
        console.log(response.data.msg); 
        ElMessage.success("修改问答信息成功");
    }else if(response.data.code === 0 && response.data.msg){
        ElMessage.error(response.data.msg.toString());
    }else{
        console.error("修改问答信息失败");
        ElMessage.error("修改问答信息失败");
    }
  } catch (error) {
    console.error("修改问答信息失败", error); 
    ElMessage.error("修改问答信息失败");
  }
}

onMounted(() => {
  getAnswererInfo();
})


</script>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  gap: 50px;
  padding: 30px 50px;
  overflow: auto;
}
.is-consult,
.max-question{
  display: flex;
  align-items: center;
  gap: 40px;
}
.anserer-say,
.money-set{
  display: flex;
  align-items: flex-start;
  gap: 40px;
}

.max-question{
  margin-top: 10px;
}
.little-title{
  display: inline-block;
  width: 100px;
  color: #7D7979;
  line-height: 1.6;
}
.saying-input{
  width: 70%;
}
::v-deep .el-radio{
  height: 21px;
}
::v-deep .el-radio__label{
    width: 100px;
}
/* 修改选中状态的颜色 */
::v-deep .el-radio__input.is-checked .el-radio__inner {
    border:none; 
    background-color: #fff; 
}
/* 修改选中状态的图标颜色，通常是一个白色的圆点 */
::v-deep .el-radio__input.is-checked .el-radio__inner::after {
    background-color: #000; 
}
/* 去除选中框的圆点 */
::v-deep .el-radio__input.is-checked .el-radio__inner::after {
    display: none;
}
/* 添加对勾图案 */
::v-deep .el-radio__input.is-checked .el-radio__inner::before {
    content: ""; 
    background-image: url('../../../assets/CheckMark.svg');
    background-size: cover;
    border: none;
    background-repeat: no-repeat;
    position: absolute;
    height: 14px;
    width: 14px;
    color: #000;  
}
/* 选中部分字体颜色 */
::v-deep .el-radio__input.is-checked + .el-radio__label {
    color: #161616;;  
    border: none;
}
.radio_share span{
  display: inline-block;
  width: 12px;
  height: 12px;
  font-size: 16px;
  text-align: center;
}
.money-num{
  display: flex;
  align-items: center;
  margin-top: 20px;
}
input{
  width: 45px;
  height: 18px;
  padding: 4px 8px;
  border-radius: 8px;
  background: #EDEDED;
  border: 1px solid #e9e9e9;
  text-align: center;
  margin-right: 10px;
}
input:focus{
  outline: none;
  box-shadow: 0 1px 7px #dbdae5;
  border: 1px solid #d7d7d7;
}
.text1{
  color: #161616;;  
}
</style>

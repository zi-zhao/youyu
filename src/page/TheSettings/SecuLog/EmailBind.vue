<template>
  <div class="container">
    <div class="email">
      <div class="title">邮箱地址</div>
      <div class="content">
        <el-input  v-model="email" placeholder="请输入邮箱"/>
        <div class="input-bx">
          <el-input  v-model="emailVerification" placeholder="请输入验证码"/>
          <YyButton theme="nobgc" class="verify"  @click="startCountdown" :disabled="!email || isRunning">{{ inner }}>获取验证码</YyButton>
        </div>
      </div>
    </div>
  </div>

  <div class="footer">
    <YyButton theme="purple"  @click="usersBindEmail">确认</YyButton>
    <YyButton theme="gray" >取消</YyButton>
  </div>
</template>

<script setup>
import YyButton from "@/page/components/YyButton.vue";
import axios from '@/utils/request';
import { ElMessage} from 'element-plus';
import { ref } from 'vue';


const email = ref();
const emailVerification = ref();
const time = ref(60);
const isRunning = ref(false);
const inner = ref('获取邮箱验证码');

// 点击发送验证码
async function startCountdown() {
  time.value = 60; // 或者其他您需要的倒计时时间
  isRunning.value = true;
  sendSMSCodeEmail();
  inner.value = `${time.value}秒后重新获取`;
  const timeId = setInterval(() => {
    time.value--;
    if (time.value === 0) {
      clearInterval(timeId);
      inner.value = '获取邮箱验证码';
      isRunning.value = false;
    } else {
      inner.value = `${time.value}秒后重新获取`;
    }
  }, 1000);
}

//获取验证码的接口
async function sendSMSCodeEmail(){
  try {
    const response = await axios.get(`/sendEmailVerification/1/${email.value}`);
    if(response.data.code === 1){
      ElMessage.success('获取验证码成功');
    }else if(response.data.code === 0 && response.data.msg){
      ElMessage.error(response.data.msg.toString());
    }else{
      console.error("获取验证码失败");
      ElMessage.error('获取验证码失败');
    }
  } catch (error) {
    console.error("获取验证码失败", error); 
    ElMessage.error('获取验证码失败');
  }
}

//绑定邮箱的接口
async function usersBindEmail(){
  try {
    const response = await axios.post('/users/bindEmail',{
      email:email.value,
      emailVerification:emailVerification.value,
    });
    if(response.data.code === 1){
      ElMessage.success('修改密码成功');
    }else if(response.data.code === 0 && response.data.msg){
      ElMessage.error(response.data.msg.toString());
    }else{
      console.error("修改密码失败");
      ElMessage.error('修改密码失败');
    }
  } catch (error) {
    console.error("修改密码失败", error); 
    ElMessage.error('修改密码失败');
  }
}
</script>

<style scoped>
.container{
  display: flex;
  flex-direction: column;
  gap: 3rem;
}

.phone{
  display: flex;
  justify-content: center;
  gap: 5rem;
}

.email{
  display: flex;
  justify-content: center;
  gap: 5rem;
}

.title{
  font-size: 16px;
  color: #7D7979;
}

.content{
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 2rem;
}

.input-bx{
  display: flex;
  height: 35px;
  gap: 2rem;
}

.footer{
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin: 5rem auto 1rem;
}

.verify{
  width: 155px;
}
</style>

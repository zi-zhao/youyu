<template>
  <div class="container">
    <div class="out">
      <div class="title">手机号</div>
      <el-input  v-model="phone" placeholder="请输入手机号"/>
    </div>
    <div class="out">
      <div class="title">身份验证</div>
      <div class="input-bx">
        <el-input  v-model="code" placeholder="请输入验证码"/>
        <YyButton theme="nobgc" class="verify" @click="startCountdown" :disabled="!phone || isRunning">{{ inner }}</YyButton>
      </div>
    </div>
    <div class="out">
      <div class="title">新密码</div>
      <div class="input-bx">
        <el-input  type="password" v-model="password" show-password placeholder="请输入新密码"/>
      </div>
    </div>
    <div class="out">
      <div class="title">确认密码</div>
      <div class="input-bx">
        <el-input type="password" v-model="passworded"  show-password  placeholder="请确认密码"/>
      </div>
    </div>
    <div class="footer">
      <YyButton theme="purple" @click="changePassword">确认</YyButton>
      <YyButton theme="gray">取消</YyButton>
    </div>
  </div>
</template>

<script setup>
import YyButton from "@/page/components/YyButton.vue";
import axios from '@/utils/request';
import { ElMessage} from 'element-plus';
import { ref } from 'vue';

const phone = ref();
const code = ref();
const password = ref();
const passworded = ref();
const time = ref(60);
const isRunning = ref(false);
const inner = ref('获取短信验证码');

const validate = () => {
  if (!/^1[3-9]\d{9}$/.test(phone.value)) {
    ElMessage.error('手机号格式不正确');
    return false;
  }
  if (!code.value) {
    ElMessage.error('请输入验证码');
    return false;
  }
  if (password.value.length < 6 || password.value.length > 15) {
    ElMessage.error('密码必须是 6-15 个字符');
    return false;
  }
  if (password.value !== passworded.value) {
    ElMessage.error('两次输入的密码不一致');
    return false;
  }
  return true;
};

// 点击发送验证码
async function startCountdown() {
  time.value = 60; // 或者其他您需要的倒计时时间
  isRunning.value = true;
  sendPasswordSMSCodePhone();
  inner.value = `${time.value}秒后重新获取`;
  const timeId = setInterval(() => {
    time.value--;
    if (time.value === 0) {
      clearInterval(timeId);
      inner.value = '获取短信验证码';
      isRunning.value = false;
    } else {
      inner.value = `${time.value}秒后重新获取`;
    }
  }, 1000);
}


//获取验证码的接口
async function sendPasswordSMSCodePhone(){
  try {
    const response = await axios.get(`/sendPasswordSMSCode/${phone.value}`);
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

//修改密码的接口
async function changePassword(){
  try {
    if (!validate()) {
      return;
    }
    const response = await axios.put('/users/changePassword',{
      password:password.value,
      code:code.value,
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
.out{
  display: flex;
  gap: 5rem;
}

.title{
  font-size: 16px;
  width: 65px;
  color: #7D7979;
}

.input-bx{
  width: 400px;
  display: flex;
  height: 35px;
  gap: 2rem;
}

.footer{
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin: 0 auto;
}

.verify{
  width: 210px;
}
</style>

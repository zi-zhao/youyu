<template>
    <div class="container">
      <div class="header">
        <h2>预约咨询商务合作</h2>
        <span>请留下您的联系方式，我们的合作顾问将为您服务</span>
      </div>
      <div class="form">
        <el-form :model="form" label-width="80px">
          <el-form-item label="姓名" prop="name">
            <el-input v-model="form.name"></el-input>
          </el-form-item>
          <el-form-item label="手机号" prop="phone">
            <el-input v-model="form.phone"></el-input>
          </el-form-item>
          <el-form-item label="验证码" prop="code">
            <el-input v-model="form.code"></el-input>
            <el-button type="text" @click="sendCode">发送验证码</el-button>
          </el-form-item>
          <el-form-item label="公司名称" prop="company">
            <el-input v-model="form.company"></el-input>
          </el-form-item>
          <el-form-item label="行业" prop="industry">
            <el-input v-model="form.industry"></el-input>
          </el-form-item>
        </el-form>
        <YyButton class="btn" theme="primary-faint" text="预约咨询"></YyButton>
      </div>

      </div>
</template>

<script setup>
import { ref } from 'vue';
import YyButton from "@/page/components/YyButton.vue";
import axios from '@/utils/request';

const form = ref({
  name: '',
  phone: '',
  code: '',
  company: '',
  industry: ''
})

//发送验证码
async function sendCode() {
  try {
    const response = await axios.get(`/sendPhoneVerification/${form.value.phone}`, {
      params: { phoneNumber: form.value.phoneNumber }
    });
    console.log(response.data);
  } catch (error) {
    console.error(error);
  }
}


</script>

<style lang="scss" scoped>
.container{
  width: 100%;
  height: 100%;
  gap: 1rem;
  .header{
    padding-left: 5rem;
  }
  .form{
    margin-top: 1rem;
    display: flex;
    justify-content: center;
    flex-direction: column;
    align-items: center;
  }
  .btn{
    background-color: #9FA9CA;
    color: #FFFFFF;
    padding: 0.6rem 1.5rem;
    border: none;
  }
}
</style>
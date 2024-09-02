<template>
    <div class="form">
        <el-form
        ref="myForm"
        :label-position="labelPosition"
        label-width="100px"
        :model="formLabelAlign"
        :rules="rules"
        @submit.prevent="fetchLoad"
        :class="{ 'form-touched': formTouched.valueOf }"
      >
        <el-form-item label="手机号" prop="phoneNumber">
          <el-input v-model="formLabelAlign.phoneNumber" @input="checkPhoneNumber" @change="checkAllFields" />
        </el-form-item>
        <!-- <el-form-item label="邮箱" prop="email">
          <el-input v-model="formLabelAlign.email" @change="checkAllFields" />
        </el-form-item> -->
        <el-form-item label="验证码" prop="phoneVerification" class="send-identifycode">
          <el-input class="two" v-model="formLabelAlign.phoneVerification" @change="checkAllFields" />
          <button class="send-pc" @click="send" :disabled=" !phoneNumberValid ||isRunning">{{ inner }}</button>
          <div class="send-phone" @click="send" :disabled=" !phoneNumberValid ||isRunning">点击获取验证码</div>
        </el-form-item>
      </el-form>
    </div>
    <div class="center-button">
      <el-button type="primary" round style="height: 45px;width: 141px;" @click="fetchLoad" v-model="isRunning">登录</el-button>
      <!-- 注意这里要加一个点击事件，点击关闭登录弹框，打开注册弹框 -->
      <!-- <div class="noaccount">没有账号?<span style="color: #00A6DA;">去注册</span></div> -->
    </div>
</template>

<script setup>
import {ref,reactive} from 'vue'
import axios from '@/utils/request'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex';
import { ElMessage } from 'element-plus';

const myForm = ref(null);
const router = useRouter();
const labelPosition = ref('top');
let isRunning = ref(false);// 判断发送验证码事件
let allFieldsValid = ref(false);//所有表单是否符合规则
let phoneNumberValid = ref(false);//手机号是否符合规则
let formTouched = ref(false);//用户是否输入内容
const store = useStore();
let formLabelAlign = reactive({
  phoneNumber: '',
  phoneVerification: '',
  // email:'',
  // emailVerification:'',
});  // 收集表单数据
let inner = ref('获取短信验证码');// 设置发送验证码按钮内容

// 设置表单校验规则
const rules = reactive({
  // email: [
  //   { required: true, message: '请输入邮箱', trigger: 'blur' },
  //   { pattern: /^[A-Za-z0-9_.-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$/, message: '邮箱格式不正确', trigger: 'blur' }
  // ],
  // emailVerification:[
  //   {required: true, message: '请输入验证码', trigger: 'blur'}
  // ],
  phoneNumber:[
    {required: true, message: '请输入手机号', trigger: 'blur'},
    {
      validator: ( rules ,value, callback) => {
        if (/^1[3-9]\d{9}$/.test(value)) {
          phoneNumberValid.value = true;
          callback();
        } else {
          phoneNumberValid.value = false;
          callback(new Error('手机号格式不正确'));
        }
      },
      trigger: 'blur'
    }   
  ]
})

// 手机号验证函数
function checkPhoneNumber() {
  const phoneNumberPattern = /^1[3-9]\d{9}$/;
  phoneNumberValid.value = phoneNumberPattern.test(formLabelAlign.phoneNumber);
  checkAllFields();
}
 
//验证输入框是否符合规则
async function checkAllFields() {
  formTouched.value = true;
  myForm.value.validate(valid => {
    allFieldsValid.value = valid;
  });
}

// 点击发送验证码
async function send(){
  if(!isRunning.value){
    isRunning.value = true
    fetchData()
    let time = ref(60);
    let timeId = setInterval(function(){
      time.value--;
      inner.value = time.value+'后重新获取';
      if(time.value===0){
        clearInterval(timeId);
        inner.value = '获取短信验证码';
        isRunning.value = false;
      }
    },1000)
  }
}

// 发送手机获取验证码请求
async function fetchData() {
  try {
    const response = await axios.get(`/sendLoginSMSCode/${formLabelAlign.phoneNumber}`);
    // const response = await axios.get(`/sendEmailVerification/0/${formLabelAlign.email}`);
    if (response.data.code === 1) {
      ElMessage.success('手机验证码发送成功');
    } else if(response.data.code === 0 && response.data.msg){
      ElMessage.error(response.data.msg.toString());
    }else {
      console.log('手机验证码发送失败');
      ElMessage.error('手机验证码发送失败');
    }
  } catch (error) {
    console.error(error);
    ElMessage.error('手机验证码发送失败');
  }
}

// 发送验证码登录信息数据请求
async function fetchLoad() {
  myForm.value.validate((valid) => {
  if (valid) {
    axios.post('/users/loginByVerification',formLabelAlign)
    .then(response => {
      if (response.data.code === 1 ) { 
        if(response.headers["authorization"]){
          localStorage.setItem('token',response.headers["authorization"])
          localStorage.setItem('userId',response.data.data.id)
          localStorage.setItem('userName',response.data.data.username)
          ElMessage.success('登录成功');
          store.commit('DOWNLOAD', false)// 关闭登录dialog 
          // router.push('/VideoMain');
          router.push('/DefaultPresentation');
        }else{
          ElMessage.error('登录失败'); 
        }              
      } else if(response.data.code === 0 && response.data.msg){
        ElMessage.error(response.data.msg.toString());
      }else {
        console.log(response.data);
        ElMessage.error('登录失败'); 
      }
    })
    .catch(error => {
      console.error(error);
    });
  }
  else {
      console.log('error submit!!');
      return false;
    }
  })
}

// 发送邮箱验证码登录信息数据请求
// async function fetchLoad() {
//   myForm.value.validate((valid) => {
//   if (valid) {
//     axios.post('/users/loginByEmailVerification',formLabelAlign)
//     .then(response => {
//       if (response.data.code === 1 ) { 
//         if(response.headers["authorization"]){
//           localStorage.setItem('token',response.headers["authorization"]);
//           localStorage.setItem('userId',response.data.data.id);
//           localStorage.setItem('userName',response.data.data.username);
//           ElMessage.success('登录成功');
//           store.commit('DOWNLOAD', false);// 关闭登录dialog 
//           router.push('/TheMain');
//         }else{
//           ElMessage.error('登录失败'); 
//         }              
//       } else if(response.data.code === 0 && response.data.msg){
//         ElMessage.error(response.data.msg.toString());
//       }else {
//         console.log(response.data);
//         ElMessage.error('登录失败'); 
//       }
//     })
//     .catch(error => {
//       console.error(error);
//     });
//   }
//   else {
//       console.log('error submit!!');
//       return false;
//     }
//   })
// }

</script>

<style scoped>
.form{
	width: 100%;
  margin: 3rem auto;
}

.center-button{
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 40px;
  position: relative;
}
.send-pc{
  display: inline-block;
	width: 137px;
	height: 40px;
	background-color: #d5e3f2;
	box-shadow: 0px 4px 4px 0px 
		#b8cdf8;
	border-radius: 4px;
	border: solid 1px #d9d9d9;
  margin-left: 20px;
  cursor: pointer;
}
.send-phone{
  display: none;
}
:deep .send-identifycode .el-form-item__content{
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 1rem;
}
:deep .el-form-item__error {
  top: 45px;
}
.noaccount{
  position: absolute;
  right: 5%;
  font-size: 0.8rem;
  cursor: pointer;
  letter-spacing: 1px;
}
@media (max-width: 768px) {
  .form {
    width: 90%;
    margin: 4rem auto;
  }
  .form .el-form-item {
    margin-bottom: 2rem;
  }
  .center-button{
    margin-right: 0;
  }
  .send-pc{
    display: none;
  }
  .send-phone{
    display: flex;
    color:  #2b6ae8;
    line-height: 1.6;
    font-size: 0.8rem;
    cursor: pointer;
    height: 40px;
  }
}
</style>
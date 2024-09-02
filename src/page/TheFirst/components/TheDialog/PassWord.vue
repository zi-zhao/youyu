<template>
    <div class="form">
        <el-form
         ref="myForm"
        :label-position="labelPosition"
        label-width="100px"
        :model="formLabelAlign"
        :rules="rules"
        @submit.prevent="loadOn"
      >
          <el-form-item label="手机号" prop="data">
            <el-input v-model="formLabelAlign.data" @change="checkAllFields" />
          </el-form-item>
          <el-form-item label="密码" prop="password" class="password-box">
            <el-input v-model="formLabelAlign.password" show-password @change="checkAllFields" />
            <!-- <div class="forget-phone">忘记密码？</div> -->
          </el-form-item>
        </el-form>
    </div>
    
    <div class="center-button">
      <el-button type="primary" round style="height: 45px;width: 141px;" @keyup.enter="loadOn" @click="loadOn" >登录</el-button>
      <!-- 注意这里要加一个点击事件，点击关闭登录弹框，打开注册弹框 -->
      <!-- <div class="noaccount">没有账号?<span style="color: #00A6DA;">去注册</span></div> -->
    </div>
</template>

<script setup>
import { useStore } from 'vuex';
import axios from '@/utils/request'
import {ref,reactive} from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus';


  const router = useRouter()

  const labelPosition = ref('top')
  const formLabelAlign = reactive({
    data: '',
    password: '',
  })

  //手机号和邮箱正则表达式
  const phoneRegex = /^1[3-9]\d{9}$/;
  const emailRegex = /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
  const combinedRegex = new RegExp(`(${phoneRegex.source})|(${emailRegex.source})`);
 // 设置校验规则
  const rules = reactive({
    data:[
      { required: true, message: '请输入手机号', trigger: 'blur' },
      { pattern: combinedRegex, message: '请输入有效的手机号', trigger: 'blur' } 
    ],
    password:[
      { required: true, message: '请输入密码', trigger: 'blur'},
      { pattern:/^\S{6,15}$/,message:'密码必须是6-15位非空字符',trigger:'change'}
    ]
  })



  let allFieldsValid = ref(false);//所有表单是否符合规则
  const myForm = ref(null);
  //验证输入框是否符合规则
  function checkAllFields() {
    // formTouched.value = true;
    myForm.value.validate(valid => {
      allFieldsValid.value = valid;
    });
  }


  // 保存token
  const store = useStore()
  // const getToken = (token)=>{
  //   store.commit('GETTOKEN',token)
  // }
  // const getUserId = (userId)=>{
  //   store.commit('GETUSERID',userId)
  // }
  // const getUserName = (username)=>{
  //   store.commit('GETUSERNAME',username)
  // }

  // 发送密码登录数据请求
  function loadOn(){
    myForm.value.validate((valid) => {
    if (valid) {
      axios.post('/users/loginByPassword',formLabelAlign)
      .then(response=>{
        if (response.data.code === 1  ) { 
             if(response.headers["authorization"]){
                  console.log('--------下面是登录成功后的打印')
                  console.log(response)
                  localStorage.setItem('token',response.headers["authorization"])
                  localStorage.setItem('userId',response.data.data.id)
                  localStorage.setItem('userName',response.data.data.username)
                  // getToken(response.headers["authorization"])
                  // getUserId(response.data.data.id)
                  // getUserName(response.data.data.username)
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
            console.log('登录失败');
            ElMessage.error('登录失败'); 
        }
      })
      .catch(error => {
              // 响应失败，处理错误
              console.error(error);
            });
      }
    else{
      console.log('error submit!!');
      return false;
    }
  })
}
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
:deep .password-box .el-form-item__content{
  display: flex;
  gap: 1rem;
  flex-direction: column;
  align-items: flex-end;
}
.forget-phone{
  color:  #2b6ae8;
  line-height: 1.6;
  font-size: 0.8rem;
  height: 40px;
  cursor: pointer;
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
}
</style>
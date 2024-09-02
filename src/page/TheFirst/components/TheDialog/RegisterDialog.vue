<template>
  <div>
      <el-dialog
        v-model="registerDialogVisible"
        id="register-dialog"
        class="register-dialog"
        title=""
        :top=top
        :lock-scroll="true"
        :close-on-click-modal="false"
        @close-dialog="closeDialog"
        >
        <div class="contain">
          <div class="one">
            <img class="fish" src="@/assets/fish.png" alt="">
            <span class="text">通过登录有渔获取获奖经验，与同学交流</span>
            <img class="group" src="@/assets/TheFirst/RegisterBgi.png" alt="">
          </div>
          <div class="two">
            <div class="form">
              <el-form
                ref="myForm"
                :label-position="labelPosition"
                label-width="100px"
                :model="formLabelAlign"
                style="width: 100%;"
                :rules="rules"
                @submit.prevent="register"
                :class="{ 'form-touched': formTouched.valueOf }"
              >
                  <el-form-item label="手机号" prop="phoneNumber">
                    <el-input v-model="formLabelAlign.phoneNumber" @input="checkPhoneNumber" @change="checkAllFields" />
                  </el-form-item>
                   <!-- <el-form-item label="邮箱" prop="email">
                    <el-input v-model="formLabelAlign.email"  @change="checkAllFields" />
                  </el-form-item> -->
                  <el-form-item label="验证码" prop="phoneVerification" class="send-identifytext">
                    <el-input v-model="formLabelAlign.phoneVerification" @change="checkAllFields" class="iden-code"/>
                    <button class="send" @click="send" :disabled="!phoneNumberValid || isRunning">{{ inner }}</button>
                  </el-form-item>
                  <el-form-item label="请输入密码" prop="password">
                    <el-input type="password" v-model="formLabelAlign.password"  show-password  @change="checkAllFields" />
                  </el-form-item>
                  <el-form-item label="请确认密码" prop="confirm">
                    <el-input type="password" v-model="formLabelAlign.confirm"  show-password  @change="checkAllFields" />
                  </el-form-item>
                  <el-form-item label="请填写以下验证码" class="send-identifyimg">
                    <el-input v-model="formLabelAlign.pictureVerification" @change="checkAllFields" class="code"/>
                    <img :src="imageUrl" alt="" class="verification">
                  </el-form-item>
              </el-form>
              <div class="center-button">
                <el-button type="primary" round style="height: 40px;width: 100px;" @click="register"  v-model="isRunning">注册</el-button>
              </div>
            </div>
          </div>
        </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref ,defineEmits,watchEffect,defineProps,onMounted,reactive} from 'vue';
import axios from '@/utils/request'
// import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';

const props = defineProps({
  modelValue: Boolean,
});
const emit = defineEmits(['update:modelValue']);
const registerDialogVisible = ref(props.modelValue);
watchEffect(() => {
  if (registerDialogVisible.value !== props.modelValue) {
    emit('update:modelValue', registerDialogVisible.value);
  }
});

const closeDialog = () => {
  registerDialogVisible.value = false;
}

let top = ref('5vh')
// const router = useRouter();
const myForm = ref(null);
const labelPosition = ref('top');
const imageUrl = ref(null);
const captchaUuid = ref();
const isRunning = ref(false)
const allFieldsValid = ref(false);//所有表单是否符合规则
const phoneNumberValid = ref(false);//手机号是否符合规则
const formTouched = ref(false);//用户是否输入内容

// 收集表单数据
let formLabelAlign = reactive({
  phoneNumber: '',
  phoneVerification:'',
  // email:'',
  // emailVerification: '',
  password:'',
  pictureVerification:'',
  confirm:'',
  uuid:captchaUuid.value,
})

// 设置表单校验规则
const rules = reactive({
  phoneNumber:[
    {required: true, message: '请输入手机号', trigger: 'blur'},
    {
      validator: (rule, value, callback) => {
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
  ],
  // email: [
  //   { required: true, message: '请输入邮箱', trigger: 'blur' },
  //   { pattern: /^[A-Za-z0-9_.-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$/, message: '邮箱格式不正确', trigger: 'blur' }
  // ],
  phoneVerification:[
    {required: true, message: '请输入验证码', trigger: 'blur'}
  ],
  // username:[
  //   {required: true, message: '请输入用户名', trigger: 'blur'},
  //   { min: 2, message: '昵称长度应大于两个字符', trigger: 'blur' },
  // ],
  // school:[
  //   {required: true, message: '请输入学校名称', trigger: 'blur'},
  // ],
  password:[
    {required: true, message: '请输入密码', trigger: 'blur'},
    {pattern:/^\S{6,15}$/,message:'密码必须是6-15位非空字符',trigger:'change'}
  ],
  confirm:[
    {required: true, message: '请输入密码', trigger: 'blur'},
    {pattern:/^\S{6,15}$/,message:'密码必须是6-15位非空字符',trigger:'change'},
    {validator:(rule,value,callback) => {
      if(value !== formLabelAlign.password){
        callback(new Error('两次输入的密码不一致'))
      }else{
        callback()
      }
  }}
  ]
})

// 手机号验证函数
function checkPhoneNumber() {
  const phoneNumberPattern = /^1[3-9]\d{9}$/;
  phoneNumberValid.value = phoneNumberPattern.test(formLabelAlign.phoneNumber);
  checkAllFields();
}

// 设置发送验证码按钮内容
let inner = ref('获取短信验证码')
// 发送验证码数据请求
async function fetchData() {
  try {
    const response = await axios.get(`/sendSignupSMSCode/${formLabelAlign.phoneNumber}`);
    console.log(response.data);
    if(response.data.code === 1){
      ElMessage.success('发送验证码成功');
    }else if(response.data.code === 0 && response.data.msg){
        ElMessage.error(response.data.msg.toString());
    }else {
      console.error(response.data.msg || 'Unknown error');
      ElMessage.error('发送验证码失败');
    }
  } catch (error) {
    console.error('发送验证码失败', error.message);
    ElMessage.error('发送验证码失败');
  }
}


// let inner = ref('获取邮箱验证码');
// // 发送验证码数据请求
// async function fetchData() {
//   try {
//     const response = await axios.get(`/sendEmailVerification/0/${formLabelAlign.email}`);
//     if (response.data.code === 1) {
//       ElMessage.success('邮箱验证码发送成功');
//     } else if(response.data.code === 0 && response.data.msg){
//       ElMessage.error(response.data.msg.toString());
//     }else {
//       console.log('邮箱验证码发送失败');
//       ElMessage.error('邮箱验证码发送失败');
//     }
//   } catch (error) {
//     console.error(error);
//   }
// }


// 点击发送验证码
async function send(){
  if(!isRunning.value){
    isRunning.value = true
    fetchData()
    let time = ref(60)   // 增加定时器
    let timeId = setInterval(function(){
      time.value--
      inner.value = time.value+'后重新获取'; // 更改按钮显示文字
      if(time.value===0){
        clearInterval(timeId)
        inner.value = '获取短信验证码'
        // inner.value = '获取邮箱验证码'
        isRunning.value = false
      }
    },1000)
  }
}

// 获取图片验证码
async function verfication() {
try {
  const response = await axios.get('/sendImageCode', {
    responseType: 'blob'
  });
  captchaUuid.value = response.headers.get('Captcha-UUID');
  const reader = new FileReader();
  reader.onload = function(event) {
    imageUrl.value = event.target.result;
  }
  reader.readAsDataURL(response.data);
} catch (error) {
  console.log(error);
  ElMessage.error('获取图片验证码失败');
}
}

//验证输入框是否符合规则
function checkAllFields() {
  formTouched.value = true;
  myForm.value.validate(valid => {
    allFieldsValid.value = valid;
  });
}


// 提交注册信息
async function register() {
  try {
    const valid = await myForm.value.validate();
    if (!valid) {
      console.log('非法提交！');
      return false;
    }
    // 判定两次密码是否输入相同
    if (formLabelAlign.confirm !== formLabelAlign.password) {
      ElMessage.error('密码和确认密码不匹配');
      return false;
    }
    const response = await axios.post('/users', {
      password:formLabelAlign.password,
      phoneNumber:formLabelAlign.phoneNumber,
      phoneVerification:formLabelAlign.phoneVerification,
      // email:formLabelAlign.email,
      // emailVerification:formLabelAlign.emailVerification,
      pictureVerification:formLabelAlign.pictureVerification,
      uuid:captchaUuid.value,
    });
    if (response.data.code === 1) {
      ElMessage.success('注册成功，请关闭注册框后点击进行登录');
      registerDialogVisible.value = false;
      // 若注册成功，添加token令牌并跳转页面
    } else if(response.data.code === 0 && response.data.msg){
        ElMessage.error(response.data.msg.toString());
        verfication();
    }else {
      console.log('注册失败');
      ElMessage.error('注册失败');
      verfication();
    }
  } catch (error) {
    console.error(error);
    ElMessage.error('注册过程中发生错误');
    verfication();
  }
}

onMounted(() => {
  verfication()
})

</script>
<style scoped>
::v-deep .el-dialog__body {
  padding: 0;
}
::v-deep .el-dialog__header {
  padding: 0;
}
.contain{
  display: flex;
  overflow: auto;
}
.one{
  display: flex;
  width: 60%;
  align-items: center;
  justify-content: space-around;
  flex-direction: column;
  background-color: #d5e3f2;
  border-radius: 1rem;
}
.two{
  width: 75%;
  height: 78vh;
  overflow: auto;
  display: flex;
  flex-direction: column;
  margin: 2rem auto 1rem;
}
.text{
  font-family: MicrosoftYaHei;
  font-size: 15px;
  color: #000000;
  display: block;
  text-align: center;
}
.fish{
  width: 70px;
  height: 70px;
  background-image: linear-gradient(90deg, 
        );
  border-radius: 35px;
  display: block;
}
.group{
  width: 45%;
  height: relative;
  display: block;
}

.title{
  width: 148px;
  height: 28px;
  font-family: MicrosoftYaHei;
  font-size: 30px;
  font-weight: normal;
  font-stretch: normal;
  letter-spacing: 0px;
  color: #000000;
  margin-left: 48px;
  text-decoration: none;
  position: relative;
}
.context{
  margin-top: 66px;
  margin-left: 66px;
}
:deep .el-dialog{
  --el-dialog-width: 75% !important;
  border-radius: 1rem;
}
el-form-item{
    size: small;
}
/* 默认情况下隐藏错误信息，直到用户开始输入 */
::v-deep .el-form-item__error {
  display: none;
}
/* 当表单被触摸时，显示错误信息 */
.form-touched ::v-deep .el-form-item__error {
  display: block;
}

.form{
  width: 90%;
  height: 100%;
  display: flex;
  margin: 0 auto;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
}

.center-button{
  display: flex;
  justify-content: center;
  align-items: center;
}
.send{
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
/* 调整输入框样式 */
::v-deep .el-input__wrapper{
  height: 40px;
  border: solid 1px #dfdfdf;
  box-shadow: 0 10px 10px -6px #cbd7f0;
}
/* 调整输入框上方文字颜色 */
.el-form-item__label{
  font-size: 16px;
  color: #000000;
}
.verfication{
	width: 100px;
	height: 49px;
  background-color:#b8cdf8
}  
:deep .send-identifytext .el-form-item__content ,
:deep .send-identifyimg .el-form-item__content {
  gap: 0.6rem;
  justify-content: flex-end;
}
:deep .el-form-item__error {
  top: 45px;
}
/* 对手机屏幕和小尺寸屏幕的样式调整 */
@media (max-width: 768px) {
  .one{
    display: none;
  }
  :deep .el-dialog{
    --el-dialog-width: auto:  !important;
    margin: 0px;
    border-radius: 0rem;
    background: #fafafa;
  }
  .two{
    height: calc(100vh - 3rem);
    width: 90%;
  }
  .form {
    width: auto;
  }
  .send{
    width: 122px;
    height: 30px;
  }
}
</style>
<template>
  <div>
    <el-dialog
      id="my-dialog"
      class="login-dialog"
      v-model="loginDialogVisible" 
      title=""
      :top=top
      :lock-scroll="false"
      :close-on-click-modal="false"
      @close="closeDialog"
    >
      <div style="display: flex;">
        <div class="one">
          <img class="fish" src="@/assets/fish.png" alt="">
          <span class="text">通过登录有渔获取获奖经验，与同学交流</span>
          <img class="home" src="@/assets/TheFirst/LoginBgi.png" alt="">
        </div>
        <div class="two">
          <div class="tab-title">
            <div class="title" @click="handleChildData(1)" :class="{ active: activeTab === 1 }">验证码登录</div>
            <div class="title" @click="handleChildData(2)" :class="{ active: activeTab === 2 }">密码登录</div>
          </div>
          <component :is="switchComponent" @dataFromChild="handleChildData" ></component>
          <div style="display:flex;align-items:center;justify-content: center;margin-top: 3rem;">
              <div class="read-text">请注意：点击登录代表您已阅读并同意</div>
              <span class="agreement" @click="goToUserAgreement">《{{ agreementName }}》</span>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref ,defineEmits,watchEffect,defineProps} from 'vue'
import IdentifyPart from './IdentifyPart.vue';
import PassWordVue from './PassWord.vue';
import { useRouter } from 'vue-router';
import { openUrl } from '@/utils/routeJudge'

const router = useRouter()
const agreementName = ref('有渔用户协议')

const props = defineProps({
  modelValue: Boolean,
});
const emit = defineEmits(['update:modelValue']);
const loginDialogVisible = ref(props.modelValue);
watchEffect(() => {
  if (loginDialogVisible.value !== props.modelValue) {
    emit('update:modelValue', loginDialogVisible.value);
  }
});

const activeTab = ref(1); //用于跟踪当前选中的标签
const switchComponent = ref(IdentifyPart);
const handleChildData = (id) => {
  activeTab.value = id;
  if(id === 1){
    switchComponent.value = IdentifyPart;
  }
  if(id === 2){
    switchComponent.value = PassWordVue;
  }
}

// 跳转至用户协议
const goToUserAgreement = () =>{
    // const routeLocation = router.resolve({ path: `/UserAgreement` });
    // window.open(routeLocation.href, '_blank');
    openUrl(`/UserAgreement`)
}

const closeDialog = () => {
  loginDialogVisible.value = false;
}

let top = ref('10vh')

</script>
<style scoped>
::v-deep .el-dialog__body {
  padding: 0;
}
::v-deep .el-dialog__header {
  padding: 0;
}
.one{
  display: flex;
  width: 60%;
  justify-content: space-around;
  align-items: center;
  flex-direction: column;
  background-color: #d5e3f2;
  border-radius: 1rem;
}
.two{
  width: 75%;
  height: 65vh;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  margin: 2rem;
}
.tab-title{
  width: 100%;
  display: flex;
  justify-content: space-evenly;
}
.text{
  font-family: MicrosoftYaHei;
  font-size: 18px;
  padding: 0 10px;
  line-height: 1.6;
  font-stretch: normal;
  letter-spacing: 0px;
  color: #000000;
  display: block;
  text-align: center;
}
.fish{
  width: 70px;
  background-image: linear-gradient(90deg, );
  border-radius: 35px;
  display: block;
}
.home{
  width: 100%;
}

.title{
  height: 28px;
  font-size: 1.8rem;
  color: #000000;
  padding: 0px 0px 15px;
  cursor: pointer;
}
.title.active{
  border-bottom: 2px solid black;
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
.context{
  margin: 66px auto 0px;
}
:deep .el-dialog{
  --el-dialog-width: 70%;
  border-radius: 1rem;
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
    height: 80vh;
    margin: 10vh auto;
    width: 85%;
  }
  .title{
    font-size: 1.5rem;
    margin-left: 1rem;
  }
}
</style>
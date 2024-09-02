<template>
  <div class="">
    <TitleSection :message="msg" :show-btn="false" />
    <div class="page">
      <div class="email out">
        <img src="@/assets/TheSettings/已绑定.svg">
        <div class="left">绑定邮箱</div>
        <div class="middle" style="color: red">未绑定邮箱</div>
        <div class="right" @click="showEmailDialog = true">绑定邮箱</div>
      </div>
      <el-dialog v-model="showEmailDialog" title="绑定邮箱" width="70%" @close="showEmailDialog = false">
        <EmailBind />
      </el-dialog>

      <div class="pwd out">
        <img src="@/assets/TheSettings/未绑定.svg">
        <div class="left">设置密码</div>
        <div class="middle">已设置</div>
        <div class="right" @click="showPwdDialog = true">修改密码</div>
      </div>
      <el-dialog v-model="showPwdDialog" width="70%" title="修改密码" @close="showPwdDialog = false">
        <PwdChange />
      </el-dialog>

      <!-- <div class="phone out">
        <img src="@/assets/TheSettings/未绑定.svg">
        <div class="left">绑定手机</div>
        <div class="middle">188****8888</div>
        <div class="right" @click="showPhoneDialog = true">更改手机</div>
      </div>
      <el-dialog v-model="showPhoneDialog" width="70%" title="更改手机">
        <PhoneChange />
      </el-dialog> -->
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import TitleSection from "@/page/TheSettings/components/TitleSection.vue";
import EmailBind from "@/page/TheSettings/SecuLog/EmailBind.vue";
import PwdChange from "@/page/TheSettings/SecuLog/pwdChange.vue";
// import PhoneChange from "@/page/TheSettings/SecuLog/PhoneChange.vue";

const msg = '账户安全';
const showEmailDialog = ref(false);
const showPwdDialog = ref(false);
// const showPhoneDialog = ref(false);
</script>


<style scoped>
.page {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  padding-top: 2rem;
}
:deep .page .el-dialog__body{
  display: flex;
  flex-direction: column;
  align-items: center;
}
.out {
  display: flex;
  border-bottom: 2px #E3E3E3 solid;
  padding: 1rem 6rem;
  gap: 1rem;
}

.left {
  width: 30%;
}

.middle {
  width: 30%;
  color: #797979;
}

.right {
  width: 30%;
  cursor: pointer;
  color: #00A1D6;
}
</style>

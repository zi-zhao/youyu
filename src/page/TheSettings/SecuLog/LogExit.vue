<template>
  <div>
    <TitleSection :message="msg" :show-btn="false"/>
  <div class="page">
    <div class="outside">
      <div class="left">上次登录时间</div>
      <div class="right">{{ user.lastLoginTime }}</div>
    </div>

    <div class="outside">
      <div class="left">上次登录地点</div>
      <div class="right">{{ user.lastLoginLocation }}</div>
    </div>

    <div class="outside">
      <div class="left">上次登录IP</div>
      <div class="right">{{ user.lastLoginIp }}</div>
    </div>

    <!-- <div class="text-foot">
      根据登录时间，IP，地理位置，若判断为异常情况，请在核实后及时
      <span class="pwdchange" @click="showPwdDialog = true">修改密码</span>
    </div> -->
    <el-dialog v-model="showPwdDialog" width="70%" title="修改密码" @close="showPwdDialog = false">
      <PwdChange />
    </el-dialog>
    <YyButton theme="purple" style="margin-top: 3rem;padding: 0.5rem 1rem;" @click="exitLogFunction"> 退出登录</YyButton>
  </div>
  </div>
</template>

<script setup>
import { ref,onMounted } from 'vue';
import { useRouter } from 'vue-router';
import TitleSection from "@/page/TheSettings/components/TitleSection.vue";
import YyButton from "@/page/components/YyButton.vue";
import PwdChange from "@/page/TheSettings/SecuLog/pwdChange.vue";
import axios from '@/utils/request';
import { ElMessage,ElMessageBox} from 'element-plus';

const userId = localStorage.getItem("userId"); // 获取用户ID
const msg = ref('登录信息');
const router = useRouter();
const showPwdDialog = ref(false);
const user = ref({});

//退出登录的弹框
const exitLogFunction = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要退出登录吗？',
      {
        confirmButtonText: '确认退出',
        cancelButtonText: '取消',
        type: 'warning',
      }
    );
    exitLog();
  } catch {
    console.log('关闭弹框')
  }
}

//退出登录的接口
async function exitLog(){
  // try {
  //   const response = await axios.post('/user/logout');
  //   if(response.data.code === 1){
      localStorage.clear();
      console.log('localStorage中的数据已被清理');
      ElMessage.success('退出登录成功');
      router.push('/');
    // }else if(response.data.code === 0 && response.data.msg){
    //   ElMessage.error(response.data.msg.toString());
    // }else{
    //   console.error("退出登录失败");
    //   ElMessage.error('退出登录失败');
    // }
  // } catch (error) {
  //   console.error("退出登录失败", error); 
  //   ElMessage.error('退出登录失败');
  // }
}

// 获取用户信息
const fetchAvatar = async () => {
  try {
    const response = await axios.get(`/users/${userId}`);
    if(response.data.code === 1){
      user.value = response.data.data;
    }else if(response.data.code === 0 && response.data.msg){
      ElMessage.error(response.data.msg.toString());
    }else{
      ElMessage.error('获取用户信息失败');
    }
  } catch (error) {
    console.error("获取用户信息失败", error);
    ElMessage.error('获取用户信息失败');
  }
};

      
onMounted(() => {
  fetchAvatar();
})


</script>

<style scoped>
.page{
  margin-top: 5rem;
  display: flex;
  justify-content: center;
  flex-direction: column;
  gap: 3rem;
  padding: 0 12rem;
}
:deep .page .el-dialog__body{
  display: flex;
  flex-direction: column;
  align-items: center;
}
.outside{
  display: flex;
  justify-content: space-between;
}

.left{
  flex: 50%;
  text-align: left;
  color: #7D7979;
}

.right{
  flex: 50%;
  text-align: left;
}

.text-foot{
  margin-top: 3rem;
  text-align: left;
  color: #7D7979;
}

.pwdchange{
  color: #60A7F3;
  cursor: pointer;
}
</style>
<template>
  <div class="text_content"  >
    <div class="appendix">
      <div style="display: flex;align-items: center;gap: 5px;">
        <el-icon><Link /></el-icon>附件
      </div>
      <div v-if="attachmentState.type === 0 " style="margin-top: 5px;color: #3779c6;font-size: 14px;" class="blue-text">
        该文章无附件
      </div>
      <div v-if="attachmentState.type === 2  "  @click="loadFile" class="pay blue-text" >
        该附件已购买,点此下载
      </div>
      <div v-if="attachmentState.type === 3  "  @click="loadFile" class="pay blue-text" >
        该附件无需额外支付费用,点此下载
      </div>
      <div v-if="attachmentState.type === 1 " class="pbutton">
        <div class="pheader">
          <div class="lock-icons">
            <el-icon><Document /></el-icon>
          </div>
          <div class="content-right">
              <div class="text-row">
                <div class="ptext">{{ attachmentState.name }}</div>
                <span class="number">{{ attachmentState.size }}</span>
              </div>
              <div v-if="attachmentCost.type === 0 " class="pay" @click="emptyDialogVisible2 = true">
                获取该附件需支付{{attachmentCost.count}}鱼饵(点此下载)
              </div>
              <div  v-if="attachmentCost.type === 1 " class="pay" @click="emptyDialogVisible2 = true">
                获取该附件需支付{{attachmentCost.count}}渔币(点此下载)
              </div>
              <el-dialog v-model="emptyDialogVisible2" style="width: 40%;">
                <div class="centered-content">
                  <el-icon><Document /></el-icon>
                  <p>{{ attachmentState.name  }}</p>
                </div>
                <div v-if="attachmentCost.type === 0 "  class="flex-container">
                  <p>支付</p>
                  <span class="attachment-money">{{ attachmentCost.count }}</span>
                  <p>个鱼饵以下载该附件</p>
                </div>
                <div  v-if="attachmentCost.type === 1 " class="flex-container">
                  <p>支付</p>
                  <span class="attachment-money">{{ attachmentCost.count }}</span>
                  <p>个渔币以下载该附件</p>
                </div>
                <div class="button-container">
                  <YyButton theme="purple" style="padding: 6px 15px;" @click="purchaseAttachment">确定支付</YyButton>
                  <YyButton theme="gray" style="padding: 6px 15px;" @click="emptyDialogVisible2 = false">取消</YyButton>
                </div>
              </el-dialog>
            </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ElMessage } from 'element-plus';
import { ref,onMounted} from 'vue';
import axios from '@/utils/request';
import { useRoute  } from 'vue-router'
import COS from 'cos-js-sdk-v5';
import YyButton from "@/page/components/YyButton.vue";

let cos;
const route = useRoute ();
const articleId = parseInt(route.params.id,10);//路径中的文章ID
const emptyDialogVisible2 = ref(false);
const attachmentCost = ref({});//附件需要花费的货币类型及数额
const attachmentState = ref({});//附件购买的状态。0为没有附件，1为未购买，2为已购买,3为不需付费
const attachmentPermissionData = ref({});//附件许可证

//购买附件接口
async function purchaseAttachment(articleId) {
  try {
    const response = await axios.post(`/article/attachment/purchase/${articleId}`);
    if (response.data.code === 1) {
      loadFile();
    } else if(response.data.code === 0 && response.data.msg){
        ElMessage.error(response.data.msg.toString());
    }else {
      console.error('购买附件失败', response.data.msg || 'Unknown error');
      ElMessage.error('购买附件失败');
    }
  } catch (error) {
    console.error('购买附件失败', error.message);
    ElMessage.error('购买附件失败');
  }
}   


//向后端请求下载当前附件的许可证
async function getattachmentPermission() {
  try {
    const response = await axios.get(`/article/attachment/download/secret/${articleId}`)
    if (response.data.code === 1) {
      attachmentPermissionData.value = response.data.data;
      updateCOSInstance();
    } else if(response.data.code === 0 && response.data.msg){
        ElMessage.error(response.data.msg.toString());
    }else {
      console.error(response.data.msg || 'Unknown error');
    }
  } catch (error) {
    console.error('向后端请求下载当前附件的许可证', error.message);
  }
}

//获取附件状态
async function fetchAttachmentState(articleId) {
  try {
    const response = await axios.get(`/article/attachment/purchaseLog/${articleId}`);
    if (response.data.code === 1) {
      attachmentState.value = response.data.map;
    } else if(response.data.code === 0 && response.data.msg){
        ElMessage.error(response.data.msg.toString());
    }else {
      console.error('获取附件状态失败', response.data.msg || 'Unknown error');
      ElMessage.error('获取附件状态失败');
    }
  } catch (error) {
    console.error('获取附件状态失败', error.message);
    ElMessage.error('获取附件状态失败');
  }
}   


//获取附件价格
async function fetchAttachmentCost(articleId) {
  try {
    const response = await axios.get(`/article/attachment/require/${articleId}`);
    if (response.data.code === 1) {
      attachmentCost.value = response.data.map;
    } else if(response.data.code === 0 && response.data.msg){
        ElMessage.error(response.data.msg.toString());
    }else {
    console.error('获取附件状态失败', response.data.msg || 'Unknown error');
      ElMessage.error('获取附件状态失败');
    }
  } catch (error) {
    console.error('获取附件状态失败', error.message);
    ElMessage.error('获取附件状态失败');
  }
}

function updateCOSInstance() {
    cos = new COS({
        SecretId: attachmentPermissionData.value.tmpSecretId,
        SecretKey: attachmentPermissionData.value.tmpSecretKey,
    });
}

const downloadFile = () => {
  if (!cos) {
    console.error("COS 实例未初始化");
    return;
  }
  cos.getObjectUrl({
    Bucket: 'youyu-bucket-attachment-1319554411',
    Region: 'ap-chengdu',
    Key: attachmentPermissionData.value.url,
    onProgress: function (progressData) {
        console.log(JSON.stringify(progressData));
    }
  }, function(err, data) {
      if (err) {
          console.log(err);
          return;
      }
      const url = data.Url;
      const link = document.createElement('a');
      link.href = url;
      link.download = attachmentPermissionData.value.url.split('/').pop(); // 提取文件名
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  });
};

async function loadFile() {
  await getattachmentPermission(); // 确保先执行并成功获取数据
  // 检查 COS 实例是否已初始化
  if (!cos) {
    console.error("COS 实例未初始化");
    return;
  }
  downloadFile();
}

onMounted(() => {
    fetchAttachmentState(articleId);
    fetchAttachmentCost(articleId);
});

</script>

<style scoped>
.appendix {
  width: 1140px;
  display: flex;
  flex-direction: column;
  padding-left: 50px;
  margin: 25px auto 0;
}
.appendix span {
  color: #777;
  font-family: Microsoft YaHei;
  margin: 5px;
  font-size: 12px;
}
.appendix .el-icon{
  width: 20px;
  height: 20px;
}
.appendix .el-icon svg{
  width: 20px;
  height: 20px;
}
.pbutton {
  width: 315px;
  height: 50px;
  margin: 20px 0px;
}
.pheader {
  display: flex;
  align-items: flex-start; 
  gap: 8px; 
}
.content-right {
  display: flex;
  flex-direction: column; 
  gap: 8px;
}
.text-row {
  display: flex; 
  align-items: center;
  gap: 8px;
}
.ptext{
  color: #000;
  font-family: Microsoft YaHei;
  font-size: 14px;
}
.lock-icons{
  width: 45px;
  height: 45px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  background: rgba(228, 228, 228, 0.43);
  margin-right: 10px;
}
.centered-content .el-icon{
    height: 25px;
    width: 25px;
}
.centered-content .el-icon svg {
    height: 25px;
    width: 25px;
    color: #666666;
}

.number{
  color: #777;
  font-family: Microsoft YaHei;
  font-size: 14px;
}
.ptext, .number {
  display: inline-block;
  vertical-align: middle;
}
.pay{
  display: block; 
  margin-top: -1px; 
  cursor: pointer;
  color: #3779C6;
  font-family: Microsoft YaHei;
  font-size: 14px;
}
/* 购买附件弹框 */
.centered-content {
  display: flex;
  flex-direction: column; 
  align-items: center; 
}
.flex-container {
  display: flex;
  align-items: center;
  justify-content: center; 
  gap: 5px;      
  margin-bottom: 40px;    
}
.attachment-money{
  font-weight: 700;
  font-size: 20px;
}
.button-container {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 30px;
  position: absolute;
  right: 10px;
  bottom: 10px;
  gap: 15px;
}
@media (max-width:768px){
  .appendix{
      width: auto;
      padding-left: 0px;
  }
  .appendix .el-icon{
      margin-left: 5%;
  }
  .pheader{
      margin: 0 auto;
      width: 90%;
      justify-content: space-evenly;
      align-items: center;
      gap: 0px;
  }
  .lock-icons{
      width: 2.5rem;
      height: 2.5rem;
      margin-right: 0.5rem;
  }
  .content-right{
      gap: 0.2rem;
  }
  .blue-text{
    margin-left: 5%;
  }
}
</style>
<template>
  <div>
    <el-dialog v-model="localDialogVisible" title="提问评价">
        <div class="eva_input">
            <el-input
                v-model="textarea"
                maxlength="150"
                placeholder="分享一下最近的趣事或心情吧"
                show-word-limit
                type="textarea"
                size="large"
                resize="none"
                :autosize = "{ minRows: 2, maxRows: 30 }"
            />
        </div>
        <div class="rate_box">
            <span style="font-weight: 700;">综合评价</span>
            <el-rate v-model="value" />
        </div>
        <template #footer>
        <span class="dialog-footer">
            <el-button type="primary" @click="evaluateAnswer">
            发布
            </el-button>
        </span>
        </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref , defineProps ,defineEmits,watchEffect} from 'vue'
import { ElMessage } from 'element-plus';
import axios from '@/utils/request';
import { useRouter } from 'vue-router'

const props = defineProps({
    modelValue: Boolean,
    QuestionId:Number,
});

const textarea = ref();
const value = ref();
const router = useRouter()
const emit = defineEmits(['update:modelValue']);
const localDialogVisible = ref(props.modelValue);
watchEffect(() => {
  if (localDialogVisible.value !== props.modelValue) {
    emit('update:modelValue', localDialogVisible.value);
  }
});

//对问答评价
async function evaluateAnswer() {
  try{
    const queryParams = new URLSearchParams({
      id:props.QuestionId,
      content:textarea.value,
      grade:value.value,
    }).toString();
    const response = await axios.post(`/answer/comment?${queryParams}`)
    if(response.data.code === 1){
        ElMessage.success('评价成功');
        localDialogVisible.value = false;
        if (router.currentRoute.value.path === '/DefaultPresentation') {
          location.reload();
        } else {
          router.push('/DefaultPresentation');
        }
    }else if(response.data.code === 0 && response.data.msg){
        ElMessage.error(response.data.msg.toString());
    }else{
        console.error("评价失败");
        ElMessage.error('评价失败');
    }
  } catch (error) {
    console.error("评价失败", error); 
    ElMessage.error('评价失败');
  }
}

</script>
<style scoped>
::v-deep .el-dialog__body {
  padding: 0px 40px;
}
::v-deep .el-dialog__header{
  padding-bottom: 30px;
  font-weight: 700;
}
::v-deep .el-input ,
::v-deep .el-textarea,
::v-deep .eva_input .el-textarea .el-textarea__inner{
  width: 100%;
  height: 170px !important;
}
::v-deep .el-dialog{
    --el-dialog-width: 35%;
}
::v-deep .el-dialog__header{
    text-align: center;
}
.rate_box{
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  margin: 20px 0px;
}
</style>

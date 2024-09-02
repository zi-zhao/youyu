<!-- 评论举报弹框 -->
<template>
    <div>
        <el-dialog v-model="dialogFormVisible" title="评论举报">
            <!-- 多选框 -->
            <div class="container_1">
                <div class="item">             
                    <span>违反法律法规</span>
                    <div class="option">
                        <el-checkbox v-model="checked1" label="违法违规" />
                        <el-checkbox v-model="checked2" label="抄袭" />
                        <el-checkbox v-model="checked3" label="赌博诈骗" />
                    </div>
                </div>
                <div class="item">             
                    <span>谣言类不实信息</span>
                    <div class="option">
                        <el-checkbox v-model="checked4" label="涉政谣言" />
                        <el-checkbox v-model="checked5" label="疫情谣言" />
                        <el-checkbox v-model="checked6" label="涉社会事件谣言" />
                        <el-checkbox v-model="checked7" label="虚假不实信息" />
                    </div>
                </div>
                <div class="item">             
                    <span>侵犯个人权益</span>
                    <div class="option">
                        <el-checkbox v-model="checked8" label="人身攻击" />
                        <el-checkbox v-model="checked9" label="侵犯隐私" />
                    </div>
                </div>
                <div class="item">             
                    <span>有害社区环境</span>
                    <div class="option">
                        <el-checkbox v-model="checked10" label="垃圾广告" />
                        <el-checkbox v-model="checked11" label="引战" />
                        <el-checkbox v-model="checked12" label="刷屏" />
                        <el-checkbox v-model="checked13" label="抢楼" />
                        <el-checkbox v-model="checked14" label="违规抽奖" />
                        <el-checkbox v-model="checked15" label="文章不相关" />
                        <el-checkbox v-model="checked16" label="青少年不良信息" />
                        <el-checkbox v-model="checked17" label="其他" />
                    </div>
                </div>
            </div>
            <template #footer>
            <span class="dialog-footer">
                <el-button @click="dialogFormVisible = false">取消</el-button>
                <el-button type="primary" @click="submitData">
                确定
                </el-button>
            </span>
            </template>
        </el-dialog>
    </div>
</template>

<script setup>
import { ElMessage } from 'element-plus';
// import { Plus } from '@element-plus/icons-vue';
import { defineProps,defineEmits,watchEffect,ref,computed} from "vue";
import axios from '@/utils/request';

const props = defineProps({
    modelValue: Boolean,
    type:Number,
    id:Number,
});
const emit = defineEmits(['update:modelValue']);
const dialogFormVisible = ref(props.modelValue);
watchEffect(() => {
  if (dialogFormVisible.value !== props.modelValue) {
    emit('update:modelValue', dialogFormVisible.value);
  }
});

const checked1 = ref(true)
const checked2 = ref(false)
const checked3 = ref(false)
const checked4 = ref(true)
const checked5 = ref(false)
const checked6 = ref(false)
const checked7 = ref(false)
const checked8 = ref(true)
const checked9 = ref(false)
const checked10 = ref(true)
const checked11 = ref(true)
const checked12 = ref(false)
const checked13 = ref(false)
const checked14 = ref(false)
const checked15 = ref(false)
const checked16 = ref(false)
const checked17 = ref(false)

const categories = ref([
  { 
    label: '违反法律法规', 
    checkboxes: [
      { label: '违法违规', value: checked1 },
      { label: '抄袭', value: checked2 },
      { label: '赌博诈骗', value: checked3 }
    ]
  },
  { 
    label: '谣言类不实信息', 
    checkboxes: [
      { label: '涉政谣言', value: checked4 },
      { label: '疫情谣言', value: checked5 },
      { label: '涉社会事件谣言', value: checked6 },
      { label: '虚假不实信息', value: checked7 }
    ]
  },
  { 
    label: '侵犯个人权益', 
    checkboxes: [
      { label: '人身攻击', value: checked8 },
      { label: '侵犯隐私', value: checked9 }
    ]
  },
  { 
    label: '有害社区环境', 
    checkboxes: [
      { label: '垃圾广告', value: checked10 },
      { label: '引战', value: checked11 },
      { label: '刷屏', value: checked12 },
      { label: '抢楼', value: checked13 },
      { label: '违规抽奖', value: checked14 },
      { label: '文章不相关', value: checked15 },
      { label: '青少年不良信息', value: checked16 },
      { label: '其他', value: checked17 }
    ]
  }
]);


//根据父组件传回的type判断应该调用的接口类型（这个方法只是增加一个判断值）
const submitData = () => {
  let selectedCategories = categories.value.map(category => {
    const selected = category.checkboxes
      .filter(checkbox => checkbox.value) 
      .map(checkbox => checkbox.label); 
    return selected.length > 0 ? `${category.label}:${selected.join(',')}` : '';
  }).filter(str => str).join(';');
  if(props.type == 0){
    getCommentReport(selectedCategories); 
  } else if(props.type == 1){
    getCommentReplyReport(selectedCategories); 
  }
}




//一级评论举报
async function getCommentReport(content) {
  try{
    const queryParams = new URLSearchParams({
      commentId: Number(props.id),
    }).toString();
    const response = await axios.post(`/comment/report?${queryParams}`,{
      content: content,
    })
    if(response.data.code === 1){
        ElMessage.success('评论举报成功');
        dialogFormVisible.value = false;
    }else if(response.data.code === 0 && response.data.msg){
        ElMessage.error(response.data.msg.toString());
    }else{
    console.error("评论举报失败");
    ElMessage.error('评论举报失败');
    }
  } catch (error) {
    console.error("评论举报失败", error); 
    ElMessage.error('评论举报失败');
  }
}
//二级评论举报
async function getCommentReplyReport(content) {
  try{
    const queryParams = new URLSearchParams({
      commentId: Number(props.id),
    }).toString();
    const response = await axios.post(`/comment/reply/report?${queryParams}`,{
      content: content,
    })
    if(response.data.code === 1){
        ElMessage.success('评论举报成功');
        dialogFormVisible.value = false;
    }else if(response.data.code === 0 && response.data.msg){
        ElMessage.error(response.data.msg.toString());
    }else{
    console.error("评论举报失败");
    ElMessage.error('评论举报失败');
    }
  } catch (error) {
    console.error("评论举报失败", error); 
    ElMessage.error('评论举报失败');
  }
}


</script>

<style scoped>
::v-deep .el-dialog{
    width: 65%;
    --el-dialog-margin-top: 15vh;
}
::v-deep .el-dialog__body{
    padding: 10px 30px;
}
::v-deep .el-dialog__header{
    text-align: center;
}
::v-deep .el-dialog__title {
    font-weight: 700;
    font-size: 20px;
}
.container_1,
.container_2{
    display: flex;
    flex-direction: column;
    gap: 20px;
}
.option{
    margin-top: 10px;
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
}
.mainp{
  display: flex;
  align-items: flex-start;
  gap: 20px;
  align-self: stretch;
}
.dialog-footer button:first-child {
  margin-right: 10px;
}
::v-deep .el-dialog__headerbtn{
    position: absolute;
    top: -7px;
    right: 15px;
}
</style>
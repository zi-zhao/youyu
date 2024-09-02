<!-- 文章举报弹框 -->
<template>
    <div>
        <el-dialog v-model="localDialogVisible" :title=title>
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
                    <span>不友善行为</span>
                    <div class="option">
                        <el-checkbox v-model="checked8" label="人身攻击" />
                        <el-checkbox v-model="checked9" label="侵犯隐私" />
                        <el-checkbox v-model="checked10" label="引战" />
                    </div>
                </div>
                <div class="item">             
                    <span>有害社区环境</span>
                    <div class="option">
                        <el-checkbox v-model="checked11" label="垃圾广告" />
                        <el-checkbox v-model="checked12" label="色情低俗" />
                        <el-checkbox v-model="checked13" label="文章不相关" />
                        <el-checkbox v-model="checked14" label="其他" />
                        <el-checkbox v-model="checked15" label="青少年不良信息" />
                    </div>
                </div>
            </div>
            <!-- 文字、图片描述 -->
            <div class="container_2">
                <!-- 详细描述 -->
                <div class="mainp">
                    <span class="pictext">详细描述</span>
                    <el-input
                    v-model="textarea"
                    maxlength="200"
                    placeholder="请详细填写举报原因"
                    show-word-limit
                    type="textarea"
                    size="large"
                    resize="none"
                    :autosize = "{ minRows: 2, maxRows: 30 }"
                    class="input_el"
                    />
                </div>
            </div>   
                
            <template #footer>
            <span class="dialog-footer">
                <el-button @click="localDialogVisible = false">取消</el-button>
                <el-button type="primary" @click="submitData">
                确定
                </el-button>
            </span>
            </template>
        </el-dialog>
    </div>
</template>

<script setup>
import { defineProps,defineEmits,watchEffect,ref} from "vue";
import { ElMessage } from 'element-plus';
import axios from '../../utils/request';

const props = defineProps({ 
  modelValue: Boolean,
  type:Number,
  id:Number,
});

const title = ref('文章举报');
const checked1 = ref(true)
const checked2 = ref(false)
const checked3 = ref(false)
const checked4 = ref(true)
const checked5 = ref(false)
const checked6 = ref(false)
const checked7 = ref(false)
const checked8 = ref(true)
const checked9 = ref(false)
const checked10 = ref(false)
const checked11 = ref(true)
const checked12 = ref(false)
const checked13 = ref(false)
const checked14 = ref(false)
const checked15 = ref(false)

const emit = defineEmits(['update:modelValue']);
const localDialogVisible = ref(props.modelValue);
watchEffect(() => {
  if( props.type == 0){
    title.value = '文章举报';
  }else if(props.type == 1){
    title.value = '分享举报';
  }
  if (localDialogVisible.value !== props.modelValue) {
    emit('update:modelValue', localDialogVisible.value);
  }
});

const textarea = ref('');
const tempData = ref();

// 定义每个类别和对应的复选框
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
    label: '不友善行为', 
    checkboxes: [
      { label: '人身攻击', value: checked8 },
      { label: '侵犯隐私', value: checked9 },
      { label: '引战', value: checked10 }
    ]
  },
  { 
    label: '有害社区环境', 
    checkboxes: [
      { label: '垃圾广告', value: checked11 },
      { label: '色情低俗', value: checked12 },
      { label: '文章不相关', value: checked13 },
      { label: '其他', value: checked14 },
      { label: '青少年不良信息', value: checked15 }
    ]
  }
]);

//根据父组件传回的type判断应该调用的接口类型（这个方法只是增加一个判断值）
const submitData = () => {
  let selectedCategories = categories.value.map(category => {
    // 筛选出被选中的复选框
    const selected = category.checkboxes
      .filter(checkbox => checkbox.value)
      .map(checkbox => checkbox.label); 
    // 如果有被选中的复选框，返回类别和选中的标签
    return selected.length > 0 ? `${category.label}:${selected.join(',')}` : '';
  }).filter(str => str).join(';');
  // 如果 textarea 有值，则拼接到最后
  if (textarea.value.trim() !== '') {
    selectedCategories += `;详细信息:${textarea.value}`;
  }
  tempData.value = selectedCategories;
  if (props.type == 0) {
    getArticleReport(selectedCategories);
  } else if (props.type == 1) {
    getShareReport(selectedCategories);
  }
};



//文章举报
async function getArticleReport(content) {
  try{
    const queryParams = new URLSearchParams({
      articleId: Number(props.id),
    }).toString();
    const response = await axios.post(`/article/report?${queryParams}`,{
      content: content,
    })
    if(response.data.code === 1){
        ElMessage.success('举报成功');
        localDialogVisible.value = false;
    }else if(response.data.code === 0 && response.data.msg){
        ElMessage.error(response.data.msg.toString());
    }else{
        console.error('文章举报失败');
        ElMessage.error('文章举报失败')
    }
  } catch (error) {
    console.error("文章举报失败", error); 
    ElMessage.error('文章举报失败');
  }
}
//分享举报
async function getShareReport(content) {
  try{
    const queryParams = new URLSearchParams({
      shareId: Number(props.id),
    }).toString();
    const response = await axios.post(`/share/report?${queryParams}`,{
      content: content,
    })
    if(response.data.code === 1){
        ElMessage.success('举报成功');
        localDialogVisible.value = false
    }else if(response.data.code === 0 && response.data.msg){
        ElMessage.error(response.data.msg.toString());
    }else{
    console.error("分享举报失败");
    ElMessage.error('分享举报失败');
    }
  } catch (error) {
    console.error("分享举报失败", error); 
    ElMessage.error('分享举报失败');
  }
}


</script>

<style scoped>
::v-deep .el-dialog{
    width: 65%;
    --el-dialog-margin-top: 9vh;
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
}
.container_2{
    margin-top:30px;
    padding-top: 30px;
    border-top:1px solid #dedede;
    width: 80%;
}
.ptitie {
  display: flex;
  align-items: center;
  gap: 20px;
  align-self: stretch;
}
.pictext {
    display: block;
    width: 70px;
}
.coverage{
    display: flex;
    gap: 20px;
}
.avatar-uploader{
    width: 178px;
    border: 1px dashed #b9b9b9;
    border-radius: 10px
}
.avatar-uploader .avatar {
  width: 178px;
  height: 178px;
  display: block;
}
.avatar-uploader .el-upload {
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
}

.avatar-uploader .el-upload:hover {
  border-color: var(--el-color-primary);
}

.el-icon.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  text-align: center;
}
/* 三个输入框边框样式 */
::v-deep .el-input__wrapper,
::v-deep .el-textarea__inner{
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
::v-deep .el-input__wrapper{
  height: 40px;
}  
::v-deep .el-textarea__inner{
  height: 60px;
}  
/* 三个输入框获得焦点时的边框样式 */
::v-deep .el-input__wrapper.is-focus,
::v-deep .el-textarea__inner:focus{
  box-shadow: 0 2px 6px #cfd7e2;
  border: 1px solid #d7d7d7;
}
.input_el textarea {
  overflow: hidden;
}
.mainp{
  /* width: 590px; */
  display: flex;
  align-items: flex-start;
  gap: 20px;
  align-self: stretch;
}
.dialog-footer button:first-child {
  margin-right: 10px;
}

</style>
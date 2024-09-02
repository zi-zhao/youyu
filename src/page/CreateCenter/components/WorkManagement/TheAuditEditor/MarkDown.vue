<template>
  <div class="body_bgc">
    <div style="width: 1100px;  margin:auto; border-radius: 4px; box-shadow: 0px 2px 4px 0px rgba(0, 0, 0, 0.25);">
      <div class="header">
        <input type="text" placeholder="请输入文章标题" class="title" v-model="title">
      </div>
      <div class="md-contain">
        <v-md-editor 
          v-model="text" height="540px" class="md" 
          left-toolbar="undo redo clear | h bold italic strikethrough quote | ul ol table hr | link image code | save tip emoji | customToolbar "
          :disabled-menus="[]"
          @upload-image="handleUploadImage"
          />
      </div>
    </div>
    <PictureAndAttachment :Submit = "submitState"></PictureAndAttachment>
    <ToSubmit />
    <!-- 底部滚动条 -->
    <div class="foot">
      <div class="b-container">
        <button class="b-1" @click="saveArticleDraft">保存草稿</button>
        <!-- <button class="b-1">定时发布</button> -->
        <button class="b-2" @click="postArticlePost">发表文章</button>
      </div>
    </div>
  </div>
</template>
  
<script setup>
import { ref,toRaw,onMounted} from 'vue';
import ToSubmit from './components/ToSubmit.vue';
import { useStore } from 'vuex';
import axios from '@/utils/request';
import { useRoute,useRouter} from 'vue-router';
import { ElMessage,ElMessageBox} from 'element-plus';
import PictureAndAttachment from './PictureAndAttachment.vue'
import {getArticleContentPermission} from '@/utils/cosService';
import {compressImage} from '@/utils/fileService';

const route = useRoute();
const router = useRouter();
const articleId = parseInt(route.params.id,10);//路径中的文章ID
const article = ref();
const store = useStore();
const text = ref('');
const title = ref('');
const submitState = ref('1');

async function handleUploadImage(event, insertImage, files){
  const articleId = localStorage.getItem("articleId"); // 获取文章ID
  // 如果没有选择文件或选择了多个文件，则直接返回
  if (!files || files.length !== 1) {
    console.error('最多选择一张图片！');
    ElMessage.error('最多选择一张图片！')
    return;
  }
  const timestamp = new Date().getTime(); // 获取当前时间戳
  const filePictureName = `${timestamp}-${files.name}`; // 在文件名前加时间戳
  const compressedFile = await compressImage(files);
  const url = await getArticleContentPermission(compressedFile,articleId,filePictureName);
  insertImage({url:url});
}

function checkProperties(...objects) {
  for (let obj of objects) {
    for (let key in obj) {
      if (obj[key] === null || obj[key] === undefined || obj[key] === '') {
        return true;
      }
    }
  }
  return false;
}


  //保存草稿的提示弹框
const saveArticleDraft = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要将文章保存为草稿吗（网站只会保存文章编辑器中的内容和文章标题，不会保存附件、封面图及其他选项的值）？',
      {
        confirmButtonText: '确认保存',
        cancelButtonText: '取消',
        type: 'warning',
      }
    );
    await saveArticle();
  } catch {
    console.log('关闭弹框')
  }
}

//发表文章的提示弹框
const postArticlePost = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要发表文章吗（请确认已经填写了所有文章的相关信息，否则无法通过审核）？',
      {
        confirmButtonText: '确认发表',
        cancelButtonText: '取消',
        type: 'warning',
      }
    );
    await postArticle();
  } catch {
    console.log('关闭弹框')
  }
}
  
//将文章添加到专栏接口
async function uploadColumn(id) {
  const response2 = await axios.post('/column/article', {
    columnId:store.state.submitColumnId,
    contentId:id,
  });
  if(response2.data.code ===1) ElMessage.success('添加专栏成功');
  else if(response2.data.code === 0 && response2.data.msg){
      ElMessage.error(response2.data.msg.toString());
  }else ElMessage.error('添加专栏失败');
}

//提交文章的接口
async function postArticle(){
  const articleId = localStorage.getItem("articleId"); // 获取文章ID
  // 初始数据
  const first = ref({
    id:articleId,
    editorType:1,//markdown
  })
  const articleCon = ref({title:title.value,content:text.value});
  const submitData = toRaw(store.state.submitDate);
  const isValid = checkProperties(submitData, first.value, articleCon);
  if(isValid){
    ElMessage.error('未填写所有信息');
    return;
  }
  const data = {...submitData,...first.value,...articleCon.value}
  try {
    const response = await axios.post('/article', data);//发表文章接口
    if(response.data.code ===1) {
      ElMessage.success('发表文章成功');
      uploadColumn(articleId);
      submitState.value = '2';
    }else if(response.data.code === 0 && response.data.msg){
      ElMessage.error(response.data.msg.toString());
    }
    else ElMessage.error('发表文章失败');
  } catch (error) {
    console.log(error);
    ElMessage.error('发表文章失败');
  }
}

//保存草稿的接口
async function saveArticle(){
  const articleCon = ref({title:title.value,content:text.value})
  const articleId = localStorage.getItem("articleId"); // 获取文章ID
  const first = ref({
    id:articleId,
    editorType:0,//富文本编辑器
  })
  const data = {...first.value,...articleCon.value}
  try {
    const response = await axios.put('/article/draft', data);
    if(response.data.code ===1) {
      ElMessage.success('保存草稿成功');
      router.push('/CreateCenter');
    }else if(response.data.code === 0 && response.data.msg){
      ElMessage.error(response.data.msg.toString());
    }
    else ElMessage.error('保存草稿失败');
  } catch (error) {
    console.log(error);
    ElMessage.error('保存草稿失败');
  }
}

//获取文章内容
async function fetchArticleContent(id) {
  try {
    const response = await axios.get(`/article/${id}`);
    if ( response.data.code === 1) {
      article.value = response.data.data;
      text.value = article.value.content;
      title.value = article.value.title;
    } else if(response.data.code === 0 && response.data.msg){
      ElMessage.error(response.data.msg.toString());
    }else {
      console.error('无法找到匹配文章数据', response.data.msg || 'Unknown error');
      ElMessage.error('无法找到匹配文章数据');
    }
  } catch (error) {
    console.error('无法获取接口数据', error.message);
    ElMessage.error('无法找到匹配文章数据');
  }
}

onMounted(async () => {
  await fetchArticleContent(articleId);
});

</script>

<style scoped>
::v-deep .el-dialog{
  width: 900px;
  height: 640px;
  border-radius: 4px;
  box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.25);
}
::v-deep .el-dialog__body{
  padding: 0px;
}
::v-deep .el-dialog__header{
  padding: 0px;
}
::v-deep .large_submit {
  box-shadow: none
}
::v-deep .el-dialog{
  width: 1100px;
}
.body_bgc{
  background-color: #fdfbf6;
}
.header{
  width: 1100px;
  height: 65px;
  display: flex;
  align-items: center;
  margin: auto;
  background-color: #fff;
  border-bottom: 1px solid rgb(244 244 244);
}
.title{
  width: 740px;
  height: 20px;
  top: 10px;
  left: 108px;
  padding: 8px 16px 8px 16px;
  border-radius: 16px;
  border: 1px solid #DCDFE6;
  margin: 0px 40px;
}
.title:focus{
  outline: none;
}

.md-contain{
  width: 1100px;
  margin: auto;
}
.md{
  overflow:scroll;
}
/* .large_submit1{
    border-radius: 4px 4px 0px 0px;
    background: #fff;
    box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.25);
    width: 1020px;
    padding: 24px 40px 0px;
    display: flex;
    flex-direction: column;
    margin: 20px auto 0px;
    gap:20px
} */
label{
    color: #606266;
    font-family: Microsoft YaHei;
    font-size: 16px;
    margin-right: 80px;
    cursor: pointer;
}
/* .upload-container {
    display: flex;
    align-items: center;
}

.upload-label {
    cursor: pointer;
}
.file-container {
    min-width: 95px;
    min-height: 25px;
    border: 1px solid #bbbbbb;
    border-radius: 10px;
    padding: 5px 15px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
}
.file-name{
  font-size: 14px;
  color: #606266;
}
.box1{
  display: flex;
  width: 780px;
  height: 24px;
  align-items: center;
} */
/* .tclass{
    margin-right: 80px;
    color: #606266;
}
.moneyInput{
    margin-left: 94px;
}
.moneyInput span{
    font-size: 14px;
}
.moneyInput .el-input{
    width: 60px;
    margin: 0px 5px;
} */
.el-input__inner{
    text-align: center;
}
/* .image-container {
    width: 180px;
    height: 180px;
    border: 1px dashed #bbbbbb;
    border-radius: 10px;
    cursor: pointer;
    position: relative;
}
i.delete-btn2 {
  position: absolute;
  right: 5px;
  top: 8px;
  cursor: pointer;
}

.spic{
    background-size: cover;
    background-repeat: no-repeat;
    background-position: center center;
    width: 180px;
    height: 180px;
    border-radius: 10px;
    border: 1px dashed #bbbbbb;
} */
.foot{
  width: 100%;
  height: 38px;
  border-radius: 8px;
  border: 1px solid #DCDFE6;
  background: #FFF;
  position: fixed;
  bottom: 0;
  display: flex;
  align-items: center;
  padding: 0 10px 0 10px;
  
}
.b-1{
  display: inline-flex;
  padding: 8px 16px;
  justify-content: center;
  align-items: center;
  gap: 16px;
  border-radius: 16px;
  border: 1px solid #DCDFE6;
  margin-right: 10px;
  cursor: pointer;
}
.b-2{
  display: inline-flex;
  padding: 8px 16px;
  justify-content: center;
  align-items: center;
  gap: 16px;
  border-radius: 16px;
  border: #FFF;
  background: #9FA9CA;
  cursor: pointer;
}
.b-container{
  position: absolute;
  right: 40px;
}

</style>
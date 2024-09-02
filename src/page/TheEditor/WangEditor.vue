<template>
  <div class="body_bgc">
    <div class="large">
      <div style="  border-radius: 4px; box-shadow: 0px 2px 4px 0px rgba(0, 0, 0, 0.25);">
          <Toolbar
            style="border-bottom: 1px solid #ccc;width: 1100px;"
            :editor="editorRef"
            :defaultConfig="toolbarConfig"
            :mode="mode"
          />
          <div class="header">
            <input type="text" placeholder="请输入文章标题" class="title" v-model="title">
          </div>
          <div style="background-color: #fff;height: 65vh;overflow-y: auto;overflow-x: hidden;">
            <Editor
              style="width: 1020px;height: auto;margin-top: 0px;padding: 0px 40px 40px;"
              v-model="valueHtml"
              v-add
              :defaultConfig="editorConfig"
              :mode="mode"
              @onCreated="handleCreated"
              class="content"
            />
          </div>
      </div>
    </div>
    <PictureAndAttachment :Submit = "submitState"></PictureAndAttachment>
    <div class="drawer-btn">
      <el-button   
        class="top-right-button" 
        type="primary" 
        @click="drawer = true">
        <el-icon><DArrowLeft /></el-icon>
      </el-button>
    </div>
    <el-drawer
      v-model="drawer"
      :direction="direction"
      :before-close="handleClose"
      :show-close="false"
      :modal="false"
      :lock-scroll="false"
    >
        <template #title>
            <div class="custom-title-class">文章目录</div>
        </template>
        <img src="@/assets/TheEditor/CloseCatalog.svg" class="custom-close-btn" @click="drawer = false">
        <div v-for="(articlemenu, index) in menuList" :key="index">
          <span :id="articlemenu.id" 
            :class="articlemenu.level === 1 ? 'h1-class' : 'other-class'"
            @click="scrollTo(articlemenu.id)"
          >
            {{ articlemenu.title }}
          </span>
        </div>
    </el-drawer>
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
import '@wangeditor/editor/dist/css/style.css' // 引入 css
import { onBeforeUnmount,ref, onMounted,shallowRef, watch,reactive,toRaw} from 'vue'
import { Editor , Toolbar } from '@wangeditor/editor-for-vue'
import { myButtonMenu } from '@/utils/wangEditor.js'
import { Boot } from '@wangeditor/editor'
import { useStore } from 'vuex';
import axios from '@/utils/request'
import ToSubmit from './components/ToSubmit.vue'
import formulaModule from '@wangeditor/plugin-formula'
import { ElMessage,ElMessageBox } from 'element-plus';
import PictureAndAttachment from '@/page/TheEditor/PictureAndAttachment.vue';
import { useRouter } from 'vue-router';
import {compressImage} from '@/utils/fileService';
import {getArticleContentPermission} from '@/utils/cosService';

const title = ref();
const store = useStore();
const submitState = ref('1');
const router = useRouter();

  // 注册。要在创建编辑器之前注册，且只能注册一次，不可重复注册。
  if (!store.getters.hasRegisteredMenu) {
    Boot.registerModule(formulaModule);
    Boot.registerMenu(myButtonMenu);
    store.dispatch('registerMenu');
}
  // 编辑器实例，必须用 shallowRef
  const editorRef = shallowRef()
  // 内容 HTML
  const valueHtml = ref('<p></p>')
  // 设置弹出框相关参数
  const toolbarConfig = {insertKeys: {
    index: 34, // 插入的位置，基于当前的 toolbarKeys
    keys: [
      'create',
      'insertFormula'],
  }}
  const editorConfig = { 
    placeholder: '请输入内容(注意，markdown与富文本切换时不会自动保存数据，若要更换编辑器，请先保存草稿！)...',
    MENU_CONF: {
      uploadImage: {
        async customUpload(file, insertFn) {   
          const articleId = localStorage.getItem("articleId"); // 获取文章ID
          const timestamp = new Date().getTime(); // 获取当前时间戳
          const filePictureName = `${timestamp}-${file.name}`; // 在文件名前加时间戳
          const compressedFile = await compressImage(file);
          const url = await getArticleContentPermission(compressedFile,articleId,filePictureName);
          insertFn(url);
        }
      }
    },
    hoverbarKeys: {
    formula: {
      menuKeys: ['editFormula'], // “编辑公式”菜单
    },
    }, 
  }


// 组件销毁时，也及时销毁编辑器
onBeforeUnmount(() => {
    const editor = editorRef.value
    if (editor == null) return
    editor.destroy()
})

const handleCreated = (editor) => {
  editorRef.value = editor // 记录 editor 实例，重要
}
 
/**
 * 这里定义了一些目录相关的参数
 * 以及目录关闭时调用的方法
 * 以及，你也想哈哈吗
 */
  const drawer = ref(false)
  const direction = ref('rtl')
  const menuList = ref([])
  const handleClose = (done) => {
    ElMessageBox.confirm('哈哈，你也想关目录吗')
      .then(() => {
        done();
      })
      .catch(() => {
      });
  };

  const handlerMenu = () => {
    let content = document.querySelector(".content")
    let els = content.querySelectorAll("h1,h2,h3,h4,h5,h6")
    let menus = []
    if (els) {
      els.forEach((item, index) => {
        let menu = {}
        menu.isActive = null
        menu.title = item.innerText
        menu.scrollTop = item.offsetTop
        let level = item.tagName.toLowerCase().replace("h", "")
        menu.level = parseInt(level)
        item.setAttribute("id", `menus_${index+1}`)
        menu.id = `#menus_${index+1}`
        menus.push(menu)
      })
    }
    menuList.value = menus
  }

  const scrollTo = (id) => {
      const element = document.querySelector(id);
      if (element!==0) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
  };

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

//将文章添加到专栏接口
async function uploadColumn(id) {
  const response2 = await axios.post('/column/article', {
    columnId:store.state.submitColumnId,
    contentId:id
  });
  if(response2.data.code ===1){
    // ElMessage.success('添加专栏成功');
  }
  else if(response2.data.code === 0 && response2.data.msg){
      ElMessage.error(response2.data.msg.toString());
  }else ElMessage.error('添加专栏失败');
}

//提交文章的接口
async function postArticle(){
  const articleId = localStorage.getItem("articleId"); // 获取文章ID
  // 传送数据
  let articleCon = reactive({
    get title(){ return title.value},
    get content(){ return valueHtml.value}
  })
  const first = ref({
    id:articleId,
    editorType:0,//富文本编辑器
  })
  const submitData = toRaw(store.state.submitDate);
  const isValid = checkProperties(submitData, first.value, articleCon);
  if(isValid){
    ElMessage.error('未填写所有信息');
    return;
  }
  const data = {...submitData,...first.value,...articleCon};
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
  const articleId = localStorage.getItem("articleId"); // 获取文章ID
  // 传送数据
  let articleCon = reactive({
    get title(){ return title.value},
    get content(){ return valueHtml.value}
  })
  const first = ref({
    id:articleId,
    editorType:0,//富文本编辑器
  })
  const data = {...first.value,...articleCon}
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


watch(valueHtml, () => {
  handlerMenu();
});

onMounted(() => {
  // 组件挂载时生成初始目录
  handlerMenu();
});


</script>
  
<style scoped>

.body_bgc{
  background-color: #fdfbf6;
}
.large{
  width: 1100px;
  margin: 0px auto 20px;
  z-index:1;
}
.header{
  width: 1100px;
  height: 70px;
  display: flex;
  align-items: center;
  margin: auto;
  background-color: #fff;
}
.title{
  width: 100%;
  height: 30px;
  padding: 20px 30px 15px 30px;
  border-radius: 16px;
  border: none;
  margin: 0px 20px;
  font-size: 20px;
  font-weight: 700;
  border-bottom: 1px solid rgb(244 244 244);
}
.title:focus{
  outline: none;
}
label{
    color: #606266;
    font-family: Microsoft YaHei;
    font-size: 16px;
    margin-right: 80px;
    cursor: pointer;
}
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
  color: #000000;
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
  color: #000000;
}
.b-container{
  position: absolute;
  right: 40px;
}
.drawer-btn .el-button {
    width: 22px;
    height: 60px;
    padding:3px;
    background-color: #fff;
    box-shadow: 0 0 10px rgb(0 0 0 / 15%);
    border: none;
}
::v-deep .top-right-button .el-icon svg{
  color: black !important;;
}
.top-right-button {
  position: fixed; 
  top: 40%; 
  right: 0px; 
}
.custom-close-btn {
  position: absolute;
  top: 25px;
  right: 15px;
  cursor: pointer;
}
.custom-title-class {
  color: black; /* 修改标题颜色 */
  font-size: 24px; /* 修改标题字体大小 */
  font-family: '黑体', 'Heiti', sans-serif; /* 修改标题字体 */
}

.h1-class{
  color: #595959;
  font-size: 18px; /* 修改文本字体大小 */
  line-height: 2;
  font-family: '宋体', 'SongTi', sans-serif;
  cursor: pointer;
}

.other-class{
  color: #595959;
  font-size: 18px; /* 修改文本字体大小 */
  line-height: 1.5;
  font-family: '宋体', 'SongTi', sans-serif;
  padding-left: 20px;
  cursor: pointer;
}
::v-deep .top-right-button{
  color: #000000;
  background-color: #9fa9ca;
  border-color: #9199b2;
}
::v-deep .other-class::before {
  content: '';  /* 没有内容 */
  display: inline-block;
  width: 3px;  /* 黑点的宽度 */
  height: 3px;  /* 黑点的高度 */
  background-color: #595959;  /* 黑点的颜色 */
  border-radius: 50%;  /* 使黑点呈圆形 */
  margin-right: 8px;  /* 与文本内容之间的间距 */
  vertical-align: middle; /* 使黑点居中 */
}
::v-deep .el-drawer__close-btn{
  color: #000000;
}
::v-deep .h1-class::before {
  content: '';  /* 没有内容 */
  display: inline-block;
  width: 6px;  /* 黑点的宽度 */
  height: 6px;  /* 黑点的高度 */
  background-color: #595959;  /* 黑点的颜色 */
  border-radius: 50%;  /* 使黑点呈圆形 */
  margin-right: 8px;  /* 与文本内容之间的间距 */
  vertical-align: middle; /* 使黑点居中 */
}

</style>
  
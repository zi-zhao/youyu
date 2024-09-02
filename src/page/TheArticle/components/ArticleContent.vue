<template>
  <div class="main-container">
    <div class="content-container">
      <!-- 富文本编辑器获取到的内容 -->
      <div ref="container"  v-html="content" class="html-content"></div>
      <!-- 若未付费文章且用户未购买，则显示 -->
      <div v-if="!showFullContent" class="cover-box">
        <div class="hidden-part"></div>
        <div class="expand-icon" @click="purseArticleDialogVisible = true">
          点击获取全部文章内容<img style="margin-left: 5px;" src="@/assets/QACenter/QuestionMark.svg" alt="">
        </div>
      </div>
      <!-- markdown编辑器获取到的内容 -->
      <div v-if="articleData.editorType === 1" style="position: relative;">
        <v-md-editor :model-value="articleData.content" mode="preview"></v-md-editor>
        <!-- 若未付费文章且用户未购买，则显示 -->
        <div v-if="!showFullContent" class="cover-box" style="z-index: 9;">
          <div class="hidden-part"></div>
          <div class="expand-icon" style="height: 90%;" @click="purseArticleDialogVisible = true">
            点击获取全部文章内容<img style="margin-left: 5px;" src="@/assets/QACenter/QuestionMark.svg" alt="">
          </div>
        </div>
      </div>
      <div class="transshipment" v-if="articleData.type!=0" >
          <span style="font-size: 0.8rem;color: #9b9b9b;">本文转自</span>
          <el-link :href="articleData.originalArticle" type="primary" target="_blank">{{ articleData.originalArticle }}</el-link>
      </div>
      <!-- 转发 -->
      <div class="transpond">
        <img  src="@/assets/TranspondGray.svg" style="width: 14px;height: 14px;" @click="copyCurrentUrl">
        <span @click="copyCurrentUrl">复制链接</span>
      </div>
      <!-- 举报 -->
      <div class="report" @click="dialogVisible = true">
          <img src="@/assets/Report.svg" alt="" style="width: 14px;height: 14px;">
          <span>文章举报</span>
      </div>
      <div v-if="dialogVisible">
          <AreportedDialog v-model="dialogVisible" :id = "articleId" :type = "type" ></AreportedDialog>
      </div>
        <!-- 文章目录和目录按钮 -->
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
        :modal="false"
        :lock-scroll="false"
        class="drawer"
        :style="{ top: '40px' }" 
      >
          <template #title>
            <div class="custom-title-class">文章目录</div>
          </template>
          <div v-for="(articlemenu, index) in menuList" :key="index">
            <span :id="articlemenu.id" 
              :class="articlemenu.level === 1 ? 'h1-class' : 'other-class'"
              @click="scrollTo(articlemenu.id)">
              {{ articlemenu.title }}
            </span>
          </div>
      </el-drawer>
    </div>
  </div>
  <el-dialog v-model="purseArticleDialogVisible" style="width: 40%;">
      <div class="centered-content">
        <el-icon><Document /></el-icon>
        <p>{{ articleData.title }}</p>
      </div>
      <div v-if="articleCostType === 0 "  class="flex-container">
        <p>支付</p>
        <span class="attachment-money">{{ articleCost }}</span>
        <p>个鱼饵以购买该文章</p>
      </div>
      <div v-if="articleCostType === 1 " class="flex-container">
        <p>支付</p>
        <span class="attachment-money">{{ articleCost }}</span>
        <p>个渔币以购买该文章</p>
      </div>
      <div class="button-container">
        <YyButton theme="purple" style="padding: 6px 15px;" @click="loadFile">确定支付</YyButton>
        <YyButton theme="gray" style="padding: 6px 15px;" @click="purseArticleDialogVisible = false">取消</YyButton>
      </div>
    </el-dialog>
</template>

<script setup>
import { ElMessage } from 'element-plus';
import { ref,onMounted, onBeforeUnmount,watchEffect} from 'vue';
import axios from '@/utils/request';
import AreportedDialog from '@/page/components/AreportedDialog.vue';
import { useRoute  } from 'vue-router'
import YyButton from "@/page/components/YyButton.vue";

const container = ref(null);//目录相关参数
const menuList = ref([]);//目录相关参数
const drawer = ref(false);//目录相关参数
const direction = ref('rtl');//目录相关参数

const type = 0;
const route = useRoute ();
const articleId = parseInt(route.params.id,10);//路径中的文章ID
const articleData = ref({})
const dialogVisible = ref(false);//控制文章举报弹框是否显示
const purseArticleDialogVisible = ref(false)//购买文章弹框
const articleCostType = ref();//购买文章所需货币类型
const articleCost = ref();//购买文章所需货币
const showFullContent = ref(false);

//判断文章购买状态
async function deterArticlePurchase() {
  try {
    const response = await axios.get(`/article/purchaseLog/${articleId}`);
    if (response.data.code === 1 && response.data.data === 1) {
      showFullContent.value = true;
    } else if(response.data.code === 0 && response.data.msg){
        ElMessage.error(response.data.msg.toString());
    }else {
      console.error(response.data.msg || 'Unknown error');
    }
  } catch (error) {
    console.error('判断文章购买状态失败', error.message);
  }
}

//购买文章接口
async function loadFile() {
  try {
    const response = await axios.post(`/article/purchase/${articleId}`);
    if (response.data.code === 1) {
        ElMessage.success('购买文章成功');
        showFullContent.value = true;
        purseArticleDialogVisible.value = false
        await fetchArticleContent(articleId);
    } else if(response.data.code === 0 && response.data.msg){
        ElMessage.error(response.data.msg.toString());
    }else {
      console.error('购买文章失败,未知的错误', response.data.msg || 'Unknown error');
      ElMessage.error('购买文章失败，未知的错误');
    }
  } catch (error) {
    console.error('购买文章失败，未知的错误', error.message);
    ElMessage.error('购买文章失败，未知的错误');
  }
}

//获取文章内容
async function fetchArticleContent(id) {
  try {
    const response = await axios.get(`/article/${id}`);
    if ( response.data.code === 1) {
      articleData.value =  response.data.data;
      articleData.value.content = articleData.value.content.replace(/\\"/g, '"'); // 正确地替换掉转义的双引号
      if(response.data.data.requiredCoin!= 0){
        articleCostType.value = 1;
        articleCost.value = response.data.data.requiredCoin;
      }else if(response.data.data.requiredPoint!= 0){
        articleCostType.value = 0;
        articleCost.value = response.data.data.requiredPoint;
      }else{
        showFullContent.value = true;
      }
    } else if(response.data.code === 0 && response.data.msg){
        ElMessage.error(response.data.msg.toString());
    }else {
    console.error('获取文章数据失败', response.data.msg || 'Unknown error');
    ElMessage.error('获取文章数据失败');
    }
  } catch (error) {
    console.error('网络错误:', error.message);
    ElMessage.error('获取文章数据失败');
  }
}

 //文章转发的计数功能
 async function articleForward() {
    try {
      const queryParams = new URLSearchParams({
        articleId: Number(articleId),
      }).toString();
      const response = await axios.post(`/article/forward?${queryParams}`);
      if (response.data.code === 1) {
        // ElMessage.success('文章转发成功')
      } else if(response.data.code === 0 && response.data.msg){
          ElMessage.error(response.data.msg.toString());
      }else {
        console.error('文章转发失败', response.data.msg || 'Unknown error');
        ElMessage.error('文章转发失败');
      }
    } catch (error) {
      console.error('文章转发失败:', error.message);
      ElMessage.error('文章转发失败');
    }
  }

  //复制链接的函数
  function copyToClipboard(text) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(function() {
        ElMessage.success('文章链接已复制到您的剪切板');
        articleForward();
      }, function(err) {
        console.error('复制链接失败', err);
        ElMessage.error('复制链接失败');
      });
    } else {
      const textArea = document.createElement('textarea');
      textArea.style.position = 'absolute';
      textArea.style.left = '-9999px';
      textArea.style.opacity = '0';
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        const successful = document.execCommand('copy');
        if(successful){
          ElMessage.success('文章链接已复制到您的剪切板');
          articleForward();
        }else{
          ElMessage.error('复制链接失败');
        }
      } catch (err) {
        console.error('复制链接失败', err);
        ElMessage.error('复制链接失败');
      }
      document.body.removeChild(textArea);
    }
  }


  // 定义一个方法用于复制当前页面的URL
  const copyCurrentUrl = () => {
    copyToClipboard(window.location.href);
  };

const tagToLevel = (tagName) => {
  return parseInt(tagName.toLowerCase().replace("h", ""));
};

  /**
   * 遍历生成目录,这里多写一点注释，这里的目录生成和编辑器那里的目录生成有个很大的不同点
   * 编辑器那里的目录里的内容直接由编辑器封装好的样式里拿，在那个页面应该被起名为content
   * 而那个content本身就是一个DOM，所以可以用queryselectorall这个方法，很方便。
   * 但是这个页面的content.value是一个HTML的字符串，必须先转化为DOM元素才能用queryselectorall方法
   * 这里是在第九行代码的div中（展示文章内容的盒子）加入了ref container
   */
const handlerMenu = () => {
  if (container.value) {
    const els = container.value.querySelectorAll("h1,h2,h3,h4,h5,h6");
    if (els) {
      menuList.value = Array.from(els).map((item, index) => {
        const id = `menus_${index + 1}`;
        item.setAttribute("id", id);
        return {
          isActive: null,
          title: item.innerText,
          scrollTop: item.offsetTop,
          level: tagToLevel(item.tagName),
          id: `#${id}`
        };
      });
    }else{
      console.error('content is not initialized or content.value is falsy');
      ElMessage.error('生成目录失败');
    }
  }
}

//页面滚动接口
const scrollTo = (id) => {
    const element = document.querySelector(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }else{
    ElMessage.error('滚动目录失败');
    }
};

onMounted(() => {
  deterArticlePurchase();
  fetchArticleContent(articleId);
  const stopWatchEffect = watchEffect(() => {
    if (articleData.value.content && articleData.value.editorType === 0) {
      container.value.innerHTML = articleData.value.content;
      handlerMenu();
    } else {
      console.error('container.value is null');
    }
  });
  onBeforeUnmount(() => {
    stopWatchEffect();
  });
});


</script>

<style scoped>
.main-container {
  box-shadow: 0px 4px 8px 0px rgba(0, 0, 0, 0.25);
  display: flex;
  justify-content: space-between; 
  align-items: flex-start; 
  width: 1020px;
  margin: 20px auto 0px;
  padding: 30px 60px 50px;;
  position: relative;
}

.content-container {
  display: flex;
  flex-direction: column;
  gap: 20px; 
  width: 100%;
  position: relative;
}
.html-content{
  width: 100%;
}
.cover-box{
  width: 100%;
  height: 65px;
  position: absolute;
  bottom: 28px;
}
.hidden-part{
  height: 17%;
  background: rgb(255 255 255 / 90%);
}
.expand-icon{
  height: 83%;
  cursor: pointer;
  background: #fff;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #3779c6;
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
.transshipment {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: -1rem;
    margin: 2rem 0 -2rem;
}
:deep .el-link.el-link--primary,
:deep .el-link__inner{
    --el-link-text-color: #3779c9;
    color: #3779c9;
    font-size: 0.8rem;
}
.transpond{
  display: flex;
  align-items: center;
  gap: 5px;
  cursor: pointer;
  position: absolute;
  right: -45px;
  bottom: -22px;
  margin-bottom: 0.3rem;
}
.report{
  display: flex;
  align-items: center;
  gap: 5px;
  cursor: pointer;
  position: absolute;
  right: -45px;
  bottom: -40px;
}
.report span,
.transpond span{
  color: #9B9B9B;
  font-size: 12px;
}
:deep .el-drawer.rtl {
  width: 30%;
}
/* 购买文章弹框 */
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
  margin-top: 20px;
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
  .main-container{
      width: auto;
      margin: 20px auto 0;
      padding: 1rem 1rem 1.2rem;
  }
  :deep .el-drawer.rtl {
    width: 90% !important;
  }
  .transpond{
      right: 0.3rem;
      bottom: 0.5rem;
  }
  .report{
      right: 0.3rem;
      bottom: -0.8rem;
  }
}
</style>
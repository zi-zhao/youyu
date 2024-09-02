<template>
  <div class="large_submit1">
      <div class="upload-container row" style="margin-right: 200px;">
        <!-- 将上传的输入框隐藏 -->
        <input type="file" ref="fileInput" @change="onFileChange" hidden>
        <label for="fileInput" class="upload-label">
            上传附件
        </label>
        <div class="file-container" @click="triggerFileInput" >
            <div v-if="selectedFiles.length >0" style="display: flex; align-items: center; gap: 5px;">
                <el-icon><Document /></el-icon>
                <div class="file-name">{{ fileName }}</div>
            </div>
            <el-icon v-else style="font-size: 20px;"><Link /></el-icon>
        </div>
      </div>
      <div class="box1" v-if="selectedFiles.length >0">
          <span class="tclass">附件收费<span class="nes-star">*</span></span>
          <div class="my-2 flex items-center text-sm">
          <el-radio-group v-model="fileCharge" class="radio_share">
              <el-radio label=0>免费</el-radio>
              <el-radio label=1>收费</el-radio>
          </el-radio-group>
          </div>
      </div>

      <div class="box1" v-show="fileCharge === '1'">
          <span class="tclass">支付方式<span class="nes-star">*</span></span>
          <div class="my-2 flex items-center text-sm">
          <el-radio-group v-model="fileCost" class="radio_share">
              <el-radio label=0>鱼饵</el-radio>
              <el-radio label=1>渔币</el-radio>
          </el-radio-group>
          </div>
          <div class="moneyInput" v-show="fileCost === '0'">
              <span>需支付</span>
              <el-input type="text" v-model="requiredCoin" placeholder="请填写支付数量"></el-input>
              <span>个鱼饵</span>
          </div>
          <div class="moneyInput" v-show="fileCost === '1'">
              <span>需支付</span>
              <el-input type="text" v-model="requiredPoint" placeholder="请填写支付数量"></el-input>
              <span>个渔币</span>
          </div>
      </div>
      
      <div class="upload-container row" >
          <label for="imageInput" class="upload-label" style="margin-right: 48px;position: relative;">
              上传封面图片<span class="nes-star">*</span>
          </label>
          <!-- 将上传的输入框隐藏 -->
          <input type="file" ref="imageInput"  style="display: none;" @change="handleImage"  >
          
          <div v-if="imagePreviews.length === 0" @click="triggerImageUpload" class="image-container" >
          <el-icon  style="position: absolute; left: 70px; top: 70px;font-size: 40px;cursor: pointer;"><Plus /></el-icon>
          </div>
          <div  class="pic_contain ">
          <div v-for="(imagePreview, index) in imagePreviews" :key="index" class="spic" :style="{ backgroundImage: `url(${imagePreview})` }">
              <el-icon  class="delete-btn2" @click="removeImage(index)"><CircleCloseFilled /></el-icon>
          </div>
          </div> 
      </div>
  </div>
</template>

<script setup>
import { ElMessage } from 'element-plus';
import { ref,defineProps, watchEffect} from 'vue';
import {compressImage} from '@/utils/fileService';
import {getArticleCOSPermission,getArticleCoveragePermission} from '@/utils/cosService';
import { useRouter,useRoute} from 'vue-router';

const props = defineProps({
Submit: String,
});
const router = useRouter();
const route = useRoute();
const watchType = ref(0);
const articleId = parseInt(route.params.id,10);//路径中的文章ID
//设置上传图片
const filePictureName = ref();
const imagePreviews = ref([]);
const imageInput = ref(null);  
const selectedImages = ref([]);

// 设置上传文件
const fileName = ref("");
const fileExtension = ref("");
const fileInput = ref(null);  
const fileSize = ref();
const selectedFiles = ref([]);

const fileCharge = ref();
const fileCost = ref();
const requiredCoin = ref(0);//附件支付（鱼饵）
const requiredPoint = ref(0);//附件支付（渔币）
const CHUNK_SIZE = 5 * 1024 * 1024;

// (上传图片)当点击按钮时触发文件输入框
const triggerImageUpload = () => {
  if (selectedImages.value.length < 2) {
      imageInput.value.click();
  } else {
      ElMessage.error('只能提交一张照片');
  }
};

//  (上传图片)当文件选择后处理图片
const handleImage = async (event) => {
const files = event.target.files;
for (const file of files) {
  if (selectedImages.value.length < 2) {
    try {
      const timestamp = new Date().getTime(); // 获取当前时间戳
      filePictureName.value = `${timestamp}-${file.name}`; // 在文件名前加时间戳
      const compressedFile = await compressImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        imagePreviews.value.push(e.target.result);
        selectedImages.value.push(compressedFile);
      };
      reader.readAsDataURL(compressedFile);
    } catch (error) {
      console.error(error);
    }
  }
}
};

//删除图片
const removeImage = (index) => {
  selectedImages.value.splice(index, 1);
  imagePreviews.value.splice(index, 1);  // 也删除对应的预览
};


//发送文章主图接口
async function uploadArticlePicture() {
try {
  await getArticleCoveragePermission( selectedImages.value[0],filePictureName.value,articleId);
  watchType.value++;
} catch (error) {
  console.error("保存图片失败", error); 
  ElMessage.error('保存图片失败');
}
}

// 上传附件
const onFileChange = (event) => {
selectedFiles.value = [];
const file = event.target.files[0];
if (file) {
  selectedFiles.value = [file];  // 直接将文件对象添加到 selectedFiles
  fileName.value = file.name;    // 获取并设置文件名
  fileExtension.value = file.name.split('.').pop();  // 获取并设置文件扩展名
  fileSize.value = file.size;    // 获取并设置文件大小
}
}
const triggerFileInput = () => {
  fileInput.value.click();
};

//向后端请求下载当前附件的许可证
async function getattachmentPermission() {
  if(fileCharge.value == 0){
      requiredPoint.value = 0;
      requiredCoin.value = 0;
  }else if(fileCost.value == 0){
      requiredCoin.value = 0;
  }else{
      requiredPoint.value = 0;
  }
  const file = selectedFiles.value[0]; // 获取数组中的第一个文件对象
  await getArticleCOSPermission(file,CHUNK_SIZE,articleId,fileName.value,fileSize.value, requiredCoin.value, requiredPoint.value,1);
}


watchEffect(() => {
  (async () => { 
    if (props.Submit == '2') {
      await uploadArticlePicture();
      if( selectedFiles.value >0){
        await getattachmentPermission(); // 确保先执行并成功获取数据
      }else{
        watchType.value++;
      }
    }
  })();
  if(watchType.value == 2){
    router.push('/CreateCenter');
  }
});

</script>

<style scoped>
.large_submit1{
  border-radius: 4px 4px 0px 0px;
  background: #fff;
  box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.25);
  width: 1020px;
  padding: 24px 40px 0px;
  display: flex;
  flex-direction: column;
  margin: 20px auto 0px;
  gap:20px
}
label{
  color: #606266;
  font-family: Microsoft YaHei;
  font-size: 16px;
  margin-right: 80px;
  cursor: pointer;
}
.upload-container {
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
}
.nes-star{
    color: #de0000;
    position: absolute;
    left: -15px;
    top: 2px;
    font-size: 20px;
}
.tclass{
  margin-right: 80px;
  color: #606266;
  position: relative;
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
}
.el-input__inner{
  text-align: center;
}
.image-container {
  width: 180px;
  height: 180px;
  border: 1px dashed #bbbbbb;
  border-radius: 10px;
  cursor: pointer;
  position: relative;
}
.pic_contain{
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
}
.plus-sign {
font-size: 2rem;
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
<!-- 创作中心——专栏和收藏管理——新建-->
<template>
    <div>
        <el-dialog v-model="localDialogVisible" :title="ClassifyName + '信息'" style="width: 60%; height: 80%; min-height: 500px; margin-top: 10vh;">
            <div class="container">
                <!-- 添加封面 -->
                <div class="coverage">
                    <span class="pictext">封面</span>          
                    <div class="picshow">
                      <input type="file" ref="fileInput" accept="image/*" style="display: none;" @change="handleImage" />
                      <!-- 如果没有图片预览，则显示上传提示 -->
                      <div v-if="imagePreviews.length === 0" @click="triggerImageUpload" class="tpic" >
                        <el-icon  style="position: absolute; left: 70px; top: 70px;font-size: 40px;cursor: pointer;"><Plus /></el-icon>
                      </div>
                      
                      <!-- 如果有图片预览，则全屏显示图片 -->
                      <div  class="pic_contain ">
                        <div v-for="(imagePreview, index) in imagePreviews" :key="index" class="spic" :style="{ backgroundImage: `url(${imagePreview})` }">
                          <el-icon class="delete-btn" @click="removeImage(index)"><CircleCloseFilled /></el-icon>
                        </div>
                      </div>
                    </div>
                </div>
                <!-- 专栏/收藏名称 -->
                <div class="ptitie">
                    <span class="pictext">名称</span>               
                    <el-input
                    v-model="text1"
                    maxlength="20"
                    placeholder="填写标题，可能会让更多人感兴趣~"
                    show-word-limit
                    type="text"
                    class="input_el"
                    />  
                </div>
                <!-- 专栏/收藏简介 -->
                <div class="mainp">
                    <span class="pictext">简介</span>
                    <el-input
                    v-model="textarea1"
                    maxlength="150"
                    placeholder="分享一下最近的趣事或心情吧"
                    show-word-limit
                    type="textarea"
                    size="large"
                    resize="none"
                    :autosize = "{ minRows: 2, maxRows: 30 }"
                    class="input_el"
                    />
                </div>
                <!-- 是否展示专栏/收藏 -->
                <el-checkbox v-model="checked">展示{{ ClassifyName }}</el-checkbox>
            </div>
            <template #footer>
              <span class="dialog-footer">
                  <el-button @click="localDialogVisible = false">Cancel</el-button>
                  <el-button type="primary" @click = submitData>
                  提交
                  </el-button>
              </span>
            </template>
        </el-dialog>
    </div>
</template>

<script setup>
import { ElMessage } from 'element-plus';
import { defineProps, ref,defineEmits,watchEffect,computed} from "vue";
import axios from '../../utils/request';
import {compressImage} from '@/utils/fileService';
import { getFavoritePermission,getColumnPermission} from '@/utils/cosService';

const props = defineProps({
    ClassifyName: String,
    modelValue: Boolean,
});
const emit = defineEmits(['update:modelValue']);
const localDialogVisible = ref(props.modelValue);
watchEffect(() => {
  if (localDialogVisible.value !== props.modelValue) {
    emit('update:modelValue', localDialogVisible.value);
  }
});

const checked = ref(true) 
const text1 = ref();
const textarea1 = ref();

const fileName = ref();
const fileInput = ref(null);
const selectedImages = ref([]);
const imagePreviews = ref([]);

const visibility = computed(() => {
    return checked.value ? 1 : 0;
});

const data1 = computed(() => ({
  name:text1.value,
  profile:textarea1.value,
  type:0,
  visibility:visibility.value
}));
const data2 = computed(() => ({
  name:text1.value,
  profile:textarea1.value,
  type:1,
  visibility:visibility.value
}));

// 当点击按钮时触发文件输入框
const triggerImageUpload = () => {
  if (selectedImages.value.length < 2) {
    fileInput.value.click();
  } else {
    ElMessage.error('只能提交一张照片');
  }
};

// 当文件选择后处理图片
const handleImage = async (event) => {
  const file = event.target.files[0];
  if (file && selectedImages.value.length < 2) {
    const timestamp = new Date().getTime(); // 获取当前时间戳
    fileName.value = `${timestamp}-${file.name}`; // 在文件名前加时间戳
    const compressedFile = await compressImage(file);
    const reader = new FileReader();
    reader.onload = function(e) {
      imagePreviews.value.push(e.target.result);  // 添加DataURL到imagePreviews
      selectedImages.value.push(compressedFile);  // 添加文件对象到selectedImages
    };
    reader.readAsDataURL(compressedFile);
  }
};

//删除图片
const removeImage = (index) => {
    selectedImages.value.splice(index, 1);
    imagePreviews.value.splice(index, 1);  // 也删除对应的预览
};


//根据父组件传回的classifyname判断应该调用的接口类型（这个方法只是增加一个判断值）
const submitData = () => {
  if(props.ClassifyName === "文章专栏"){
    setArticleColumn(data1.value);
    localDialogVisible.value = false;
  }else if(props.ClassifyName === "分享专栏"){
    setShareColumn(data2.value);
    localDialogVisible.value = false;
  }else if(props.ClassifyName === "文章收藏"){
    setArticleFavorite(data1.value);
    localDialogVisible.value = false;
  }else if(props.ClassifyName === "分享收藏"){
    setShareFavorite(data2.value);
    localDialogVisible.value = false;
  }
}

//新建文章专栏
async function setArticleColumn(data) {
  try {
        const response = await axios.post('/column', data);
        if (response.data && response.data.code === 1) {
            const responseData = response.data.data;
            await getColumnPermission( selectedImages.value[0],fileName.value,responseData);
            // const secondUrl = `/file/column/${responseData}`;
            // const formData = new FormData();
            // selectedImages.value.forEach((image) => {
            //     formData.append('file', image); 
            // });
            // const secondResponse = await axios.post(secondUrl, formData);
            // console.log(secondResponse.data.code);
        } else if(response.data.code === 0 && response.data.msg){
            ElMessage.error(response.data.msg.toString());
        }else {
            console.error('新建文章专栏失败', response.data.msg);
            ElMessage.error('新建文章专栏失败');
        }
  } catch (error) {
      console.error("新建文章专栏接口失败", error); 
      ElMessage.error('新建文章专栏接口失败');
  }
}
//新建分享专栏
async function setShareColumn(data) {
  try {
        const response = await axios.post('/column', data);
        console.log(response);
        if (response.data && response.data.code === 1) {
            const responseData = response.data.data;
            await getColumnPermission( selectedImages.value[0],fileName.value,responseData);
            // const secondUrl = `/file/column/${responseData}`;
            // const formData = new FormData();
            // selectedImages.value.forEach((image) => {
            //     formData.append('file', image); 
            // });
            // const secondResponse = await axios.post(secondUrl, formData);
            // console.log(secondResponse.data.code);
        } else if(response.data.code === 0 && response.data.msg){
            ElMessage.error(response.data.msg.toString());
        }else {
            console.error('新建分享专栏失败', response.data.msg);
            ElMessage.error('新建分享专栏失败');
        }
    } catch (error) {
        console.error("新建分享专栏接口失败", error); 
        ElMessage.error('新建分享专栏接口失败');
    }
}
//新建文章收藏
async function setArticleFavorite(data) {
  try {
        const response = await axios.post('/favorite', data);
        console.log(response);
        if (response.data && response.data.code === 1) {
            const responseData = response.data.data;
            await getFavoritePermission( selectedImages.value[0],fileName.value,responseData);
            // const secondUrl = `/file/favorite/${responseData}`;
            // const formData = new FormData();
            // selectedImages.value.forEach((image) => {
            //     formData.append('file', image); 
            // });
            // const secondResponse = await axios.post(secondUrl, formData);
            // console.log(secondResponse.data.code);
        } else if(response.data.code === 0 && response.data.msg){
            ElMessage.error(response.data.msg.toString());
        }else {
            console.error('新建文章收藏失败', response.data.msg);
            ElMessage.error('新建文章收藏失败');
        }
    } catch (error) {
        console.error("新建文章收藏接口失败", error); 
        ElMessage.error('新建文章收藏接口失败');
        
    }
}
//新建分享收藏
async function setShareFavorite(data) {
  try {
        const response = await axios.post('/favorite', data);
        console.log(response);
        if (response.data && response.data.code === 1) {
            const responseData = response.data.data;
            await getFavoritePermission( selectedImages.value[0],fileName.value,responseData);
            // const secondUrl = `/file/favorite/${responseData}`;
            // const formData = new FormData();
            // selectedImages.value.forEach((image) => {
            //     formData.append('file', image); 
            // });
            // const secondResponse = await axios.post(secondUrl, formData);
            // console.log(secondResponse.data.code);
        } else if(response.data.code === 0 && response.data.msg){
            ElMessage.error(response.data.msg.toString());
        }else {
            console.error('新建分享收藏失败', response.data.msg);
            ElMessage.error('新建分享收藏失败');
        }
    } catch (error) {
        console.error("新建分享收藏接口失败", error); 
        ElMessage.error('新建分享收藏接口失败');
    }
}


</script>

<style scoped>
.container{
    display: flex;
    flex-direction: column;
    gap: 30px;
}
.coverage{
    display: flex;
    gap: 20px;
    width: 100%;
    height: 180px;
}
.pictext {
    display: block;
    width: 45px;
}
.picshow {
    width: 180px;
    height: 180px;
    border: 1px dashed #bbbbbb;
    border-radius: 10px;
    position: relative;
}
.tpic{
    width: 180px;
    height: 180px;
    border: 1px dashed #bbbbbb;
    border-radius: 10px;
    cursor: pointer;
    position: relative;
}
.spic{
    background-size: cover;
    background-repeat: no-repeat;
    background-position: center center;
    width: 180px;
    height: 180px;
}
.pic_contain{
  position: relative;
}
i.delete-btn {
  position: absolute;
  right: 5px;
  top: 8px;
  cursor: pointer;
}
/* .avatar-uploader{
    width: 90%;
    border-radius: 10px
}
.avatar-uploader .avatar {
  width: 150px;
  height: 150px;
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
.el-upload-list--picture-card{
  --el-upload-list-picture-card-size: 150px;
}
.el-icon.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 150px;
  height: 150px;
  text-align: center;
} */
.ptitie {
  height: 32px;
  width: 92%;
  display: flex;
  align-items: center;
  gap: 20px;
  align-self: stretch;
}
::v-deep .el-dialog__body {
  padding: 0px var(--el-dialog-padding-primary);
}
::v-deep .el-dialog__header{
  padding-bottom: 20px;
}
::v-deep .el-dialog__footer {
  padding: 0px;
  position: absolute;
  right: 15px;
  bottom: 10px;
}
::v-deep .el-input ,
::v-deep .el-textarea{
  width: 90%;
}
/* 三个输入框边框样式 */
::v-deep .el-input__wrapper,
::v-deep .el-textarea__inner{
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
::v-deep .el-input__wrapper{
  height: 40px;
}  
::v-deep .mainp .el-textarea .el-textarea__inner{
  height: 130px;
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
  width: 92%;
  display: flex;
  align-items: flex-start;
  gap: 20px;
  align-self: stretch;
}
.dialog-footer button:first-child {
  margin-right: 10px;
}

</style>
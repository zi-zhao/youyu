<!-- 创作中心——专栏和收藏管理——编辑-->
<template>
  <div>
    <el-dialog v-model="localDialogVisible2" :title="'修改'+ClassifyName + '信息'" style="width: 60%; height: 80%; min-height: 500px; margin-top: 10vh;">
        <div class="container">
            <!-- 添加封面 -->
            <div class="coverage">
                <span class="pictext">封面</span>
                <div class="beforepic">
                  <img  :src="previousImageUrl" alt="" style="width: 180px; height: 180px; border-radius: 10px;">
                  <span>(之前使用的图片)</span>
                </div>
                <div class="afterpic">
                  <div class="picshow">
                    <input type="file" ref="fileInput" accept="image/*" style="display: none;" @change="handleImage" />
                    <div  class="tpic" >
                        <el-icon @click="triggerImageUpload" style="position: absolute; left: 70px; top: 70px;font-size: 40px;cursor: pointer;"><Plus /></el-icon>
                    </div>
                    <div class="pic_contain">
                      <div v-for="(imagePreview, index) in imagePreviews" :key="index" class="spic" :style="{ backgroundImage: `url(${imagePreview})` }">
                        <el-icon class="delete-btn" @click="removeImage(index)"><CircleCloseFilled /></el-icon>
                      </div>
                    </div>
                  </div>
                  <span>(您要修改后的图片)</span>
                </div>
            </div>
            <!-- 专栏/收藏名称 -->
            <div class="ptitie">
                <span class="pictext">名称</span>               
                <el-input
                v-model="text1"
                maxlength="20"
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
            <el-button @click="localDialogVisible2 = false">Cancel</el-button>
            <el-button type="primary" @click ="submitData">
            提交
            </el-button>
        </span>
        </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ElMessage } from 'element-plus';
import { defineProps, ref,onMounted,computed,watchEffect,defineEmits} from "vue";
import axios from '../../utils/request';
import {compressImage,fetchFavoriteCoverage} from '@/utils/fileService';
import { getColumnPictureFromCOS,getFavoritePermission,getColumnPermission} from '@/utils/cosService';

const props = defineProps({
    ClassifyName: String,
    modelValue: Boolean,
    Id:Number,
});
const emit = defineEmits(['update:modelValue']);
const localDialogVisible2 = ref(props.modelValue);
watchEffect(() => {
  if (localDialogVisible2.value !== props.modelValue) {
    emit('update:modelValue', localDialogVisible2.value);
  }
});

const userId = localStorage.getItem("userId"); // 获取用户ID
const checked = ref(false);
const listData = ref([]);//存放从专栏或收藏中获取的数据
const previousImageUrl = ref('');//存放用户之前的专栏或收藏封面图
const fileName = ref();
const fileInput = ref(null);
const selectedImages = ref([]);
const imagePreviews = ref([]);


const text1 = computed({
  get: () => listData.value.name,
  set: (newValue) => listData.value.name = newValue
});

const textarea1 = computed({
  get: () => listData.value.profile,
  set: (newValue) => listData.value.profile = newValue
});

const visibility = computed(() => {
    return checked.value ? 1 : 0;
});

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
    const compressedFile =await compressImage(file);
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
const showData = async () => {
  if(props.ClassifyName === "文章专栏"){
    await getColumnArticleList(props.Id);
  }else if(props.ClassifyName === "分享专栏"){
    await getColumnShareList(props.Id);
  }else if(props.ClassifyName === "文章收藏"){
    await getFavoriteArticleList(props.Id);
  }else if(props.ClassifyName === "分享收藏"){
    await getFavoriteShareList(props.Id);
  }
}


//根据父组件传回的classifyname判断应该调用的接口类型（这个方法只是增加一个判断值）
const submitData = () => {
  if(props.ClassifyName === "文章专栏"){
    setColumnList();
    if(selectedImages.value) setColumnPitcure(props.Id);
    localDialogVisible2.value  = false;
  }else if(props.ClassifyName === "分享专栏"){
    setColumnList();
    if(selectedImages.value) setColumnPitcure(props.Id);
    localDialogVisible2.value  = false;
  }else if(props.ClassifyName === "文章收藏"){
    setFavoriteList();
    if(selectedImages.value) setFavoritePitcure(props.Id);
    localDialogVisible2.value  = false;
  }else if(props.ClassifyName === "分享收藏"){
    setFavoriteList();
    if(selectedImages.value) setFavoritePitcure(props.Id);
    localDialogVisible2.value = false
  }
}


//修改专栏图片
async function setColumnPitcure(ID) {
  try {
    await getColumnPermission( selectedImages.value[0],fileName.value,ID);
  } catch (error) {
      console.error("修改专栏图片接口失败", error); 
      ElMessage.error('修改专栏图片接口失败');
  }
}
//修改收藏图片
async function setFavoritePitcure(ID) {
  try {
    await getFavoritePermission( selectedImages.value[0],fileName.value,ID);
  } catch (error) {
      console.error("修改收藏图片接口失败", error); 
      ElMessage.error('修改收藏图片接口失败');
  }
}

//获取文章专栏
async function getColumnArticleList(ID) {
    try {
        const response = await axios.get('/column', {
            params: {
                type:0,
                page:1,
                pazeSize:100,
                userId:Number(userId),
            }
          });
        if(response.data.code === 1){
            const filteredData = response.data.data.records.filter(item => item.id === ID);
            if (filteredData.length > 0) {
                listData.value = filteredData[0];  
                previousImageUrl.value = await getColumnPictureFromCOS(listData.value.id);
                checked.value = listData.value.visibility;
            } else {
                console.error("未找到该专栏");
                ElMessage.error("未找到该专栏");
            }
        } else if(response.data.code === 0 && response.data.msg){
            ElMessage.error(response.data.msg.toString());
        }else {
            console.error("获取文章专栏列表数据失败");
            ElMessage.error("获取文章专栏列表数据失败");
        }
    } catch (error) {
        console.error("请求文章专栏接口失败", error);
        ElMessage.error("请求文章专栏接口失败");
    }
}


//获取分享专栏
async function getColumnShareList(ID) {
  try {
    const response = await axios.get('/column', {
        params: {
            type:1,
            page:1,
            pazeSize:100,
            userId:Number(userId),
          }
      });
    if(response.data.code === 1){
        const filteredData = response.data.data.records.filter(item => item.id === ID);
        if (filteredData.length > 0) {
          listData.value = filteredData[0]; 
          previousImageUrl.value = await getColumnPictureFromCOS(listData.value.id);
          checked.value = listData.value.visibility;
        } else {
          console.error("未找到该专栏");
          ElMessage.error("未找到该专栏");
        }
    }else if(response.data.code === 0 && response.data.msg){
        ElMessage.error(response.data.msg.toString());
    }else{
    console.error("获取分享专栏数据失败");
    ElMessage.error("获取分享专栏数据失败");
    }
  } catch (error) {
    console.error("请求分享专栏接口失败", error); 
    ElMessage.error("请求分享专栏接口失败");
  }
}
 
//获取文章收藏列表
async function getFavoriteArticleList(ID) {
  try {
    const response = await axios.get('/favorite',{ 
      params: { 
        type:0,
        page:1,
        pazeSize:100,
        userId:Number(userId),
      } 
    });
    if(response.data.code === 1){
        const filteredData = response.data.data.records.filter(item => item.id === ID);
        if (filteredData.length > 0) {
          listData.value = filteredData[0]; 
          previousImageUrl.value = await fetchFavoriteCoverage(listData.value.id);
          checked.value = listData.value.visibility;
        } else {
          console.error("未找到该专栏");
          ElMessage.error("未找到该专栏");
        }
    }else if(response.data.code === 0 && response.data.msg){
        ElMessage.error(response.data.msg.toString());
    }else{
    console.error("获取文章收藏数据失败");
    ElMessage.error("获取文章收藏数据失败");
    }
  } catch (error) {
    console.error("请求文章收藏接口失败", error);
    ElMessage.error("请求文章收藏接口失败");
  }
}

//获取分享收藏列表
async function getFavoriteShareList(ID) {
  try {
    const response = await axios.get('/favorite',{ 
      params: { 
        type:1,
        page:1,
        pazeSize:100,
        userId:Number(userId),
      } 
    });
    if(response.data.code === 1){
        const filteredData = response.data.data.records.filter(item => item.id === ID);
        if (filteredData.length > 0) {
          listData.value = filteredData[0]; 
          previousImageUrl.value = await fetchFavoriteCoverage(listData.value.id);
          checked.value = listData.value.visibility;
        } else {
          console.error("未找到该专栏");
          ElMessage.error("未找到该专栏");
        }
    }else if(response.data.code === 0 && response.data.msg){
        ElMessage.error(response.data.msg.toString());
    }else{
    console.error("获取分享收藏数据失败");
    ElMessage.error("获取分享收藏数据失败");
    }
  } catch (error) {
    console.error("请求分享收藏接口失败", error); 
    ElMessage.error("请求分享收藏接口失败");
  }
}



//修改专栏信息
async function setColumnList() {
  try {
    const data = {
      id: props.Id,
      name:text1.value,
      profile:textarea1.value,
      visibility:visibility.value,
    };
    const response = await axios.put('/column',data)
    if(response.data.code === 1){
        ElMessage.success('修改成功');
    }else if(response.data.code === 0 && response.data.msg){
        ElMessage.error(response.data.msg.toString());
    }else{
    console.error("修改专栏数据失败");
    ElMessage.error("修改专栏数据失败");
    }
  } catch (error) {
    console.error("修改专栏接口失败", error); 
    ElMessage.error("修改专栏数据失败");
  }
}

//修改收藏信息
async function setFavoriteList() {
  try {
    const data = {
      id: props.Id,
      name:text1.value,
      profile:textarea1.value,
      visibility:visibility.value,
    };
    const response = await axios.put('/favorite',data)
    if(response.data.code === 1){
        ElMessage.success('修改成功');
    }else if(response.data.code === 0 && response.data.msg){
        ElMessage.error(response.data.msg.toString());
    }else{
    console.error("修改收藏数据失败");
    ElMessage.error("修改收藏数据失败");
    }
  } catch (error) {
    console.error("修改收藏接口失败", error); 
    ElMessage.error("修改收藏接口失败");
  }
}



onMounted(() => {
    showData();
});

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
.beforepic,
.afterpic {
    display: flex;
    gap: 10px;
    align-items: flex-end;
}
.picshow {
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
::v-deep .el-textarea__inner{
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
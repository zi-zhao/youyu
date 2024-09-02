<template>
  <div>
    <el-dialog v-model="localDialogVisible" :title="'修改头像'" style="width: 60%; height: 60%; ">
        <div class="container">
            <!-- 更换头像 -->
            <div class="coverage">
                <!-- <span class="pictext">封面</span> -->
                <div class="beforepic">
                  <img  :src="userAvatar" alt="" style="width: 180px; height: 180px; border-radius: 10px;">
                  <span>(之前使用的头像)</span>
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
                  <span>(您要修改后的头像)</span>
                </div>
            </div>
        </div>
        <template #footer>
        <span class="dialog-footer">
            <el-button @click="localDialogVisible = false">Cancel</el-button>
            <el-button type="primary" @click ="setUserAvater">
            提交
            </el-button>
        </span>
        </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ElMessage } from 'element-plus';
import {ref,defineProps,onMounted,watchEffect,defineEmits} from "vue";
import { getUsersAvatarPermission,getUsersAvatarFromCOS } from '@/utils/cosService';
import {compressImage} from '@/utils/fileService';

const props = defineProps({
    modelValue: Boolean,
});

const emit = defineEmits(['update:modelValue']);
const localDialogVisible = ref(props.modelValue);
watchEffect(() => {
  if (localDialogVisible.value !== props.modelValue) {
    emit('update:modelValue', localDialogVisible.value);
  }
});

const userId = ref('');
const userAvatar = ref('')//获取用户之前的头像

const fileInput = ref(null);
const fileName = ref();
const selectedImages = ref([]);
const imagePreviews = ref([]);
// const CHUNK_SIZE = 5 * 1024 * 1024;



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
      imagePreviews.value.push(e.target.result);
      selectedImages.value.push(compressedFile);
    };
    reader.onerror = function(e) {
      console.error("Error reading file:", e); // 错误处理
    };
    reader.readAsDataURL(compressedFile);
  } else {
    console.log("文件数量超标"); 
  }
};


//删除图片
const removeImage = (index) => {
    selectedImages.value.splice(index, 1);
    imagePreviews.value.splice(index, 1);  // 也删除对应的预览
};

//修改用户头像
async function setUserAvater() {
  try {
    await getUsersAvatarPermission(selectedImages.value[0],fileName.value);
    setTimeout(() => {
      localDialogVisible.value= false;
    }, 1000);
    ElMessage.success('修改个人头像成功');
  } catch (error) {
      console.error("修改个人头像失败", error); 
      ElMessage.error('修改个人头像失败');
  }
}

// 获取用户头像
const fetchAvatar = async () => {
  try {
    userAvatar.value = await getUsersAvatarFromCOS(userId.value);
  } catch (error) {
    console.error("Error fetching user avatar:", error);
    ElMessage.error('获取用户头像失败');
  }
};

onMounted(() => {
  userId.value = localStorage.getItem("userId"); // 获取用户ID
  fetchAvatar();
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
    justify-content: space-evenly;
    gap: 20px;
    width: 100%;
    height: 180px;
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
.dialog-footer button:first-child {
  margin-right: 10px;
}

</style>
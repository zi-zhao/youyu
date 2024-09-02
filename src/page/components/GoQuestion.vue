<!-- 有两种方式跳转至此页面：
1、问答中心——答主推荐——点击咨询——咨询服务——去咨询——跳转至第一次提问页面
2、其他人的个人主页——去提问——跳转至第一次提问页面 -->
<template>
    <div class="bgc_box">
        <div class="large_box">
            <div class="top">
                <div class="one">
                    <span>向</span>
                    <div style="display: flex;align-items: center;">
                        <span class="text1">{{ answererInfo.username }}</span>
                        <!-- <img src="@/assets/VerifiedUser.svg" style="width: 16px;height: 16px;margin: 0 10px 0 -9px;" alt=""> -->
                    </div>
                    <span>发起提问</span>
                </div>
                <div class="btn-pc" @click="askQuestions">
                    提问
                </div>
            </div>
            <div class="main_box">
                <!-- <div class="pay">
                    <span>支付鱼饵数:</span>
                    <input v-model="text" type="text" placeholder="请输入鱼饵">
                </div> -->
                <div class="desc">
                    <el-input
                        v-model="textarea"
                        maxlength="300"
                        placeholder="阐述一下你的问题吧…"
                        show-word-limit="20"
                        type="textarea"
                        size="large"
                        resize="none"
                        class="desc_input"
                    />
                </div>
                <div class="uploadpic">
                    <input type="file" ref="fileInput" accept="image/*" style="display: none;" @change="handleImage" />
                    <!-- 如果没有图片预览，则显示上传提示 -->
                    <div v-if="imagePreviews.length === 0" class="tpic" >
                        <img @click="triggerImageUpload"  class="add" src="@/assets/QACenter/QuestionAddPic.svg" alt="" />
                    </div>
                    
                    <!-- 如果有图片预览，则全屏显示图片 -->
                    <div  class="pic-contain ">
                        <div v-for="(imagePreview, index) in imagePreviews" :key="index" class="spic" :style="{ backgroundImage: `url(${imagePreview})` }">
                            <el-icon class="delete-btn" @click="removeImage(index)"><CircleCloseFilled /></el-icon>
                        </div>
                    </div>
                </div>
                <!-- <div class="anonymous">
                    <div class="left">
                        <div class="an">
                            匿名咨询<img src="../../assets/CircleQuestionmark.svg" alt="">
                        </div>
                        <span v-if="value1" class="text2">已启用匿名咨询</span>
                        <span v-else class="text2">启用后将对答主匿名</span>
                    </div>
                    <div class="right">
                        <el-switch
                            v-model="value1"
                            class="mt-2"
                            style="margin-left: 24px"
                            inline-prompt
                            :active-icon="Check"
                            :inactive-icon="Close"
                        />
                    </div>
                </div> -->
                <div style="width: 100%;display: flex;justify-content: flex-end;">
                    <div class="btn-phone" @click="askQuestions">
                        提问
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref,computed,onMounted } from 'vue'
import { Check, Close } from '@element-plus/icons-vue'
import axios from '../../utils/request';
import { ElMessage } from 'element-plus';
import {getFistQuestionCOSPermission} from '@/utils/cosService';
import { useRoute,useRouter } from 'vue-router';
import {compressImage} from '@/utils/fileService';

const router = useRouter()
const route = useRoute ();
const userId = parseInt(route.params.id,10);//从路径中获取被咨询的用户ID
const textarea = ref('');
const text = ref(0);
// const value1 = ref(false);
const answererInfo = ref({});
const questionId =ref();

const fileName = ref();
const fileInput = ref(null);
const selectedImages = ref([]);
const imagePreviews = ref([]);
const fileSize = ref();


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
  fileSize.value = file.size;    // 获取并设置文件大小
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

// const getValue = computed(() => {
//   return value1.value ? 1 : 0;
// });

const uploadImages = async () => {
    await getFistQuestionCOSPermission(selectedImages.value[0],fileName.value,questionId.value);
};

async function askQuestions() {
    const data ={
        answererId:Number(userId),
        questionContent:textarea.value,
        moneyCount:Number(text.value),
        type:0,
        // anonymity:Number(getValue.value),
        anonymity:0,
        answererUsername:answererInfo.value.username,
    }
    try {
        const response = await axios.post(`/answer`,data)
        if (response.data.code === 1) {
            questionId.value = response.data.data;
            if(selectedImages.value.length > 0){
                await uploadImages();
            }
            ElMessage.success('提问成功');
            router.push('/DefaultPresentation');
        }else if(response.data.code === 0 && response.data.msg){
            ElMessage.error(response.data.msg.toString());
        }else{
            console.error('问题发送失败', response.data.msg || 'Unknown error');
            ElMessage.error('问题发送失败')
        }
    } catch (error) {
      console.error('问题发送失败', error.message);
      ElMessage.error('问题发送失败')
    }
}


//获取答主具体信息
async function getAnswererInfo() {
  try{
    const response = await axios.get(`/answer/${userId}`)
    if(response.data.code === 1){
        answererInfo.value = response.data.data;
    }else{
        console.error("获取答主具体信息失败");
        ElMessage.error('获取答主具体信息失败');
    }
  } catch (error) {
    console.error("获取答主具体信息失败", error); 
    ElMessage.error('获取答主具体信息失败');
  }
}

onMounted(() => {
    getAnswererInfo();
});

</script>

<style scoped>
.bgc_box{
    width: 100%;
    background: #F8F8F8;
}
.large_box{
    width: 1020px;
    height: 97vh;
    margin: 0px auto;
    padding: 0px 40px;
    border-radius: 16px;
    background: #FFF;
}
.top{
    display: flex;
    align-items: center;
    flex-direction: column;
    justify-content: center;
    padding-bottom: 4px;
    height: 50px;
    gap: 8px;
    position: relative;
}
.text1{
    color: #3F87E1;
    margin: 0px 10px;
    position: relative;
}
.one{
    display: flex;
}
.one span{
    font-weight: 700;
}
.top span{
    font-size: 20px;
}
.btn-pc,
.btn-phone{
    width: 32px;
    height: 19px;
    padding: 8px 20px;
    border-radius: 16px;
    background: #9FA9CA;
    color: #fff;
    position: absolute;
    right: 60px;
    top: 8px;
    cursor: pointer;
}
.main_box{
    display: flex;
    flex-direction: column;
    gap: 30px;
}
.pay{
    display: flex;
    align-items: center;
    gap: 15px;
    margin-top: 30px;
}
.pay input{
    width: 148px;
    height: 21px;
    padding: 4px 8px;
    border-radius: 8px;
    background: #EDEDED;
    border: 1px solid #EDEDED;
}
.pay input:focus{
    outline: none;
}
::v-deep .el-textarea__inner{
    width: 100%;
    height: 220px;
    border-radius: 12px;
    background: #fbfbfb;
    padding: 8px 12px 12px 12px;
}
::v-deep .el-textarea .el-input__count{
    bottom: 9px;
    right: 33px;
    background-color: #fbfbfb;
}
.uploadpic{
    width: 100px;
    height: 100px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    border: 1px solid #DCDFE6;
    background: #fbfbfb;
    cursor: pointer;
}
.spic{
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center center;
  border: 1px solid #bbbbbb;
  border-radius: 4px;
  width: 100px;
  height: 100px;
}
.pic-contain{
    position: relative;
}
.delete-btn {
    position: absolute;
    top: 2px;
    right:1px;
    cursor: pointer;
}
.add{
    width: 35px;
    height: 35px;
}
.anonymous{
    display: flex;
    align-items: center;
    gap: 45px;
}
.left{
    display: flex;
    flex-direction: column;
    gap: 10px;
    width: 108px;
}
.an{
    font-size: 14px;
}
.an img{
    width: 12px;
    height: 12px;
    margin-left: 5px;
}
.text2{
    color: #7E7E7E;
    font-size: 12px;
}
.btn-phone{
    display: none;
}
@media (max-width: 768px) {
    .large_box{
        width: 90%;
        padding: 0 5%;
    }
    .btn-pc{
        display: none ;
    }
    .btn-phone{
        display: flex;
        position: initial;
        margin-bottom: 1rem;
    }
}
</style>
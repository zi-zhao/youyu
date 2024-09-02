<!-- 问答中心——我的问题——收到的提问——未回答——点击接受回答跳转的第一次回答页面 -->
<template>
    <div class="bgc_box">
        <div class="large_box">
            <div class="top">
                <div class="one">
                    <span>回答</span>
                    <div style="display: flex;align-items: center;">
                        <span class="text1">{{ answererInfo.username }}</span>
                        <!-- <img src="@/assets/VerifiedUser.svg" style="width: 16px;height: 16px;margin: 0 10px 0 -9px;" alt=""> -->
                    </div>
                    <span>的提问</span>
                </div>
                <div class="btn-pc" @click="acceptAnswer">
                    回答
                </div>
            </div>
            <div class="main_box">
                <div class="ques">
                    <span style="font-size: 17px;font-weight: 700;">问题:</span>
                    <div class="ques-detail">
                        <span class="ques-content">{{answererInfoText.title}}</span>
                        <div v-if="answererInfoText.count === 1">
                            <img :src="askQuestionPicture" alt="" @click="visibleRef = true">
                        </div>
                        <vue-easy-lightbox
                            :visible="visibleRef"
                            :imgs="askQuestionPicture"
                            :index="indexRef"
                            @hide="onHide"
                        ></vue-easy-lightbox>
                    </div>
                </div>
                <div >
                    <span style="font-size: 17px;font-weight: 700;">你的回答:</span>
                    <div class="desc">
                        <el-input
                            v-model="textarea"
                            maxlength="300"
                            placeholder="阐述一下你的回答吧…"
                            show-word-limit="20"
                            type="textarea"
                            size="large"
                            resize="none"
                            class="desc_input"
                        />
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
                    </div>
                </div>
                <div style="width: 100%;display: flex;justify-content: flex-end;">
                    <div class="btn-phone" @click="acceptAnswer">
                        回答
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref,onMounted } from 'vue'
import axios from '../../utils/request';
import { ElMessage } from 'element-plus';
import { useRoute,useRouter } from 'vue-router'
import { getFistAnswerCOSPermission,getFirstQuestionPictureFromCOS } from '@/utils/cosService'; 
import {compressImage} from '@/utils/fileService';


const router = useRouter()
const route = useRoute ();
const textarea = ref('');
const answererInfo = ref({});
const askQuestionPicture = ref({});
const answererInfoText = ref({});
const askerId = parseInt(route.params.askerId,10);//路径中的提问者ID
const questionId = parseInt(route.params.questionId,10);//路径中的问题id
const visibleRef = ref(false);
const indexRef = ref(0);
const onHide = () => (visibleRef.value = false);

const fileName = ref();
const fileInput = ref(null);
const selectedImages = ref([]);
const imagePreviews = ref([]);



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


//答主第一次回答接口(提交文本)
async function acceptAnswer() {
  try{
    const queryParams = new URLSearchParams({
        id: Number(questionId),
        answerContent: textarea.value
    }).toString();
    const response = await axios.post(`/answer/myanswer/accept?${queryParams}`);
    if(selectedImages.value.length > 0){
        await getFistAnswerCOSPermission( selectedImages.value[0],fileName.value,questionId);
    }
    if(response.data.code === 1){
        ElMessage.success('回答成功');
        router.push('/DefaultPresentation');
    }else if(response.data.code === 0 && response.data.msg){
        ElMessage.error(response.data.msg.toString());
    }else{
        console.error("回答失败");
        ElMessage.error('回答失败');
    }
  } catch (error) {
    console.error("回答失败", error); 
    ElMessage.error('回答失败');
  }
}

//获取提问者具体信息
async function getAnswererInfo() {
  try{
    const response = await axios.get(`/answer/${askerId}`)
    if(response.data.code === 1){
        answererInfo.value = response.data.data;
    }else if(response.data.code === 0 && response.data.msg){
        ElMessage.error(response.data.msg.toString());
    }else{
    console.error("获取提问者具体信息失败");
    ElMessage.error('获取提问者具体信息失败');
    }
  } catch (error) {
    console.error("获取提问者具体信息失败", error); 
    ElMessage.error('获取提问者具体信息失败');
  }
}

//获取第一次提问的文字内容
async function getAnswererInfoText() {
  try{
    const response = await axios.get(`/answer/question/${questionId}`)
    if(response.data.code === 1){
        answererInfoText.value = response.data.data;
        if(answererInfoText.value.count === 1){
            askQuestionPicture.value = await getFirstQuestionPictureFromCOS(questionId);
        }
    }else if(response.data.code === 0 && response.data.msg){
        ElMessage.error(response.data.msg.toString());
    }else{
    console.error("获取第一次提问的文字内容失败");
    ElMessage.error('获取第一次提问的文字内容失败');
    }
  } catch (error) {
    console.error("获取第一次提问的文字内容失败", error); 
    ElMessage.error('获取第一次提问的文字内容失败');
  }
}

onMounted(() => {
    getAnswererInfo();
    getAnswererInfoText();
});


</script>

<style scoped>
.bgc_box{
    width: 100%;
    background: #F8F8F8;
}
.large_box{
    width: 1020px;
    margin: 0px auto;
    padding: 0px 40px 20px;
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
.ques{
    display: flex;
    flex-direction: column;
}
.ques-detail{
    width: 90%;
    margin: 15px auto;
    display: flex;
    flex-direction: column;
}
.ques-content{
    line-height: 1.6;
}
.ques-detail img{
    width: 180px;
    height: 180px;
    border: 1px solid #DCDFE6;
    border-radius: 10px;
    margin: 20px 0px;
}
.desc{
    width: 90%;
    margin: 15px auto;
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
    right: 13px;
    background-color: #fbfbfb;
}
.uploadpic{
    width: 100px;
    height: 100px;
    margin-top: 25px;
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
.btn-phone{
    display: none;
}
.add{
    width: 35px;
    height: 35px;
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
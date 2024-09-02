<template>
  <div class="large_body">
      <div class="body">
        <span class="text">内容编辑</span>
        <div class="show">
          <div class="picbox">
              <span class="pictext">图片</span>
              <div>
                <input type="file" ref="fileInput" accept="image/*" style="display: none;" @change="handleImage" />
                <div v-if="imagePreviews.length === 0" class="picshow"> 
                  <el-icon @click="triggerImageUpload" style="position: absolute; left: 70px; top: 70px;font-size: 40px;cursor: pointer;"><Plus /></el-icon>              
                </div>
                <div v-else class="pic_contain">
                  <div v-for="(imagePreview, index) in imagePreviews" :key="index" class="spic" :style="{ backgroundImage: `url(${imagePreview})` }">
                    <el-icon class="delete-btn" @click="removeImage(index)"><CircleCloseFilled /></el-icon>
                  </div>
                  <div class="picshow"> 
                    <el-icon @click="triggerImageUpload" style="position: absolute; left: 70px; top: 70px;font-size: 40px;cursor: pointer;"><Plus /></el-icon>              
                  </div>
                </div>
              </div>
          </div>
          <div class="ptitie">
            <span class="pictext">标题</span>               
            <el-input
              v-model="text"
              maxlength="10"
              placeholder="填写标题，可能会让更多人感兴趣~"
              show-word-limit
              type="text"
              class="eidt-input"
            /> 
          </div>
          <div class="mainp">
            <span class="pictext">正文</span>
            <el-input
              v-model="textarea"
              maxlength="1000"
              placeholder="分享一下最近的趣事或心情吧"
              show-word-limit
              type="textarea"
              size="large"
              resize="none"
              :autosize = "{ minRows: 2, maxRows: 30 }"
              class="eidt-input"
            />
          </div>
          <div class="mlable">
            <div class="lable">
              <span class="pictext">标签</span>
              <div class="buttons-container border-container">
                  
                  <span v-for="tag in selectedTags" :key="tag" class="tag-btn">
                      {{ tag }}
                      <i class="delete-btn2" @click="removeTag(tag)">×</i>
                  </span>
              </div>
            </div>
            <div class="rlable">
              <span class="labletext">推荐标签：</span>
              <div class="buttons-container">
                  <button 
                    v-for="tag in tags" 
                    :key="tag"
                    class="tag-btn" 
                    @click="addLabel(tag)">
                    {{ tag }}
                  </button>
              </div>
            </div>
            <div class="rlable">
              <span class="labletext">新建标签：</span>
              <input 
                  type="text" 
                  placeholder="输入后回车可自己创建标签~" 
                  v-model="newTag" 
                  @keyup.enter="addNewTag"
                  class="custom-input-size"
              />
            </div>
          </div>
        </div>
        <span class="text2">发布设置</span>
        <div class="classify">

          <div class="box1">
            <label for="column">专栏分类</label>
            <el-button  v-if="popboxes" class="m-2" @click = "dialogFormVisible = true">选择分享专栏</el-button>
            <el-button v-else class="m-2" @click = "dialogFormVisible = true">{{ columnName }}</el-button>
            <div v-if="dialogFormVisible">
                <CfDialog  v-model="dialogFormVisible" @updateValue="handleUpdateValue" ClassifyName="分享专栏"></CfDialog>
            </div>
          </div>


          <div class="box1">
            <span class="tclass">权限设置</span>
            <div class="my-2 flex items-center text-sm">
              <el-radio-group v-model="radio1" class="radio_share">
                <el-radio label="0">公开<span class="ptext">(所有人公开)</span></el-radio>
                <el-radio label="1">私密<span class="ptext">(仅自己可见)</span></el-radio>
              </el-radio-group>
            </div>
          </div>
        </div>
        <div class="button">
          <!-- <button class="bottom_btn">取消</button>
          <button class="bottom_btn">保存草稿</button> -->
          <button class="put"  @click="submitToAPI">发布</button>    
        </div>
      </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from '@/utils/request';
import CfDialog from '../../components/CfDialog.vue';
import { ElMessage } from 'element-plus';
import {compressImage} from '@/utils/fileService'
import { useRouter } from 'vue-router'
import { getSharePicturePermission } from '@/utils/cosService'; 

const userId = localStorage.getItem("userId");  // 或您想要的任何默认值
const username = localStorage.getItem("userName");  // 或您想要的任何默认值

const radio1 = ref('0');
const text = ref('');
const textarea = ref('');
const fileInput = ref(null);
const tags = ref([]);// 获取推荐标签
const selectedTags = ref([]);
const dialogFormVisible = ref(false);//控制cfdialog弹窗（显示文章专栏列表）是否弹出
const popboxes =ref(true);//控制文章分类专栏这个按键的显示值
const columnId = ref();
const columnName = ref();
const router = useRouter();

const imagePreviews = ref([]);
const selectedImages = ref([]);
const fileName = ref([]);
const number = ref(0);

// 当点击按钮时触发文件输入框
const triggerImageUpload = () => {
  if (selectedImages.value.length < 18) {
    fileInput.value.click();
  } else {
    alert("只能提交三张照片"); // 提示用户
  }
};

// // 当文件选择后处理图片
// const handleImage = (event) => {
//   const file = event.target.files[0];
//   if (file && selectedImages.value.length < 18) {
//     const reader = new FileReader();
//     reader.onload = function(e) {
//       const compressedFile = compressImage(file);
//       imagePreviews.value.push(e.target.result);  // 添加DataURL到imagePreviews
//       selectedImages.value.push(compressedFile);  // 添加文件对象到selectedImages
//     };
//     reader.readAsDataURL(file);
//   }
// };


//  (上传图片)当文件选择后处理图片
const handleImage = async (event) => {
  const files = event.target.files;
  for (const file of files) {
    if (selectedImages.value.length < 18) {
      try {
        const timestamp = new Date().getTime(); // 获取当前时间戳
        const compressedFile = await compressImage(file);
        const reader = new FileReader();
        reader.onload = (e) => {
          fileName.value.push(`${timestamp}-${file.name}`);
          imagePreviews.value.push(e.target.result);
          selectedImages.value.push(compressedFile);
        };
        reader.readAsDataURL(compressedFile);
        number.value++;
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
    number.value--;
};

// 从一个数组中随机选择n个元素
const randomSelect = (arr, n) => {
    let shuffled = arr.slice();
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled.slice(0, n);
};

//获取标签接口
const fetchTags = async () => {
    try {
      const response = await axios.get('/sharelabel');
      if (response.data.data && Array.isArray(response.data.data) && response.data.code ===1) {
          const allTags = response.data.data.map(item => item.name);
          tags.value = randomSelect(allTags, 6); // 随机选择标签
      }else if(response.data.code === 0 && response.data.msg){
        ElMessage.error(response.data.msg.toString());
      }
    } catch (error) {
        console.error('查找标签失败', error.message);
        ElMessage.error('查找标签失败');
    }
};

// 从提供的标签中选择标签
const addLabel = (tag) => {
    if (selectedTags.value.length >= 4) {
        alert("最多只能添加4个标签");
        return;
    }
    // 防止重复添加
    if (!selectedTags.value.includes(tag)) {
        selectedTags.value.push(tag);
    }
};

//自定义新增标签
const newTag = ref(''); // 用于绑定到输入框的新标签名
const addNewTag = () => {
    if (selectedTags.value.length >= 4) {
        alert("最多只能添加4个标签");
        return;
    }
    if (newTag.value && !selectedTags.value.includes(newTag.value)) {
        selectedTags.value.push(newTag.value);
        addLabelToMysql(newTag.value);
        newTag.value = '';  // 清空输入框
    }
};

//删除函数
const removeTag = (tagToRemove) => {
    const index = selectedTags.value.indexOf(tagToRemove);
    if (index > -1) {
        selectedTags.value.splice(index, 1);
    }
};

//接受cfdialog返回的数据，从而确定专栏Id
const handleUpdateValue = (data) => {
  columnId.value = data[0];
  columnName.value = data[1];
  popboxes.value = false;
}

//添加标签接口
async function addLabelToMysql(name) {
  try {
    const response = await axios.post('/sharelabel',{
      name:name,
      createId:userId,
      createUsername:username,
      type:0,
    });
    if (response.data.code === 1) {
      ElMessage.success('添加标签成功')
    }else{
        console.error("添加标签失败");
        ElMessage.error("添加标签失败");
    }
  } catch (error) {
      console.error('添加标签失败', error);
      ElMessage.error("添加标签失败");
  }
}

//将分享添加到专栏接口
async function uploadColumn(id) {
  const response = await axios.post('/column/share', {
    columnId:columnId.value,
    contentId:id,
  });
  if(response.data.code ===1){
    // ElMessage.success('添加专栏成功');
  }
  else if(response.data.code === 0 && response.data.msg){
      ElMessage.error(response.data.msg.toString());
  }else ElMessage.error('添加专栏失败');
}


// 发表分享的函数
const submitToAPI = async () => {
    const url = '/share';
    const payload = {
        userId: userId,  // 默认值需要设置
        username: username,  // 默认值需要设置
        title: text.value,
        content: textarea.value,
        label: selectedTags.value.join(', '),
        access: parseInt(radio1.value, 10)
    };
    try {
        const response = await axios.post(url, payload);
        if ( response.data.code === 1) {
          ElMessage.success('发布分享成功');
          const responseData = response.data.data;
          await uploadColumn(responseData);//将分享添加到专栏接口
          await getSharePicturePermission(selectedImages.value,fileName.value,number.value,responseData);
          // router.push('/CreateCenter')
        } else {
          console.error('发布分享失败', response.data.msg);
          ElMessage.error('发布分享失败');
        }
    } catch (error) {
      console.error('发布分享失败', error);
      ElMessage.error('发布分享失败');
    }
}

onMounted(fetchTags);

</script>


<style scoped>
.large_body{
  width: 100%;
  background: #FDFBF6;;
}
.body {
  display: flex;
  justify-content: center;
  width: 1020px;
  background-color: #fff;
  border-radius: 16px;
  box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.25);
  padding: 50px 55px;
  flex-direction: column;
  align-items: flex-start;
  gap: 32px;
  margin: 40px auto 0px;
}

.text{
  align-self: stretch;
  color: #000;
  font-family: Microsoft YaHei;
  font-size: 30px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
}
.show{
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  gap: 45px;
  align-self: stretch;
}
.picbox{
  display: flex;
  gap: 20px;
  width: 100%;
}
.spic{
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center center;
  border: 1px dashed #bbbbbb;
  border-radius: 10px;
  width: 180px;
  height: 180px;
}
.picshow{
  width: 180px;
  height: 180px;
  border: 1px dashed #bbbbbb;
  border-radius: 10px;
  position: relative;
}
.pic_contain{
  display: flex;
  flex-wrap: wrap;
  width: 800px;
  gap: 10px 15px;
}
.pictext{
  width: 60px;
  color: #606266;
  font-family: -apple-system,BlinkMacSystemFont,Helvetica Neue,PingFang SC,Microsoft YaHei,Source Han Sans SC,Noto Sans CJK SC,WenQuanYi Micro Hei,sans-serif;
  font-size: 18px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
}
.ptitie {
  height: 32px;
  width: 900px;
  display: flex;
  align-items: center;
  gap: 30px;
  align-self: stretch;
}
.mainp{
  width: 900px;
  display: flex;
  align-items: flex-start;
  gap: 30px;
  align-self: stretch;
}
.mlable{
  width: 900px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 15px;
  align-self: stretch;
}
.lable{
  display: flex;
  align-items: flex-start; 
  gap: 30px; 
  width: 100%;
}
.rlable{
  display: flex;
  align-items: center;
  gap: 10px;
  height: 28px;
  width: 110%;
}
.border-container{
  border: 1px solid #dcdfe6;
  display: inline-block;
  height: 40px;
  width: 100%;
  padding: 5px;
  border-radius: 5px;
}
.buttons-container {
  display: flex; 
  align-items: center;
  gap: 24px;         
}
.labletext{
  margin-left: 72px;
  color: #545454;
  font-family: Microsoft YaHei;
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
}
/* 标签输入框 */
.custom-input-size {
    width: 170px; 
    height: 17px;
    padding: 6px 10px;
    border-radius: 5px;
    border: none;
    margin-left: -6px;
}
 input.custom-input-size:focus {
  outline: none;
  box-shadow: 0 2px 6px #cfd7e2;
  border: 1px solid #d7d7d7;
}
.custom-input-size{
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border: 1px solid #efefef;
}
/* 紫色标签样式 */
.tag-btn {
  display: flex;
  align-items: center; 
  color: #000;
  height: 28px;
  cursor: pointer;
  border: 1px solid #DCDFE6;
  border-radius: 10px;
  background: #9FA9CA;
  padding: 4px 12px 4px 14px;
}
.buttons-container span{
    display: flex;
    height: 18px;
    color:#000;
    background-color: #9FA9CA;
    border-radius: 10px;
    font-size: 14px;
    font-family: Microsoft YaHei;
    cursor: pointer;
    user-select: none;
}
i.delete-btn2 {
    display: none;
    margin-left: 1px;
    font-size: 16px;
}
.tag-btn:hover {
    padding: 4px 8px;
    background: #CCD3E8; 
  }
.tag-btn:hover i.delete-btn2 {
  display: inline-block;
}
.text2{
  color: #000;
  font-family: -apple-system,BlinkMacSystemFont,Helvetica Neue,PingFang SC,Microsoft YaHei,Source Han Sans SC,Noto Sans CJK SC,WenQuanYi Micro Hei,sans-serif;
  font-size: 30px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
  align-self: stretch;
}
.classify{
  /* height: 103px; */
  width: 780px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  gap: 35px;
}
.box1{
  display: flex;
  width: 780px;
  height: 24px;
  align-items: center;
  gap: 40px;
}
.tclass{
  color: #606266;
  font-family: -apple-system,BlinkMacSystemFont,Helvetica Neue,PingFang SC,Microsoft YaHei,Source Han Sans SC,Noto Sans CJK SC,WenQuanYi Micro Hei,sans-serif;
  font-size: 18px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
}
::v-deep .el-radio__label{
    width: 100px;
}
::v-deep .radio_share span .ptext{
  font-size: 12px;
  margin-left: 4px;
  letter-spacing: 0.5px;
}
.radio_share span{
  display: inline-block;
  width: 12px;
  height: 12px;
  font-size: 14px;
  text-align: center;
}
.button{
  height: 820px;
  height: 35px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 16px;
  align-self: stretch;
}
.put{
  display: flex;
  width: 60px;
  padding: 5px 12px 6px 12px;
  justify-content: center;
  align-items: center;
  border-radius: 8px;
  background: #9FA9CA;
  cursor: pointer;
}
.delete-btn {
    position: absolute;
    top: 5px;
    right:8px;
    cursor: pointer;
}

.spic, .tag-btn {
    position: relative; 
}
/* 底部按钮样式 */
.bottom_btn {
    display: inline-block;
    text-align: center;
    border-radius: 10px;
    height: 32px;
    padding: 8px 12px; 
    line-height: 16px; /*  使文本垂直居中*/
    background-color: white;
    border: 1px solid #DCDFE6;
    color: #545454;
    cursor: pointer; 
}
.bottom_btn:hover, 
.bottom_btn:active {
    background-color: #F7F7F7;
}

</style>

<template>
    <div class="bgc_box">
        <!-- 提问者聊天框   向**的提问+价值 -->
        <div v-if="route.path.includes('/ask/')" class="top">
            <div class="one">
                <span>向</span>
                <div style="display: flex;align-items: center;">
                    <span class="text1">{{ receiveUsername }}</span>
                    <img v-if="answererInfo.verified === 1" src="@/assets/VerifiedUser.svg" style="width: 16px;height: 16px;margin: 0 10px 0 -9px;" alt="">
                </div>
                <span>提问</span>
            </div>
            <!-- <div class="timer">
                此提问将在{{finishTime}}后结束
            </div> -->
            <div  class="btn" @click="openrefuse">
                结束
            </div>
        </div>
         <!-- 答主聊天框   **的提问+价值 -->
        <div v-if="route.path.includes('/answer/')" class="top">
            <div class="one">
                <span class="text1">{{ receiveUsername }}</span>
                <span>的提问</span>
            </div>
            <!-- <div class="timer">
                此提问将在{{finishTime}}后结束
            </div> -->
        </div>
        <!-- 对话列表  -->
        <div class="main_box" ref="mainBoxRef">
            <div  v-for="(message, index) in sendMessagesList" :key="message.time">
                <div v-if="shouldDisplayTime(index)" class="time">
                    {{ message.time }}
                </div>
                <div class="left_box" v-if="message.user === 1">
                    <div class="leftchat">
                        <img :src="answererInfo.newAvater" alt="" class="userpic">
                        <div v-if="message.messageType === 1" class="conversation_L">
                            <span >{{ message.content }}</span>
                        </div>
                        <div v-if="message.messageType === 0">
                            <img :src="message.imageurl" @click="message.visibleRef = true" alt="" class="sendpic">
                            <vue-easy-lightbox
                                :visible="message.visibleRef"
                                :imgs="message.imageurl"
                                :index="index"
                                @hide="onHide(message)"
                            ></vue-easy-lightbox>
                        </div>
                    </div>
                </div>
                <div class="right_box" v-if="message.user === 0">
                    <div class="rightchat">
                        <div style="display: flex;align-items: center;">
                            <div v-if="isLoading(message.status)" v-loading="true" class="send-state"></div>
                            <div v-if="isLoading2(message.status)" class="send-state">
                                <el-result
                                    icon="error"
                                ></el-result>
                            </div> 
                            <div v-if="message.messageType === 1" class="conversation_R">
                                <span >{{ message.content }}</span>
                            </div>
                            <div v-if="message.messageType === 0">
                                <img :src="message.imageurl" @click="message.visibleRef = true" alt="" class="sendpic">
                                <vue-easy-lightbox
                                    :visible="message.visibleRef"
                                    :imgs="message.imageurl"
                                    :index="index"
                                    @hide="onHide(message)"
                                ></vue-easy-lightbox>
                            </div>
                        </div>
                        <img :src="userAvater" alt="" class="userpic">
                    </div>
                </div>
            </div>   
        </div>
        <div class="bottom">
            <div v-if="route.path.includes('/ask/')" class="inputbox">
                <!-- <input type="text" v-model="inputValue"   :placeholder="'您还能发送' + number + '追问'"> -->
                <el-input
                    v-model="inputValue"
                    :autosize="{ minRows: 1, maxRows: 5 }"
                    type="textarea"
                    maxlength="200"
                    show-word-limit="true"
                    resize="none"
                    :placeholder="'您还能发送' + number + '追问'"
                    class="livechat-input"
                />
            </div>
            <div v-else class="inputbox">
                <el-input
                    v-model="inputValue"
                    :autosize="{ minRows: 1, maxRows: 5 }"
                    type="textarea"
                    maxlength="200"
                    show-word-limit="true"
                    resize="none"
                    class="livechat-input"
                />
            </div>
            <div>
                <input type="file" ref="imageInput"  style="display: none;" @change="handleImage"  >
                <img @click="triggerImageUpload" src="@/assets/QACenter/UploadPic.svg" style="width: 28px; height: 28px; cursor: pointer;" alt="">
                 <!-- 将上传的输入框隐藏 -->
            </div>
            <div 
                class="send_btn" 
                @click="sendWordMessages"
                :class="{'disabled': number === 'a'}"
            >发送</div>
        </div>
    </div>
    <div v-if="dialogFormVisible">
        <EvaluateDialog 
            v-model="dialogFormVisible" 
            QuestionId: questionId
            Number:number.value
        ></EvaluateDialog>
    </div> 
</template>

<script setup>
import { ref, onMounted, onUnmounted,watch, nextTick} from 'vue';
import { ElMessage,ElMessageBox } from 'element-plus';
import { v4 as uuidv4 } from 'uuid';
import axios from '@/utils/request';
import { useRoute,useRouter } from 'vue-router';
import { getUsersAvatarFromCOS } from '@/utils/cosService';
import EvaluateDialog from '../EvaluateDialog.vue';
import { compressImage } from '@/utils/fileService.js';
import { formatDateTime } from '@/utils/timeFormat.js';
import {getAskAndQuestionCOSPermission} from '@/utils/cosService';

// 将常量或其他变量放在这里，有访问接口的URL和端口号
const ip = '154.8.172.164';
const port = '8081';
const token = localStorage.getItem('token');
const userId = localStorage.getItem("userId");
const finishTime = ref('24小时');
const websock = ref(null);
const route = useRoute ();
const mainBoxRef = ref(null);//为了使sendMessagesList发生变化时（即有新消息），让聊天界面滚动到底部以显示最新消息功能，将显示聊天消息的盒子设为响应式。
const inputValue = ref('');//输入框中的响应式数据
const RouteId = parseInt(route.params.id,10);//路径中的用户ID
const questionId = parseInt(route.params.questionId,10);//路径中的问答ID
const numberData = parseInt(route.params.number,10);//路径中的追问次数
const askId = ref(null);
const answerId = ref(null);
const messageType = ref(null);// 判断此消息时一个回答还是一个提问，如果是0则表示回答，如果是1则表示提问，如果为2，则表示该消息是一个普通的聊天消息
const historyData = ref({});//存放用户历史消息记录
const dialogFormVisible = ref(false);//控制评分弹窗是否开启
const number = ref();//如果用户是提问者，记录剩余的追问次数
const answererInfo = ref({});//问答对方的信息
const userAvater = ref();//保存用户自己的头像
const sendMessagesList = ref([]);//存放所有消息数据,user:消息发送者是0，消息接受者是1,status:状态未成功为0，成功是1，待确定是2
const receiveUsername = ref('');//消息的接收方名称
const router = useRouter();
//包含所有默认属性值的消息对象（按照sendMessagesList）
const defaultMsgStructure = {
    uuid: '',//该消息对应的uuid
    number:null,//如果是提问者发送的消息，则给提问者发送剩余的提问次数
    status:null,//是否成功发送消息,未成功0，成功1
    messageType: null,//判断该消息是图片还是文字，如果为图片的话为0，文字为1
    user: null,//判断发送到消息接收者还是消息发送者，发送者为0，接收者为1
    toUserId:'',// 消息接收者的id
    fromUserId:'',//消息发送者id
    time: '',//消息发送的时间
    content: '',//消息内容
    imageurl:'',//图片url
    visibleRef:false,//图片的展示插件是否开启
};

//设置上传图片
const fileName = ref();
const tempFileName = ref();
const imagePreviews = ref([]);
const imageInput = ref(null);  
const selectedImages = ref([]);
const tempselectedImages = ref([]);

if (route.path.includes('/ask/')) {
    askId.value =  userId;
    answerId.value = RouteId;
    messageType.value = 1;
    number.value = numberData;
}

if (route.path.includes('/answer/')) {
    askId.value =  RouteId;
    answerId.value = userId;
    messageType.value = 0;
    number.value = -1;
}

const onHide = (message) => {
    message.visibleRef = false;
};

//获取用户历史消息列表
async function getMessageLog() {
  try{
    const response = await axios.get(`/answer/message/history`,{
        params: {
            questionId:questionId,
        }
    });
    if(response.data.code === 1){
        const user = ref(0);
        historyData.value = response.data.data;
        sendMessagesList.value = historyData.value.map(item => {
            if(item.fromUserId == userId) {
                user.value = 0;
            }else if(item.fromUserId == RouteId){
                user.value = 1;
            }else{
                ElMessage.error('未知的参数错误');
            }
            // if(item.isQuestion === 1 && item.type == 0){
            //     item.imageurl = getFirstAnswerPictureFromCOS(item.questionId);
            //     // item.imageurl = item.content;
            // }
            // if(item.isFirstAnswer === 1 && item.type == 0){
            //     item.imageurl = getFirstQuestionPictureFromCOS(item.questionId);
            //     // item.imageurl = item.content;
            // }
            return {
                uuid: '', 
                status: 1, 
                messageType: item.type, 
                user: user.value, 
                toUserId: item.toUserId, 
                fromUserId: item.fromUserId, 
                time: item.createTime, 
                content: item.content,
                imageurl:   
                    // (item.isQuestion === 1 && item.type == 0) ? getFirstAnswerPictureFromCOS(item.questionId) :
                    // (item.isFirstAnswer === 1 && item.type == 0) ? getFirstQuestionPictureFromCOS(item.questionId) :
                    (item.type == 0) ? item.cosSecretDto.url :
                    null,
                number:null,
                visibleRef:false,
            };
        });
        // ElMessage.success('获取用户消息记录成功');
    }else if(response.data.code === 0 && response.data.msg){
        ElMessage.error(response.data.msg.toString());
    }else{
        console.error("获取用户消息记录失败");
        ElMessage.error('获取用户消息记录失败');
    }
  } catch (error) {
    console.error("获取用户消息记录失败", error); 
    ElMessage.error('获取用户消息记录失败');
  }
}


const isLoading = (type) => {
    return type === 2;
}
const isLoading2 = (type) => {
    return type === 0;
}


//判断和上一条消息的时间是否相同
const shouldDisplayTime = (currentIndex) => {
    // 如果是第一条消息，则显示时间
    if (currentIndex === 0) return true;
    // 检查当前消息时间是否与前一条消息时间相同
    const currentMessageTime = sendMessagesList.value[currentIndex].time;
    const previousMessageTime = sendMessagesList.value[currentIndex - 1].time;   
    return currentMessageTime !== previousMessageTime;
}



//当 sendMessagesList 发生变化时，聊天窗口都会滚动到最底部，显示最新的消息。
watch(sendMessagesList, () => {
  nextTick(() => {
    if (mainBoxRef.value) {
      mainBoxRef.value.scrollTop = mainBoxRef.value.scrollHeight;
      console.log('已滚动到最底部')
    }
  });
}, {  deep: true, immediate: true });



//初始化websocket的一些必需方法，首先需创建websocket实例
function initWebSocket() {
    //判断浏览器是否支持websocket,注意，这里如果判断发现该浏览器不支持websocket，并不会终止后续代码，只是会在页面给予用户弹窗警告
    if ("WebSocket" in window) {
        websock.value = new WebSocket(`ws://${ip}:${port}/question/${token}`);
    } else {
        alert("该浏览器不支持websocket!");
    }
    websock.value.onopen = webSocketOnOpen;
    websock.value.onmessage = webSocketOnMessage;
    websock.value.onclose = webSocketClose;
    websock.value.onerror = webSocketOnError;
}

//这是websocket连接（握手）时调用的方法
const webSocketOnOpen = () => {
    // ElMessage.success('websocket连接成功');
}

//这是前端接受并处理后端（服务器）返回值的方法
async function webSocketOnMessage (e) {
    //将JSON格式的字符串转换（解析）为JavaScript对象,如将"{ \"id\": 123, \"status\": \"error\" }"换为{id: 123,status: "error"}
    let receivedData = JSON.parse(e.data);
    console.log(receivedData);
    switch(receivedData.user) {
        //判断：如果返回的消息的类型是判断发送的消息有没有发送成功
        case 0:{
            const message = sendMessagesList.value.find(item => item.uuid === receivedData.uuid);
            if (message) {
                if (receivedData.status === 0) {
                    message.status = 0;
                } else if (receivedData.status === 1) {
                    message.status = 1;
                    if(route.path.includes('/ask/')){
                        number.value = receivedData.number;
                    }
                }else if(receivedData.status === 2){
                    const type = await getAskAndQuestionCOSPermission(tempselectedImages.value[0],receivedData.cosSecretDto);
                    sendPictureMessages(receivedData.cosSecretDto.url,2,type,receivedData.uuid);
                }
            }
            break;
        }
        //判断：如果返回的消息的类型是接受的消息
        case 1:{
            // const newMessage = { ...defaultMsgStructure, ...receivedData, imageurl: receivedData.cosSecretDto.url };
            const newMessage = {
                uuid: receivedData.uuid,//该消息对应的uuid
                number:receivedData.number,//如果是提问者发送的消息，则给提问者发送剩余的提问次数
                status:receivedData.status,//是否成功发送消息,未成功0，成功1
                messageType: receivedData.messageType,//判断该消息是图片还是文字，如果为图片的话为0，文字为1
                user: receivedData.user,//判断发送到消息接收者还是消息发送者，发送者为0，接收者为1
                toUserId:receivedData.toUserId,// 消息接收者的id
                fromUserId:receivedData.fromUserId,//消息发送者id
                time: receivedData.time,//消息发送的时间
                content: receivedData.content,//消息内容
                imageurl:'',//图片url
                visibleRef:false,
            };
            if(receivedData.messageType === 0){
                newMessage.imageurl = receivedData.cosSecretDto.url;
            }
            sendMessagesList.value.push(newMessage);
            break;
        }

        default:
            console.error('意义不明的返回消息', receivedData.type);
            ElMessage.error('意义不明的返回消息');
    }
}

//这是websocket连接时出现异常时处理的函数
const webSocketOnError = () => {
    console.log('WebSocket连接失败');
    ElMessage.error('WebSocket连接失败');
}

//这是关闭websocket连接的代码
const webSocketClose = (e) => {
    console.log('已关闭连接', e);
    // ElMessage.success('已关闭连接')
}



const webSocketSend = (data) => {
  console.log('发送数据');
  websock.value.send(JSON.stringify(data));
}

const sendWordMessages = ()  =>{
    const now = new Date();
    const uuid = ref(uuidv4());
    const tempData = {
        uuid:uuid.value,
        // questionId:questionId,
        status: 2,
        user:0,
        messageType:1, //判断该消息是图片还是文字，如果为图片的话为0，文字为1
        toUserId:RouteId,
        fromUserId:userId,
        time: formatDateTime(now),
        content: inputValue.value,
        imageurl: null,
        number:null,
    }
    sendMessagesList.value.push(tempData);
    const tempData2 = {
        uuid:uuid.value,
        questionId:questionId,//对应的问题的id,如果是普通消息的话则为0
        type:messageType.value,//判断此消息时一个回答还是一个提问，如果是0则表示回答，如果是1则表示提问，如果为2，则表示该消息是一个普通的聊天消息
        toUserId:RouteId,
        message: inputValue.value,
        messageType:1,// 消息类型，0表示图片，1表示文字
        isConfirm:1,
        imageurl:null,
        filename:null,
    }
    console.log(tempData2);
    webSocketSend(tempData2);
    inputValue.value ='';
}

const sendPictureMessages = (url,num,type,tempuuid)  =>{
    const now = new Date();
    const uuid = ref(uuidv4());
    if(num === 1){
        const tempData = {
            uuid:uuid.value,
            // questionId:questionId,
            status: 2,
            user:0,
            messageType:0, //判断该消息是图片还是文字，如果为图片的话为0，文字为1
            toUserId:RouteId,
            fromUserId:userId,
            time: formatDateTime(now),
            content: null,
            imageurl: imagePreviews.value[0],
            number:null,
            visibleRef:false,
        }
        sendMessagesList.value.push(tempData);
        const tempData2 = {
            uuid:uuid.value,
            questionId:questionId,//对应的问题的id,如果是普通消息的话则为0
            type:messageType.value,// 判断此消息时一个回答还是一个提问，如果是0则表示回答，如果是1则表示提问，如果为2，则表示该消息是一个普通的聊天消息
            toUserId:RouteId,
            message:null,
            messageType:0,// 消息类型，0表示图片，1表示文字
            isConfirm:type,
            imageurl:url,
            filename:fileName.value,
        }
        webSocketSend(tempData2);
    }else if(num === 2){
        const tempData2 = {
            uuid:tempuuid,
            questionId:questionId,//对应的问题的id,如果是普通消息的话则为0
            type:messageType.value,// 判断此消息时一个回答还是一个提问，如果是0则表示回答，如果是1则表示提问，如果为2，则表示该消息是一个普通的聊天消息
            toUserId:RouteId,
            message:null,
            messageType:0,// 消息类型，0表示图片，1表示文字
            isConfirm:type,
            imageurl:url,
            filename:fileName.value,
        }
        webSocketSend(tempData2);
    }

    tempselectedImages.value = selectedImages.value;
    tempFileName.value = fileName.value;
}


const openrefuse = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要结束该回答吗？',
      {
        confirmButtonText: '确认结束',
        cancelButtonText: '取消',
        type: 'warning',
      }
    );
    endQuestion();
  } catch {
    console.log('关闭弹框')
  }
}


//结束问题
async function endQuestion() {
  try{
    const response = await axios.put(`/answer/myask/end/${questionId}`)
    if(response.data.code === 1){
        ElMessage.success('结束问题成功');
        router.push('/DefaultPresentation');
    }else if(response.data.code === 0 && response.data.msg){
        ElMessage.error(response.data.msg.toString());
    }else{
        console.error("结束问题失败");
        ElMessage.error('结束问题失败');
    }
  } catch (error) {
    console.error("结束问题失败", error); 
    ElMessage.error('结束问题失败');
  }
}

//获取答主具体信息
async function getAnswererInfo() {
  try{
    const response = await axios.get(`/answer/${RouteId}`)
    if(response.data.code === 1){
        answererInfo.value = response.data.data;
        answererInfo.value.verified = await fetchUserInformation(RouteId);
        answererInfo.value.newAvater = await getUsersAvatarFromCOS(answererInfo.value.userId);
        userAvater.value = await getUsersAvatarFromCOS(userId);
        receiveUsername.value =  answererInfo.value.username;
        // ElMessage.success('获取答主具体信息成功');
    }else if(response.data.code === 0 && response.data.msg){
        ElMessage.error(response.data.msg.toString());
    }else{
        console.error("获取答主具体信息失败");
        ElMessage.error('获取答主具体信息失败');
    }
  } catch (error) {
    console.error("获取答主具体信息失败", error); 
    ElMessage.error('获取答主具体信息失败');
  }
}


// (上传图片)当点击按钮时触发文件输入框
const triggerImageUpload = () => {
    if (selectedImages.value.length < 2) {
        imageInput.value.click();
    } else {
        ElMessage.error('只能提交一张照片');
    }
};

//(上传图片)当文件选择后处理图片
const handleImage = async (event) => {
    selectedImages.value.length = 0;
    imagePreviews.value.length = 0;
    const file = event.target.files[0];
    if (selectedImages.value.length < 2) {
        try {
            const timestamp = new Date().getTime(); // 获取当前时间戳
            fileName.value = `${timestamp}-${file.name}`; // 在文件名前加时间戳
            const compressedFile = await compressImage(file);
            const reader = new FileReader();
            reader.onload = function(e) {
                imagePreviews.value.push(e.target.result);
                selectedImages.value.push(compressedFile);
                sendPictureMessages(0,1,0);//第一个0是因为此时后端不需要图片的URL，随便写的0，第二个1是因为对于某个图片信息来说这是第一次调用图片接口，第三个0是因为此时消息还未确定
            };
            reader.readAsDataURL(compressedFile);
            
        } catch (error) {
            console.error(error);
            ElMessage.error('保存图片失败');
        }
    }
    
};

// 获取用户信息
const fetchUserInformation = async (userId) => {
    try {
        const response = await axios.get(`/users/${userId}`);
        if(response.data.code === 1){
            return (response.data.data.verified);
        }else if(response.data.code === 0 && response.data.msg){
            ElMessage.error(response.data.msg.toString());
        }else{
            ElMessage.error('获取用户信息失败');
        }
    } catch (error) {
        console.error("获取用户信息失败", error);
        ElMessage.error('获取用户信息失败');
    }
};


onMounted(() => {
    getAnswererInfo();
    getMessageLog();
    initWebSocket();
});

onUnmounted(() => {
    if (websock.value) {
        websock.value.close();
    }
});


</script>

<style scoped>
.bgc_box{
    width: 100%;
}
.top{
    display: flex;
    align-items: center;
    flex-direction: column;
    padding-bottom: 4px;
    gap: 8px;
}
.one{
    display: flex;
}
.text1{
    color: #3F87E1;
    margin: 0px 10px;
    position: relative;
}
.top span{
    font-size: 20px;
}
.timer{
    color: #BCBCBC;
    text-align: center;
    line-height: 1.6; 
}
.btn{
    width: 32px;
    height: 19px;
    padding: 8px 20px;
    border-radius: 16px;
    background: #9FA9CA;
    color: #fff;
    position: absolute;
    right: 135px;
    top: 15px;
    cursor: pointer;
}
.main_box{
    width: 950px;
    height: 73vh;
    overflow: auto;
    padding: 20px 12px;
    border-radius: 12px;
    border: 1px solid #EEE;
    background: #FAFAFA;
    margin: 0px auto;
    display: flex;
    flex-direction: column;
}
.time{
    color: #626B89;
    text-align: center;
    font-size: 12px;
    line-height: 1.6; 
}
.left_box,
.right_box{
    width: 100%;
    display: flex;
    align-items: center;
    margin-bottom: 10px; 
}
.left_box {
    justify-content: flex-start; 
}

.right_box {
    justify-content: flex-end; 
}
.leftchat,
.rightchat{
    display: flex;
    align-items: flex-start;
}
.leftchat img{
    margin-right: 10px; 
}
.rightchat img {
    margin-left: 10px;
}
.userpic{
    width: 32px;
    height: 32px;
    border-radius: 50%;
}
img.sendpic {
    width: 13rem;
    border-radius: 1.2rem;
}
.conversation_L,
.conversation_R{
    max-width: 530px;
    padding: 12px;
    margin-top: 16px;
    line-height: 1.6;
}
.conversation_L{
    background: #FFF;
    border-radius: 0px 16px 16px 16px;
}
.conversation_R{
    background: #EEF1FF;
    border-radius: 16px 0px 16px 16px;
}
.send-state{
    width: 20px;
    height: 20px;
    background-color: #FAFAFA;
    margin: 16px 8px 0px 0px;
}
::v-deep .el-loading-mask{
    background-color: #FAFAFA;
}
::v-deep .el-loading-spinner{
    position: initial;
    margin-top: 0px;
}
::v-deep .el-loading-spinner .circular{
    width: 20px;
    height: 20px;
}
::v-deep .el-loading-spinner .path{
    stroke: #566183;
}
::v-deep .el-result{
    padding: 0px;
    --el-result-icon-font-size:20px;
}
.bottom{
    display: flex;
    width: 1000px;
    padding: 8px 12px;
    justify-content: center;
    align-items: center;
    gap: 20px;
    margin: 0px auto;
}
/* .bottom input{
    width: calc(100% - 16px);
    height: 19px;
    padding: 8px;
    border-radius: 4px;
    background: #F8F8F8;
    border: 1px solid #F8F8F8;
} */
.inputbox{
    width: 83%;
}
input:focus{
    outline: none;
    box-shadow: 0 1px 7px #dbdae5;
    border: 1px solid #d7d7d7;
}
.send_btn{
    width: 46px;
    height: 16px;
    padding: 8px 14px;
    border-radius: 16px;
    background: #9FA9CA;
    font-size: 14px;
    color: #fff;
    text-align: center;
    line-height: 14px;
    cursor: pointer;
}
.disabled {
  pointer-events: none; /* 禁止鼠标事件 */
  color: grey; /* 可以更改为你想要的“不可点击”的样式 */
  cursor: not-allowed; /* 更改鼠标光标样式 */
}
@media (max-width:768px) {
    .bgc_box{
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        height: 100vh;
    }
    .top{
        margin-top: 2vh
    }
    .main_box{
        width: 96%;
        height: 78vh;
        padding: 0px;
    }
    .bottom{
        width: 96%;
        padding: 0px;
        justify-content: space-between;
        gap: 0px;
        margin: 0 auto 2vh;
    }
    .bottom img{
        width: 1.4rem;
        height: 1.4rem;
    }
    .inputbox{
        width: 75%;
    }
    .btn{
        right: 30px;
    }
    .send_btn{
        width: auto;
        padding: 2% 3%;
    }
    .text{
        font-size: 1rem;
    }
    .timer{
        font-size: 0.9rem;
    }
}
</style>
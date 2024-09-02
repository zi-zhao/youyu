<template>
    <div>
        <div class="then">
            <div class="then-left">
                <div class="recent-mes">
                    最近消息
                </div>
                <div class="dialog-list" >
                    <div  @click="openNewSessionBox(source.userTwo)" class="item" v-for="(source,index) in chatUserData" :key="index" @mouseenter="showclosebtn=true" @mouseleave="showclosebtn=false">
                        <div class="user-pic">
                            <img :src="source.newAvater" alt="">
                        </div>
                        <div class="info">
                            <span class="user-name">{{ source.userNameTwo }}</span>
                            <span class="message-list">{{ source.lastMessage }}</span>
                        </div>
                        <div class="delete-btn" v-show="showclosebtn">
                            <el-icon style="font-size: 14px;"><Close /></el-icon>
                        </div>
                    </div>
                </div>
            </div>
            <div class="then-right">
                <div class="top-name">
                    <span>鱼鱼</span>
                    <img @click="showExtend=true" class="more" src="@/assets/More.svg" alt="">
                </div>
                <div class="extend" v-if="showExtend" @mouseleave="showExtend = false">
                    <span>置顶该聊天</span>
                    <span>开启免打扰</span>
                    <span>举报该用户</span>
                    <span>加入黑名单</span>
                </div>
                <!-- 对话列表  -->
                <div class="main_box" ref="mainBoxRef">
                    <div  v-for="(message, index) in sendMessagesList" :key="message.time">
                        <div v-if="shouldDisplayTime(index)" class="time">
                            {{ message.time }}
                        </div>
                        <div class="left_box" v-if="message.user === 1">
                            <div class="leftchat">
                                <img src="@/assets/fish.png" alt="" class="userpic">
                                <span class="conversation_L">{{ message.content }}</span>
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
                                    <span class="conversation_R">{{ message.content }}</span>
                                </div>
                                <img src="@/assets/fish.png" alt="" class="userpic">
                            </div>
                        </div>
                    </div>   
                </div>
                <div class="icon-box">
                    <img src="@/assets/MessageCenter/UploadPic.svg" alt="">
                    <img src="@/assets/MessageCenter/Expression.svg" alt="">
                    <img src="@/assets/MessageCenter/AboutFile.svg" alt="">
                </div>
                <div class="input-box">
                    <el-input
                        v-model="textarea"
                        maxlength="500"
                        placeholder="请输入"
                        show-word-limit
                        type="textarea"
                        size="large"
                        resize="none"
                    />
                    <div class="send_btn"  @click="sendMessages">发送</div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted,watch, nextTick} from 'vue';
import { ElMessage } from 'element-plus';
import { v4 as uuidv4 } from 'uuid';
import axios from '@/utils/request';
import { getUsersAvatarFromCOS } from '@/utils/cosService';

const ip = '154.8.172.164';
const port = '8081';
const token = localStorage.getItem('token');
const userId = localStorage.getItem("userId");
const chatUserId = ref(null);
const websock = ref(null);
const mainBoxRef = ref(null);//为了使sendMessagesList发生变化时（即有新消息），让聊天界面滚动到底部以显示最新消息功能，将显示聊天消息的盒子设为响应式。
const historyData = ref({});//存放用户历史消息记录
const chatUserData = ref({});//存放用户的好友列表
const textarea = ref('')//输入框中的响应式数据
const showExtend = ref(false)//控制显示右侧点击更多出现的盒子
const showclosebtn = ref(false)//控制显示左侧对话列表的关闭按钮

//存放所有消息数据,user:消息发送者是0，消息接受者是1,status:状态未成功为0，成功是1，待确定是-1,type:问题是1,回答是0
const sendMessagesList = ref([
    { uuid:'123',  status: 1, user:0, toUserId:chatUserId.value, fromUserId:userId, time: '11:59', content: '今天我没回家' ,number:0,type:0},
    { uuid:'124',  status: 1, user:1, toUserId:chatUserId.value, fromUserId:userId, time: '12:00', content: '哈哈，我也没有回家!' ,number:0,type:0},
    { uuid:'125',  status: 0, user:0, toUserId:chatUserId.value, fromUserId:userId, time: '12:01', content: '噢耶^o^' ,number:0,type:0 },
    { uuid:'126',  status: 1, user:1, toUserId:chatUserId.value, fromUserId:userId, time: '12:02', content: '哈哈，你也想哈哈吗' ,number:0,type:0},
    { uuid:'127',  status: 2, user:0, toUserId:chatUserId.value, fromUserId:userId, time: '12:06', content: '那一起哈哈哈吧！' ,number:0,type:0},
    { uuid:'128',  status: 1, user:1, toUserId:chatUserId.value, fromUserId:userId, time: '12:06', content: '怎么不回我消息呢？' ,number:0,type:0},
]);

//获取用户好友列表
async function getUserchatList() {
  try{
    const response = await axios.get(`/userchat/list`,{
        params: {
            currentPage:1,
            pageSize:100
        }
    });
    if(response.data.code === 1){
        chatUserData.value = response.data.data.records;
        for( let record of chatUserData.value ){
            record.newAvater = await getUsersAvatarFromCOS(record.userTwo);
        }
        ElMessage.success('获取用户好友列表成功');

    }else if(response.data.code === 0 && response.data.msg){
        ElMessage.error(response.data.msg.toString());
    }else{
        console.error("获取用户好友列表失败");
        ElMessage.error('获取用户好友列表失败');
    }
  } catch (error) {
    console.error("获取用户好友列表失败", error); 
    ElMessage.error('获取用户好友列表失败');
  }
}


//获取用户历史消息列表
async function getMessageLog(id) {
  try{
    const response = await axios.get(`/answer/message/history`,{
        params: {
            questionId:id,
            currentPage:1,
            pageSize:100
        }
    });
    if(response.data.code === 1){
        const user = ref(0);
        historyData.value = response.data.data.records;
        sendMessagesList.value = historyData.value.map(item => {
            if(item.userId == userId) {
               user.value = 0
            }else if(item.toUserId == id ){
                user.value = 1
            }else{
                ElMessage.error('未知的参数错误');
            }
            return {
                uuid: '', 
                status: 1, 
                type: item.fromUserType, 
                user: user.value, 
                toUserId: item.toUserId, 
                fromUserId: item.userId, 
                time: item.createTime, 
                content: item.content,
                number:0, 
            };
        });

        ElMessage.success('获取用户消息记录成功');

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

const openNewSessionBox = (id) =>{
    chatUserId.value = id;
    getMessageLog(id);
}

const isLoading = (type) => {
    return type === 2;
}
const isLoading2 = (type) => {
    return type === 0;
}

onMounted(async () => {
    await getUserchatList();
    await getMessageLog(chatUserData.value[0].userTwo);
    initWebSocket();
});

onUnmounted(() => {
    if (websock.value) {
        websock.value.close();
    }
});

//一个简单的处理时间的函数
const formatter = new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
});

//判断和上一条消息的时间是否相同
const shouldDisplayTime = (currentIndex) => {
    // 如果是第一条消息，则显示时间
    if (currentIndex === 0) return true;
    // 检查当前消息时间是否与前一条消息时间相同
    const currentMessageTime = sendMessagesList.value[currentIndex].time;
    const previousMessageTime = sendMessagesList.value[currentIndex - 1].time;   
    return currentMessageTime !== previousMessageTime;
}


//包含所有默认属性值的消息对象（按照sendMessagesList）
const defaultMsgStructure = {
    uuid: '',
    status:null,
    user: null,
    toUserId:'',
    fromUserId:'',
    time: '',
    content: '',
    number:null,
    type:null,
};

//当 sendMessagesList 发生变化时，聊天窗口都会滚动到最底部，显示最新的消息。
watch(sendMessagesList.value, () => {
  nextTick(() => {
    if (mainBoxRef.value) {
      mainBoxRef.value.scrollTop = mainBoxRef.value.scrollHeight;
      console.log('已滚动到最底部')
    }
  });
}, { immediate: true });



//初始化websocket的一些必需方法，首先需创建websocket实例
function initWebSocket() {
    //判断浏览器是否支持websocket,注意，这里如果判断发现该浏览器不支持websocket，并不会终止后续代码，只是会在页面给予用户弹窗警告
    if ("WebSocket" in window) {
        websock.value = new WebSocket(`ws://${ip}:${port}/chat/${token}`);
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
    ElMessage.success('websocket连接成功');
}

//这是前端接受并处理后端（服务器）返回值的方法
const webSocketOnMessage = (e) => {
    //将JSON格式的字符串转换（解析）为JavaScript对象,如将"{ \"id\": 123, \"status\": \"error\" }"换为{id: 123,status: "error"}
    let receivedData = JSON.parse(e.data);
    switch(receivedData.user) {
        //判断：如果返回的消息的类型是判断发送的消息有没有发送成功
        case 0:{
            const message = sendMessagesList.value.find(item => item.uuid === receivedData.uuid);
            if (message) {
                if (receivedData.status === 0) {
                    message.status = 0;
                } else if (receivedData.status === 1) {
                    message.status = 1;
                }
            }
            break;
        }
        //判断：如果返回的消息的类型是接受的消息
        case 1:{
            const newMessage = { ...defaultMsgStructure, ...receivedData };
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
    ElMessage.success('已关闭连接')
}



const webSocketSend = (data) => {
  console.log('发送数据');
  websock.value.send(JSON.stringify(data));
}

const sendMessages = ()  =>{
    const now = new Date();
    const uuid = ref(uuidv4());
    const tempData = {
        uuid:uuid.value,
        status: 2,
        user:0,
        toUserId:chatUserId.value,
        fromUserId:userId,
        time: formatter.format(now),
        content: textarea.value,
        number:0,
        type:0,
    }
    sendMessagesList.value.push(tempData);
    const tempData2 = {
        uuid:uuid.value,
        questionId:0,
        type:2,// 判断此消息时一个回答还是一个提问，如果是0则表示回答，如果是1则表示提问，如果为2，则表示该消息是一个普通的聊天消息
        toUserId:chatUserId.value,
        message: textarea.value,
    }
    console.log(tempData2);
    webSocketSend(tempData2);
    textarea.value ='';
}


</script>

<style scoped>
.then{
    width: 78vw;
    height: 89vh;
    display: flex;
    overflow: hidden;
    border-radius: 8px;
    margin-top: 50px;
    border: 1px solid #EEE;;
}
.then-left{
    width: 20%;
    height: 100%;
}
.recent-mes{
    display: flex;
    height: 4%;
    padding: 8px 14px;
    align-items: center;
    border-right: 1px solid #EEE;
    border-bottom: 1px solid #EEE;
    background: #FFF;
    color: #6B757B;
    font-weight: 700;
}
.dialog-list{
    border-right: 1px solid #EEE; 
    height: 94%; 
    overflow: auto;
}
/* 默认情况下，将滑轨设置为白色 */
.dialog-list::-webkit-scrollbar-track {
    background: #fff;  
}
/* 默认情况下，滑块设置为透明 */
.dialog-list::-webkit-scrollbar-thumb {
    background: transparent; 
}
/* 针对Firefox   默认情况*/
.dialog-list {
    scrollbar-width: thin;
    scrollbar-color:  transparent transparent;
}
/* 悬停时 */
.dialog-list:hover::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.2); 
}
.dialog-list:hover {
    scrollbar-color: rgba(0, 0, 0, 0.2) #fff; 
}
.item{
    display: flex;
    width: 165px;
    height: 40px;
    padding: 12px 18px 12px 18px;
    justify-content: flex-start;
    align-items: center;
    gap: 10px;
    position: relative;
    cursor: pointer;  
}
.item:hover{
    background: #EEE;
}
.user-pic img{
    width: 32px;
    height: 32px;
    border-radius: 50%;
}
.info{
    display: flex;
    flex-direction: column;
}
.user-name{
    font-size: 14px;
    line-height: 1.6; 
}
.message-list{
    color: #A9A9A9;
    font-size: 12px;
    line-height: 1.6; 
}
.delete-btn{
    position: absolute;
    top: 23px;
    right: 5px;
    cursor: pointer;
}
.then-right{
    width: 80%;
    position: relative;
}
.top-name{
    display: flex;
    height: 4%;
    padding: 8px 14px;
    justify-content: center;
    align-items: center;
    border-bottom: 1px solid #EEE;
    background: #FFF;
    border-radius: 0px 8px 0px 0px;
    position: relative;
}
.more{
    position: absolute;
    right: 10px;
    width: 18px;
    height: 18px;
    cursor: pointer;
}
.extend{
    width: 70px;
    height: 120px;
    display: flex;
    padding: 12px 16px;
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
    border-radius: 8px;
    border: 1px solid #EEE;
    background: #FFF;
    box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.25);
    position: absolute;
    right: 35px;
    top: 5px;
}
.extend span{
    color: #333;
    text-align: center;
    font-size: 14px;
    line-height: 1.6;
    cursor: pointer; 
}
.extend span:hover{
    color: #7788bf;
}
.main_box{
    height: 58%;
    overflow: auto;
    padding: 20px 12px;
    background: #F6F6F6;
    margin: 0px auto;
    display: flex;
    flex-direction: column;
}
.main_box::-webkit-scrollbar-track {
    background: transparent;  /* 将滑轨设置为透明 */
}
/* 针对Firefox */
.main_box {
    scrollbar-width: thin;
    scrollbar-color: rgba(0, 0, 0, 0.5) transparent;
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
.conversation_L,
.conversation_R{
    max-width: 530px;
    padding: 12px;
    margin-top: 16px;
    line-height: 1.6;
    background: #FFF;
}
.conversation_L{
    border-radius: 0px 16px 16px 16px;
}
.conversation_R{
    border-radius: 16px 0px 16px 16px;
}
.send-state{
    width: 20px;
    height: 20px;
    background-color: #FAFAFA;
    margin: 16px 8px 0px 0px;
}
::v-deep .el-loading-mask{
    background-color: #F6F6F6;
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
.icon-box{
    display: flex;
    gap: 15px;
    padding: 4px 12px;
    border-top: 1px solid #b9b9b9;
    background-color: #F6F6F6;
}
.input-box{
    position: relative;
    height: 27%;
    background-color: #F6F6F6;
}
::v-deep .el-textarea{
    --el-input-hover-border-color:#F6F6F6;
    --el-input-focus-border-color:#F6F6F6;
    height: 88%;
}
::v-deep .el-textarea__inner{
    box-shadow: none;
    border-radius: 0px;
    background-color: #F6F6F6;
    color: #000;
    height: 100%;
}
::v-deep .el-textarea__inner{
    height: 72%;
}
::v-deep .el-textarea .el-input__count{
    background-color: #F6F6F6;
    bottom: 12px;
    right: 90px;
}
.send_btn{
    width: 46px;
    height: 16px;
    padding: 6px 8px;
    border-radius: 16px;
    background: #9FA9CA;
    font-size: 14px;
    color: #fff;
    text-align: center;
    line-height: 14px;
    cursor: pointer;
    position: absolute;
    right: 5px;
    bottom: 23px;
}
@media (max-width: 768px) {
    .first,
    .then{
        width: 800px;
    }
}
</style>
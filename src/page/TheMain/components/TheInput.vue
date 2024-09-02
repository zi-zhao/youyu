<template>
    <div class="large">
        <div class="input-container">
            <div v-if="showMessage" class="custom-message-box">
                <div class="custom-message-content">最多可选三个标签</div>
            </div>
            <div id="labelBox">
                <span v-for="(word, index) in inputLabel" :key="index" class="wordStyle">
                    {{ word }}
                    <i @click="deValue(index)">×</i>
                </span>
                <input
                    ref="inputRef"
                    type="text"
                    v-model="inputText"
                    @keyup.enter="addInputText"
                    placeholder="自定义标签内容在此输入,回车搜索"
                />
            </div>      
        </div>
        <!-- 放置标签 -->
        <div class="l-container">
            <span 
                v-for="(context,index) in label" :key="index"
                @click="change(context)"
            >
            {{ context }}
            </span>
        </div>


    </div>
</template>

<script setup>
    import axios from '@/utils/request';
    import { reactive,ref,onMounted,computed,watch} from 'vue';
    import { useStore } from 'vuex';
    import { ElMessage } from 'element-plus';

    const inputRef = ref(null);//可以通过 inputRef 访问到这个输入框的 DOM 元素(labelbox里的Input),然后通过 inputRef.value 来访问这个元素。
    const store = useStore()
    let showMessage = ref(false);
    let label = reactive([])//存放标签
    let inputLabel = reactive([])//存放文本框中已选择的标签
    let inputText = ref()//存放文本框中用户输入的内容
    let tempInputText = reactive('')//临时存放inputText.value的值

    /**
     * 初次从数据库获取标签label
     * 页面加载时触发
     */ 
    onMounted(() => {
        axios.get('/articlelabel')
        .then((response)=>{
            for(let i = 0;i<16 && i<response.data.data.length;i++){
                label.push(response.data.data[i].name)
            }
        })
        .catch((error)=>{
            console.log(error);
        })
    })

   /**
    * 用户点击任意二级板块后更新标签
    */
    const id = computed(()=>{ return store.state.subBoardId })
    watch(id,(newValue)=>{
        if(newValue !== null){
            label.splice(0,label.length)
            inputLabel.splice(0,inputLabel.length)
            store.commit('SELECT',inputLabel)
            axios.get(`/articlelabel/${id.value}`)
            .then((response)=>{
                for(let i = 0;i<20&&i<response.data.data.length;i++){
                    label.push(response.data.data[i].name)
                }
            })
            .catch((error)=>{
                console.log(error);
            })
        }
    })



    /**
     * 这个方法首先判断文本框中的已选标签是否超过三个，若超过则弹出1秒的警示信息
     * 若未超过则将用户选择的标签放入文本框，同时将数据存入Vuex store
     */
    const change = (context) => {
        if (inputLabel.includes(context)) {
            ElMessage.error( "标签已被选择！"); 
            return;
        }
        if (inputLabel.length >= 3) {
            ElMessage.error( "不能选择超过3个标签！"); 
            return;
        }
        inputLabel.push(context); 
        store.commit('SELECT', inputLabel); 
    };
    /**
     * 删除inputvalue数组里从索引为index参数开始的1个数据
     * 当用户点击文本框中已选标签旁边的“x”时触发
     */
     const deValue = (index) => {
        inputLabel.splice(index, 1);
        store.commit('SELECT',inputLabel);
    }


    /**
     * 将文本框中的内容存入Vuex store中
     * 这个方法在用户按下回车键时触发
     */
    function addInputText(){
        tempInputText = inputText.value;
        store.commit('CUSTOM',tempInputText);
        store.commit('SELECTSTATE',1);
    }

  
</script>


<style scoped>
.large{
    text-align: center;
    margin-top: 20px;
}

.custom-message-box {
    position: absolute;
    width: 165px;
    height: 40px;
    top: -55px; 
    left: 50%;
    transform: translateX(-50%);
    z-index: 1000; 
}

.custom-message-content {
    padding: 10px;
    background-color: #d7d7da;
    color: black;
    border-radius: 10px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.input-container{
    width: 620px;
    height: 40px;
    border-radius: 30px;
    background-color: white;
    margin: 0px auto 15px;
    position: relative;
}
#labelBox{
    height: 40px;
    border-radius: 30px;
    background-color: white;
    display: flex;  /* 添加此行使得标签和输入框在线性布局中 */
    align-items: center;  /* 垂直居中 */
    padding: 0 10px;  /* 为容器添加一些内边距 */
}
/* 设置输入框下方标签样式 */
span{
    display: inline-block;
    margin: 5px;
    padding: 2px 13px;
    color: #000;
    background-color: rgb(255 255 255 / 53%);
    border-radius: 15px;
    font-size: 14px;
    line-height: 25px;
    cursor: pointer;
    user-select: none;
}
.wordStyle{
    display: flex;
    align-items: center;  /* 垂直居中 */
    height: 25px;
    background-color: #8187A5;
    color: white;
}
input{
    flex-grow: 1;  /* 使输入框能够填充容器的剩余空间 */
    margin-left: 5px;  /* 和前一个标签之间的间距 */
    display: inline-block;
    height: 40px;
    padding: 0px 3px;
    font-size: 17px;
    border-radius: 30px;
    border: black;
}
input:focus{
    outline: none;
}
.l-container{
    width: 600px;
    margin: auto;
    overflow-wrap: break-word;
}
/* 对手机屏幕和小尺寸屏幕的样式调整 */
@media (max-width: 768px) {
    .large {
        margin-top: 50px;
    }

    .input-container {
        width: 90%; /* 在小屏幕上使用更大的比例 */
    }

    #labelBox {
        padding: 0 5px; /* 减小内边距 */
    }

    .l-container {
        width: 90%; /* 在小屏幕上使用更大的比例 */
    }

    .custom-message-box {
        width: auto; /* 自动宽度 */
        top: -45px; /* 调整位置 */
        font-size: 14px; /* 调整字体大小 */
    }

    input {
        font-size: 15px; /* 在小屏幕上减小字体大小 */
    }
}
</style>
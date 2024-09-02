<template>
<div class="more"     :style="bgcurl">
    <div class="large">
        <div class="tour">
            <!-- element弹出框插件 -->
            <!-- :style="{backgroundImage: 'url('+backgroudImg+')'}" -->
            <el-popover placement="bottom" :width="365" trigger="hover" v-for="(boardsource,index) in board" :key="index">
                <!-- 
                    弹出框内容，根据循环的index确定渲染一级标签下的二级标签,
                    这里已经实现了根据数据库中一级板块的数量动态构建popover模块,
                    为实现这个效果构建了名为subboard的二维数组
                    （好吧，其实reactive强大的类型转化功能让我觉得这玩意不能叫二维数组，就是个map）
                    当然，我觉得还可以把一级板块和其对应的二级板块进行绑定，这样同样需要两个循环，
                    目前来看和现在所用方法效率差别不大，只是逻辑上更合理一些。
                    onmounted中就不做注释了，这里提及二维数组的概念后理解底下的内容就很简单。
                -->
                <div class="contain">
                    <div class="small" v-for="(subBoardsource, sIdx) in subBoard[index]" @click="getId(subBoardsource.id,subBoardsource.name)" :key="sIdx">
                        <span >
                            {{ subBoardsource.name }}
                        </span>
                    </div>
                </div>
                <!--
                    补个注释：底下的板块是在显示一级板块文字
                -->       
                <template #reference>
                    <div class="m-2">
                        {{ boardsource.name }}
                    </div>
                </template>
            </el-popover>
        </div>
        <TheInput />
        <TheAriticle />
    </div>
</div>

    
</template>

<script setup>
import TheInput from './TheInput.vue'
import TheAriticle from './TheAriticle.vue'
import { computed,ref,onMounted,reactive} from 'vue'
import axios from '@/utils/request';
import { useStore } from 'vuex';

const store = useStore()
const board = reactive([])
const subBoard = reactive([]) // 放置二级板块内容
    
//使用require导入图片静态资源
const darkImage = require('@/assets/TheMain/dark.png');
const lightImage = require('@/assets/TheMain/light.png');
let backgroundImage = ref(require('@/assets/TheMain/dark.png'));
const state = ref({ids: []});

const bgcurl = computed(() => {
        return { backgroundImage: 'url(\'' + backgroundImage.value + '\')' };
    });
        

onMounted(async () => {
    //根据系统时间更换背景
    let currentHour = new Date().getHours();
    if (currentHour >= 18 || currentHour < 7) {
        backgroundImage.value = darkImage;  // 夜晚

    } else {
        backgroundImage.value = lightImage;  // 白天的图片
    }
    try {
        // 获取一级板块
        const response = await axios.get('/board')
       //  const response = await axios.get('/board?apifoxApiId=102350996')
        for (let i = 0; i < response.data.data.length; i++) {
            board.push({
                name: response.data.data[i].name,
                id: response.data.data[i].id
            });
            state.value.ids.push(response.data.data[i].id);
        }

        console.log(state.value);

        // 根据一级板块获取二级板块
        for (let i = 0; i < state.value.ids.length; i++) {
           const subResponse = await axios.get(`/subboard/${state.value.ids[i]}`);
          //     const subResponse = await axios.get(`/subboard/${state.value.ids[i]}?apifoxApiId=102356783`);
            const currentSubBoard = []; // 新的二级板块数组
            for (let j = 0; j < subResponse.data.data.length; j++) {
                currentSubBoard.push({
                    name: subResponse.data.data[j].name,
                    id: subResponse.data.data[j].id
                });
            }
            subBoard.push(currentSubBoard); // 将当前的二级板块数组推入到subboard中
        }
    }catch (error) {
        console.log(error);
    }
})

// 传送点击的二级板块id
function getId(id,name){
    store.commit('GETID',id)
    store.commit('GETNAME',name)
}

</script>

<style scoped>
.more{
    width: 100%;
    background-repeat: no-repeat;
    background-size: 100% 500px;
    margin-top: 40px;
    z-index: -1;
}
.large{
    position: relative;
    z-index: 1;
}
/* 标签样式 */
.tour{
    padding: 60px 100px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}
/* 按钮样式 */
.m-2{
    font-family: Microsoft YaHei;
    font-size: 32px;
    font-style: normal;
    font-weight: 700;
    line-height: normal;
    letter-spacing: 9.6px;
    color: white !important; 
    position: relative;
    margin-left: 0px;
}
.m-2::after {
  content: attr(data-text);
  position: absolute;
  bottom: -150%;
  transform: scaleY(-1);
  color: white;
  mask-image: linear-gradient(to top, rgba(254,254,254,0.2), rgba(254,254,254,0));
  -webkit-mask-image: linear-gradient(to top, rgba(254,254,254,0.2), rgba(254,254,254,0));
}
.m-2:hover{
    color: #ADB5DE !important;
}
/* a标签样式 */
.contain{
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    background-color: #F4F8FB;
}
.small{
    align-items: center;
    padding: 14px 26px;
    margin: 2px 0px 10px 10px;
    cursor: pointer;
}
.small span{
    color: #000;
    font-family: Microsoft YaHei;
    font-size: 18px;
    font-weight: 400;
    text-decoration-line: underline;
    text-decoration: none;
    text-decoration-skip-ink:none;
    padding-bottom: 2px;
    display: inline-block;
    transition: transform 0.5s ease;
}
/* 设置鼠标悬停样式 */
.small:hover{
    border-radius: 8px;
    background: #8187A5;
    box-shadow: 4px 4px 4px 0px rgba(0, 0, 0, 0.10);
}
.small:hover span{
    color: #FDFBF6;
    font-family: Microsoft YaHei;
    font-size: 18px;
    font-style: normal;
    font-weight: 400;
    line-height: normal;  
    transform: translateY(-5px);
}
/* 对手机屏幕和小尺寸屏幕的样式调整 */
@media (max-width: 768px) {
    .more {
        padding: 10px 0px; /* 增加一些内边距 */
    }

    .large {
        margin: 20px 0; /* 调整边距 */
    }

    .tour {
        padding: 20px 15px;
        display: flex;
        flex-wrap: wrap;
    }

    .m-2 {
        font-size: 20px; 
        padding-left: 10px;
        margin-bottom: 10px; 
    }
    .m-2::after {
        display: none;
    }
    .contain {
        flex-direction: column; /* 列式布局 */
    }

    .small {
        margin: 5px 0; /* 减少边距 */
    }

    .small span {
        font-size: 16px; /* 减小字体大小 */
    }
}
</style>
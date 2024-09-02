<template>
    <div class="part_3">
        <div class="large_3">
            <div class="text">
                <span class="title">许多大学生</span>
                <span class="title">在用有渔</span>
                <span class="title">分享经验</span>
                <a href="">加入讨论</a>
            </div>
             <!-- 六个推送框  -->
            <div class="box_contain1">
                <div v-for="(con, index) in context" :key="con.id"  :class="'box_'+index">
                    <div class="header">
                        <img :src="con.url" alt="">
                        <span class="name">{{ con.name }}</span>
                    </div>
                    <div class="context">
                        <p>{{ con.text }}</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { reactive, onMounted} from 'vue';
    
    // 显示内容
const context = reactive([
    {id:0,url:require("@/assets/fish.png"),name:'肚子圆滚滚',text:'在广阔无垠的海洋里，你以岛屿的形态孤独地航行，却以鲸的灵魂自由潜游。你的声音穿越深海，响彻云霄。虽然孤独，但你的每一次呼吸都是对自由的颂歌，每一个翻滚都诉说着不屈的故事。愿你在这个虚拟的海洋中，找到属于自己的航道，成为最璀璨的星辰。'},
    {id:1,url:require("@/assets/fish.png"),name:'上邪',text:'感谢您在浩瀚网络中发现了这里，我们竭力为您打造一款纯粹而高效的大学生信息交互平台，这份初心，山无棱，天地合，乃敢易其志。'},
    {id:2,url:require("@/assets/fish.png"),name:'云间',text:'自由自我，高唱歌曲，走遍千里。望你一生不羁放纵爱自由，在知识的沃土中寻找自己愿意学的、渴望学的，愿我们都有海一般辽阔，天一般空旷的无限未来'},
    {id:3,url:require("@/assets/fish.png"),name:'小庄别睡了',text:'对未来的真正慷慨，是把一切都献给现在。愿你如同勇敢的鲸鱼，穿越知识的海洋，寻找属于自己的智慧宝藏。'},
    {id:4,url:require("@/assets/fish.png"),name:'汪汪碎冰冰',text:'漫漫行途。浑噩是四年，精彩是四年，无论怎样，这四年终是要过了。既已如此，为何不似天空流星、展现如夏花般的绚烂，纵使很快燃尽、凋零，也能在人生最美的时段留下一抹值得回味的底色。心之所向，素履以往，愿你前程似锦，眼底有光～'},
    {id:5,url:require("@/assets/fish.png"),name:'chw.1',text:'欢迎来到有渔～这里提供丰富的学习资源，结交志同道合的学习伙伴。我相信只要你保持一颗积极的心和持续的努力，就一定能够取得理想的成果和收获。黎明之前是黑暗，放弃就是大笨蛋～'}
])
// 判断鼠标滚动距离，改变第二行的margin-top值
onMounted(() => {
    let box_3 = document.getElementsByClassName("box_3")[0]; 
    let box_4 = document.getElementsByClassName("box_4")[0]; 
    let box_5 = document.getElementsByClassName("box_5")[0]; 
    let boxContainer = document.getElementsByClassName("box_contain1")[0];
    document.addEventListener("scroll",function(){
        let boxContainerTop = boxContainer.getBoundingClientRect().top;
        let windowHeight = window.innerHeight;

        if(boxContainerTop <= windowHeight * 0.5){
            box_3.style.marginTop = "0px";
            box_4.style.marginTop = "-20vh";
            box_5.style.marginTop = "-10vh";
        } else {
            // 重置为初始状态，这取决于你的具体需求
            box_3.style.marginTop = "400px";
            box_4.style.marginTop = "400px";
            box_5.style.marginTop = "400px";
        }
    })
});
</script>

<style scoped>
.part_3{
    background-color: #fdfbf6;
    background-image: url("@/assets/TheFirst/DiscussBgi.png");
    margin-top: 70px;
    background-position: right top; /* 把背景图定位到右上角 */
    background-repeat: no-repeat; /* 防止背景图重复 */
    background-size: 161px 371px; /* 设置背景图的大小 */
}
.large_3{
    width: 88%;
    margin: 0 auto;
}
.text{
    margin-left: 70px;
    height: 240px;
}
.title{
	font-family: MicrosoftYaHei;
	font-size: 36px;
    line-height: 1.5;
	color: #000000;
    display: block
}
a{
    display: block; /* 让链接元素具有块级属性，以便设置宽高 */
    text-decoration: none;
	width: 100px;
	font-family: MicrosoftYaHei;
	font-size: 22px;
    line-height: 1.5;
	color: #1858e9;
    margin: 15px 20px 0px;
}
.box_contain1{
    width: 100%;    
    margin: 20px 10px;
    padding-top: 10px;
    display: flex;
    justify-content: space-around;
    flex-wrap: wrap;
    overflow: hidden;
}
.box_0,.box_1,.box_2,.box_3,.box_4,.box_5{
    width: 26%;
    max-width: 360px;
    border-radius: 16px;
	border: solid 1px #dadfe4;
    box-shadow: 0 0 10px 2px #b4cad6;
    margin-bottom: 10vh;
    padding-left: 15px;
    padding-right: 15px;
}
.box_0,.box_4{
    height: 55vh;
    overflow-y: hidden;
    text-overflow: ellipsis;
}
.box_1,.box_3{
    height: 35vh;
    overflow-y: hidden;
    text-overflow: ellipsis;
}
.box_2,.box_5 {
    height: 45vh;
    overflow-y: hidden;
    text-overflow: ellipsis;
}
.box_3{
    margin-top: 400px;
    transition: margin-top 1s ease-out;
}
.box_4{
    margin-top: 400px;
    transition: margin-top 1s ease-out;
}
.box_5{
    margin-top: 400px;
    transition: margin-top 1s ease-out;
}
img{
    width: 36px;
    height: 36px;
    box-shadow: 2px 2px 4px 0px  #0c3f7a;
    border-radius: 18px;
    }
.header{
    display: flex;
    align-items: center;
    height: 70px;
    padding-top: 5px;
}
.name{
	height: 20px;
    line-height: 20px;
	font-family: MicrosoftYaHei;
	font-size: 20px;
    margin-left: 10px;
    letter-spacing: 1px;
}

.more{
    margin-left: 150px;
    opacity: 0.25;
}

.context{
    font-size: 18px;
    line-height: 35px;
    margin-left: 30px;
    margin-right: 30px;
}
</style>
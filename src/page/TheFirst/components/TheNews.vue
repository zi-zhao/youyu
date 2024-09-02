<template>
    <div class="part_2">
        <!-- 轮播图部分 -->
        <div class="background">
            <div class="large_2">
                <el-carousel :height="height" :autoplay="false" indicator-position="outside">
                    <el-carousel-item v-for="(source,index) in content " :key="index"> 
                        <div class="small">
                            <div class="text">
                                <span class="text1">{{ source.title }}</span> 
                                <span class="text2">{{ source.introduction }}</span> 
                            </div>
                        </div>
                    </el-carousel-item>
                </el-carousel>
            </div>
        </div>
        <!-- 更多新闻 -->
        <!-- <div class="button_contain">
                <button class="button" @click="goToNewList()" >更多新闻</button>
        </div> -->
    </div>
    
</template>

<script>

import { useRouter } from 'vue-router'
import { ref,reactive,onMounted } from 'vue'
import axios from '@/utils/request';

export default({
    name: 'TheNews',
    setup() {
        const router = useRouter();
        let content = reactive([]);
        let newNum = 4;
        let height = ref('460px'); 

        function goToNewList() {
            // 这里涉及到重定向 我不清楚你们之前的逻辑，就没用router.push，只更改了路由路径
          // const routeLocation = router.resolve({ path: '/NewsLists', query: { noRedirect: true } });
            const routeLocation = router.resolve({ path: '/NewsCenter', query: { noRedirect: true } });
            window.open(routeLocation.href, '_blank');
            
        }
        
        //获取头条新闻
        const fetchData = async () => {
            try {
                const response = await axios.get('/news');
                let i = 0
                for(;i<newNum;i++){
                    content.push({
                        title:response.data.data[i].title,
                        introduction:response.data.data[i].introduction,
                    });
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        onMounted(fetchData);

        return {
            goToNewList,
            content,
            height
        };
    }
});
</script>

<style scoped>
.el-carousel__container{
    height: auto;
}
 /* 左箭头 鼠标未悬停 */
::v-deep .el-carousel__arrow--left{
    top: 370px;
    left: 20px;
    width: 40px;
    height: 40px;
    font-size: 30px;
    color: #fdfbf6;
    background-color: #a3a3a3;
}
/* 右箭头 鼠标未悬停 */
::v-deep .el-carousel__arrow--right{
    top: 370px;
    right: 20px;
    width: 40px;
    height: 40px;
    font-size: 30px;
    color: #fdfbf6;
    background-color: #a3a3a3;
}
/* 左右箭头鼠标悬停 */
::v-deep .el-carousel__arrow--left:hover,
::v-deep .el-carousel__arrow--right:hover {
        color: #fdfbf6;
        background-color: #313131;
}
/* 滑块的位置 */
::v-deep .el-carousel__indicators--horizontal {
    display:block;
    margin:0 auto;
    text-align: center;
}
/* 圆形滑块 */
::v-deep .el-carousel__indicator--horizontal button {
    width: 15px;
    height: 15px;
    background: #b3b8bb;
    border-radius: 50%;
    opacity: 1;    
    margin: 0px 3px;
}
/* 胶囊型滑块 */
::v-deep .el-carousel__indicator--horizontal.is-active button {
    width: 30px;
    height: 15px;
    background: #035490;
    opacity: 1;
    border-radius: 8px;    
}
/* 更改悬停时滑块的颜色 */
::v-deep .el-carousel__indicator--horizontal:hover button {
    background: #b3b8bb;
    opacity: 1;
}
::v-deep .el-carousel__indicator--horizontal.is-active:hover button {
    background: #035490;
    opacity: 1;
}
/* 滑块居中 */
::v-deep .el-carousel__indicators .el-carousel__indicators--horizontal .el-carousel__indicators--outside{
    display: flex;
    justify-content: center;
}
::v-deep .el-carousel__container{
    margin-bottom: 55px;
}
.part_2{
    height: 670px;/*高度固定，宽度自适应*/
}
.background{
    height: 610px;/*轮播图背景宽度自适应*/
	/* background-image: linear-gradient(180deg, #fdfbf6 100%); */
    background-image: url('@/assets/TheFirst/NewsBgi.png');
    background-repeat: no-repeat; /* 不重复 */
    background-size: 100% 100%; /* 宽度为 100%，高度自动 */
    background-position: center bottom; /* 位于盒子底部并水平居中 */
}
.large_2{
    width: 88%;/*轮播图内容宽度固定*/
    height: 610px;
    margin: 0 auto;
}
.small{
    width: 100%;
    display: flex;
    justify-content: space-around;
    align-items: flex-start;
    padding: 260px 45px 0px;
}
img{
	width: 100%;
	height: 100%;
    object-fit: contain; /* 可选，保持图片的纵横比 */
} 
.picture{
    width: 22%;
	height: 22%;
    margin-top: 40px;
    float: left;
    display: inline;        
}
.text{
    width: 60%;
    margin-right: 75px;
}
.text1{
    width: 100%;
    font-size: 30px;
    display: block;
    margin-bottom: 30px;
    text-align: center;
    font-weight: 700;
}
.text2{
    width: 100%;
    font-size: 22px;
    display: block;
    line-height: 1.5;
}
.button_contain{
    display: flex;
    justify-content: center;
    margin-top: 20px;
}
.button{
	width: 120px;
	height: 40px;
	background-color: #252c48;
    color: #fdfbf6;
    cursor: pointer;
}
</style>
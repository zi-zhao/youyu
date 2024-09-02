<template>
    <div class="container">
        <div class="latest-news" style="border-left: 1px #EEEEEE solid;">
            <span >最新新闻</span>
            <div class="site-intro" @click="goToNewsPage(newsData[0].id)">
                <h2>{{newsData[0].title}}</h2>
                <div class="news-content">{{newsData[0].introduction }}</div>
                <div class="time">{{newsData[0].createTime}}</div>
            </div>
            <div class="site-intro" @click="goToNewsPage(newsData[1].id)">
                <h2>{{newsData[1].title}}</h2>
                <div class="news-content"> {{newsData[1].introduction }}</div>
                <div class="time">{{newsData[1].createTime}}</div>
            </div>
        </div>
        <el-carousel class="el-carousel" trigger="click" indicator-position="outside" :interval="4000">
            <el-carousel-item v-for="item in carouselItems" :key="item.id">
                <img :src="item.imageUrl" class="carousel-image" />
            </el-carousel-item>
        </el-carousel>
        <div class="latest-news" style="border-right: 1px #EEEEEE solid;">
            <span>最热新闻</span>
            <div class="site-intro" @click="goToNewsPage(newsData[2].id)">
                <h2>{{ newsData[2].title }}</h2>
                <div class="news-content">{{newsData[2].introduction }}</div>
                <div class="time">{{newsData[2].createTime}}</div>
            </div>
            <div class="site-intro" @click="goToNewsPage(newsData[3].id)">
                <h2>{{ newsData[3].title }}</h2>
                <div class="news-content"> {{newsData[3].introduction }}</div>
                <div class="time">{{newsData[3].createTime}}</div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref,onMounted} from 'vue';
import { useRouter } from 'vue-router';
import axios from '@/utils/request';
import { ElMessage } from 'element-plus';

const router = useRouter();
const newsData = ref([
    {},{},{},{}
]);

const goToNewsPage = (id) =>{
  router.push(`/NewsPage/${id}`)
}


//获取头条新闻分页数据
const fetchData = async () => {
  try {
    const response = await axios.get('/news');
    if(response.data.code === 1){
      newsData.value = response.data.data;
    }else if(response.data.code === 0 && response.data.msg){
        ElMessage.error(response.data.msg.toString());
    }else{
      ElMessage.error('获取头条新闻分页失败');
    }
  } catch (error) {
    console.error(error);
    ElMessage.error('获取头条新闻分页失败');
  }
};

onMounted(() => {
    fetchData();
});


</script>

<style lang="scss" scoped>
.container {
    padding: 2rem 3rem 0;
    display: flex;
    justify-content: space-between;

    .latest-news {
        width: 25%;
        border-bottom: 1px #EEEEEE solid;
        .site-intro{
            height: calc((80vh - 46.5px - 4rem) / 2);
            padding: 1rem 1.5rem;
            border-top: 1px #EEEEEE solid;
            position: relative;
            cursor: pointer;
            .time{
                position: absolute;
                font-size: 14px;
                right: 0.3rem;
                bottom: 0.5rem;
                color: #292929;
            }
            .news-content{
                line-height: 1.6;
            }
        }
        span{
            display: inline-block;
            font-size: 20px;
            font-weight: 700;
            margin: 10px 0px;
            width: 100%;
            text-align: center;
        }
        .news-list{
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            height: calc(80vh - 43.5px);
        }
    }
    .el-carousel {
        width: 50%;
        height:80vh;
        flex-grow: 1;
        border: 1px solid #EEEEEE;
        .el-carousel-item {
            width: 300px;
        }
        :deep .el-carousel__container{
            height: 75vh ;
        }
    }
}

</style>
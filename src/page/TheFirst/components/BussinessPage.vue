<template>
    <div class="part_4">
        <div class="large_4">
            <div class="box">
                <span class="title">商务合作</span>
                <div class="content">
                    <span class="context">想要将这个网站推广出去吗?请联系我们!</span>
                    <span class="context">想让更多人知道有渔吗?一起加入我们！</span>
                    <span class="context">请与我们联系,进行商务合作洽谈!</span>
                    <a href="">了解详情</a>
                </div>
            </div>
            <div class="box">
                <span class="title">校园授渔人合作</span>
                <div class="content">
                    <span class="context">想要将你的获奖经验分享给大家吗?</span>
                    <span class="context">想要帮助到更多大学生吗?</span>
                    <span class="context">快快加入有渔,让你的经历得到推广,让彼此得到更多收获!</span>
                    <a href="">了解详情</a>
                </div>
            </div>
        </div>
        <div class="picture">
            <img  class="img" src="@/assets/TheFirst/BusinessBottom.png" alt="">
        </div>    
    </div>
</template>

<script>

</script>

<style scoped>
.part_4{
    height: 720px;
    margin-top: 100px;
    background-image: url("@/assets/TheFirst/BussinessBgi.png");
    background-repeat: no-repeat; /* 防止背景图重复 */
    background-size: 100% 100%; /* 设置背景图的大小 */
}
.large_4{
    width: 88%;
    height: 50%;
    margin: 60px 110px 0px;
    margin: 0 auto;
    padding-top: 100px;
    display: flex;
    justify-content: space-between;
}
.box{
    width: 36%;
    height: 100%;
    margin: 0 20px;
    position: relative;
}
/* .content{
    padding: 0 auto;
} */
a{
    position: absolute;
    bottom: 0px;
    right: 0;
	width: 118px;
	height: 19px;
	font-family: MicrosoftYaHei;
	font-size: 20px;
	color: #2565e9;
    text-decoration: none;
}
.title{
    height: 32px;
	font-family: MicrosoftYaHei-Bold;
	font-size: 32px;
    line-height: 32px;
    display: block;
    margin-bottom: 60px;
    text-align: center;
}
.context{
    display: block;
	/* width: 400px; */
	font-family: MicrosoftYaHei;
	font-size: 22px;
    line-height: 40px;
}
.picture{
    width: 300px;
    height: 190px;
    margin: 70px auto 100px;
}
.img{
    width: 100%;
    height: 100%;
}
</style>
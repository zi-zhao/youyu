<template>
    <div class="part_1">
        <div class="large_1">
            <div class="mainpic">
                <img class="main" src="https://youyu-bucket-1-1319554411.cos.ap-chengdu.myqcloud.com/static/%E5%A4%A7%E8%9E%BA%E5%9B%A2%E9%98%9F%E7%BD%91%E9%A1%B5%E4%B8%BB%E5%9B%BE%E7%99%BD%E8%83%8C%E6%99%AF.png">
            </div>
            <div class="picture">
                <img class="fish" src="@/assets/fish.png" alt="">
                <img class="youyu" src="@/assets/TheFirst/youyu.png " alt="">
            </div> 
            <div class="little">
                <div class="font" @click="download">登录</div>
                <span class="line">|</span>
                <div class="font" @click="register">注册</div>
                <span class="line">|</span>
                <span class="font" @click="goMain">进入主页</span>
            </div>
        </div>
    </div>
    <div v-if="loginDialogVisible">
        <LoginDialog v-model="loginDialogVisible"></LoginDialog>
    </div>
    <div v-if="registerDialogVisible">
        <RegisterDialog v-model="registerDialogVisible"></RegisterDialog>
    </div>

</template>

<script setup>
    import { useRouter } from 'vue-router';
    import { ref } from 'vue';
    import LoginDialog from './TheDialog/LoginDialog.vue';
    import RegisterDialog from './TheDialog/RegisterDialog.vue';

    const loginDialogVisible = ref(false);
    const registerDialogVisible = ref(false);
    const download = ()=>{
        loginDialogVisible.value = true;
    }
    const register = ()=>{
        registerDialogVisible.value = true;
    }
    const router = useRouter()
    const goMain = () => (
        router.push('/TheMain')
    )
</script>

<style scoped>
.part_1 {
  background-size: auto;
  background-repeat: no-repeat;
}
.large_1{
    width: 88%;
    height: 90vh;
    margin: 0 auto;
}
.mainpic{
    display: flex;
    justify-content: center;
}
.main{
	height: 65vh;
}
.picture{
    display: flex; /* 使用 Flex 布局 */
    justify-content: center; /* 在水平方向上居中内容 */
    align-items: center; /* 在垂直方向上居中内容 */
    margin-top: 20px;
}

.youyu {
	width: 130px;
	height: 80px;
	background-image: linear-gradient(90deg, );
	border-radius: 0px;
    margin-left: 34px; 
}

.fish{
	width: 50px;
	height: 50px;
	background-image: linear-gradient(90deg, 
		);
	box-shadow: 4px 4px 4px 0px 
		rgba(0, 0, 0, 0.25);
	border-radius: 50%;
}
.little{
    width: 70%;
    text-align: center;
    display:flex;
    justify-content: space-between;
    align-items: center;
    margin: 10px auto;
}
.font{
    margin: 0px auto;
	font-family: MicrosoftYaHei;
	font-size: 26px;
    line-height: 26px;
	font-weight: normal;
	font-stretch: normal;
	letter-spacing: 0px;
	color: #000000;
    text-decoration: none;
    cursor: pointer;
}
.line{
	width: 4px;
    color: #888888;
    font-size: 35px;
}
/* 对手机屏幕和小尺寸屏幕的样式调整 */
@media (max-width: 768px) {
    .part_1{
        height: 100vh;
        display: flex;
        align-items: flex-end;
        background-image: url("@/assets/TheFirst/footer.png");
        background-position: bottom;
        background-size: cover;
    }
    .large_1{
        height: auto;
    }
    .mainpic,
    .line{
        display: none;
    }
    .picture{
        flex-direction: column;
        margin-bottom: 25vh;
    }
    .fish{
        width: 5rem;
        height: 5rem;
        margin-bottom: 5vh;
    }
    .youyu{
        margin-left: 0;
    }
    .little{
        height: 21vh;
        flex-direction: column;
        margin: 1rem auto 4.5rem;
    }
    .font{
        font-size: 1.3rem;
    }
}
    
</style>
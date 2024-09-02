<template>
    <div class="part_5">
        <div class=".large_5">
        <div class="one_contain">
            <span class="one">准备好加入我们了吗</span>
        </div>
        <div class="two_contain">
            <span class="two">探索在美赛中完成壮举的同学们的激动人心之旅，从他们的经验中学习，找到属于自己的胜利之匙。</span>
        </div>
        <div class="three">
            <img  class="ship" src="@/assets/TheFirst/BottomShip.png" alt="">
            <!-- <div  class="register">
                <span @click="register">立即注册</span>
            </div> -->
        </div>
    </div>
    </div>
</template>

<script setup>
import store from '@/store';

    const register = ()=>{
        store.commit('REGISTER',true)
    }
</script>

<style scoped>
.part_5{
    padding-top: 200px;
}
.large_5{
	width: 88%;
	height: 500px;
    margin: 0 auto;
}
.one_contain{
    text-align: center;
}
.one{
	font-family: CherryBombOne-Regular;
	font-size: 45px;
    letter-spacing: 6px;
}
.two_contain{
	width: 330px;
    margin: 20px auto 0px;
}
.two{
	font-family: MicrosoftYaHei;
	font-size: 14px;
    line-height: 20px;
    letter-spacing: 1px;
	color: #8c8b8b;
}
.three{
	width: 90px;
    margin: 80px auto 0px;
    text-align: center;
}
.ship{
    width: 60px;
}
.register{
    height: 45px;
    width: 90px;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    border: solid 1px #eae8e6;
    border-radius: 16px;
    background-color: #faf8f3;
	box-shadow: 10px 10px 30px 0px 
		rgba(63, 62, 62, 0.18), 
		inset 0px 0px 1px 0px 
		#eae7dc, 
		inset -10px -10px 30px 0px 
		rgba(255, 255, 255, 0.8);
	border-radius: 16px;
	opacity: 0.9;
    margin-top: -39px;
}
.three span{
	font-family: MicrosoftYaHei;
	font-size: 18px;
    display: block;
	color: #4a4a4a;
}
</style>
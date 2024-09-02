<template>
    <div class="part_6">
        <div class="large_6">
            <div class="one">
                <img class="logo" src="@/assets/fish.png" alt="">
                <div class="text_contain">
                    <span class="text">From Ordinary to Extraordinary</span>
                </div>
            </div>
            <div class="two">
                <div class="column_1">
                    <div class="header">主页</div>
                    <ui class="list">
                        <li class="list_item"><a href="">美赛专区</a></li>
                    </ui>
                </div>
                <div class="column_1">
                    <div class="header">关于我们</div>
                    <ui class="list">
                        <li class="list_item">网站简介</li>
                        <li class="list_item">网站愿景</li>
                    </ui>
                </div>
                <div class="column_1">
                    <div class="header">在有渔工作</div>
                    <ui class="list">
                        <li class="list_item" @click="navigateToCustomerService">联系我们</li>
                        <li class="list_item"><a href="https://mp.weixin.qq.com/s/Pfzp6-xNTAcCYoCaVmZSYA">商务合作</a></li>
                        <li class="list_item">校园授渔人合作</li>
                    </ui>
                </div>
                <div class="column_1">
                    <div class="header">帮助</div>
                    <ui class="list">
                        <li class="list_item" @click="navigateToCustomerService">常见问题</li>
                        <li class="list_item">在线反馈</li>
                    </ui>
                </div>
            </div>
        </div>
        <div style="width: 100%;height: 45px;margin: 0 auto;display: flex;align-items: center;justify-content: center;position: relative;">
            <div class="box-text" style="left: 2rem;">
                <div class="text-bottom router-text" @click="goToUserAgreement">用户协议</div>
                <div class="text-bottom router-text" @click="goToCommunityNorm">社区规范</div>
                <div class="text-bottom router-text" @click="goToCurrencyAgreement">货币协议</div>
            </div>
            <a href="https://beian.miit.gov.cn/" class="text-bottom" target="_blank">陕ICP备2023020351号</a>
            <div class="box-text" style="right: 2rem;">
                <div class="text-bottom">联系邮箱：youyu231206@163.com</div>
                <div class="text-bottom">QQ社区：675985828</div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { openUrl } from '@/utils/routeJudge'

const router = useRouter()

const navigateToCustomerService = () => {
    // const routeLocation = router.resolve({ path: `/CustomerService` });
    // window.open(routeLocation.href, '_blank');
    openUrl(`/CustomerService`)
}

// 跳转至用户协议
const goToUserAgreement = () =>{
    // const routeLocation = router.resolve({ path: `/UserAgreement` });
    // window.open(routeLocation.href, '_blank');
    openUrl(`/UserAgreement`)
}
// 跳转至社区规范
const goToCommunityNorm = () =>{
    // const routeLocation = router.resolve({ path: `/CommunityNorm` });
    // window.open(routeLocation.href, '_blank');
    openUrl(`/CommunityNorm`)
}
// 跳转至货币协议
const goToCurrencyAgreement = () =>{
    // const routeLocation = router.resolve({ path: `/CurrencyAgreement` });
    // window.open(routeLocation.href, '_blank');
    openUrl(`/CurrencyAgreement`)
}

</script>

<style scoped>
.part_6 {
    /* height: 270px; */
    background-image: url("@/assets/TheFirst/footer.png");
}

.large_6 {
    width: 88%;
    height: 100%;
    padding-top: 15px;
    margin: 0 auto;
    display: flex;
    justify-content: space-around;
    position: relative;
}

.one {
    width: 35%;
    height: 38%;
    display: flex;
    align-items: center;
    margin-top: 110px;
}

.logo {
    width: 80px;
    height: 80px;
    box-shadow: 4px 4px 4px 0px rgba(0, 0, 0, 0.25);
    border-radius: 50%;
    opacity: 0.9;
}

.text_contain {
    width: 65%;
    display: inline-block;
    margin-left: 10%;
}

.text {
    font-family: Lato-BoldItalic;
    font-size: 170%;
    letter-spacing: 0px;
    color: #3863b7;
}

.two {
    width: 45%;
    margin-left: 100px;
    margin-top: 50px;
    display: flex;
    position: relative;
    /* 添加这行以便对内部伪元素进行定位 */
}

.column_1 {
    margin: 5% 3%;
    display: flex;
    align-items: flex-start;
    flex-direction: column;
    flex-grow: 1;

}

.header {
    width: 140%;
    font-size: 130%;
    white-space: nowrap;
    font-family: MicrosoftYaHei-Bold;
    padding-bottom: calc(15px + .1em);
    border-bottom: solid 1px #909090;
    margin-bottom: 20px;
}

.list_item {
    margin-bottom: 10%;
    list-style: none;

}

a {
    text-decoration: none;
    font-family: MicrosoftYaHei-Bold;
    color: black;
}

li:hover {
    cursor: pointer;
}
.box-text{
    position: absolute;
    display: flex;
    align-items: center;
    gap: 2rem;
}
.text-bottom{
    font-size: 14px;
    color: gray;
}
.router-text{
    cursor: pointer;
}
</style>
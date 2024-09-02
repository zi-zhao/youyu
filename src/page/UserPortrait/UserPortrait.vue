<template>
    <TheHeader></TheHeader>
    <div class="bgc-box">
        <div class="large-box">
            <component :is="components[currentComponent]"></component>
            <div class="next-btn" @click="showNextComponent">
                {{ currentComponent === 'InterestedUploader' ? '开启有渔之旅' : '下一步' }}
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import TheHeader from "../components/TheHeader.vue";
import TheWelcome from './TheWelcome.vue';
import InterestedField from './InterestedField.vue';
import InterestedUploader from './InterestedUploader.vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const currentComponent = ref('TheWelcome');// 跟踪当前要显示的组件的名字

const components = {
    TheWelcome,
    InterestedField,
    InterestedUploader
};

// 更新当前组件的名字
const showNextComponent = () => {
    if (currentComponent.value === 'TheWelcome') {
        currentComponent.value = 'InterestedField';
    } else if (currentComponent.value === 'InterestedField') {
        currentComponent.value = 'InterestedUploader';
    } else if (currentComponent.value === 'InterestedUploader') {
        router.push('/TheMain'); // 在这里执行路由跳转
    }
}
</script>

<style scoped>
.bgc-box{
    display: flex;
    align-items: center;
    height: 92vh;
}
.large-box{
    width: 800px;
    height: 300px;
    margin: 25% auto;
    border-radius: 20px;
    background: #FFF;
    background-image: url('../../assets/UserPortrait/BigBackground.png');
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
}
.next-btn{
    min-width: 30px;
    max-width: 100px;
    height: 15px;
    display: flex;
    padding: 10px 20px;
    justify-content: center;
    align-items: center;
    gap: 10px;
    margin-bottom: 15px;
    border-radius: 20px;
    background: #9FA9CA;
    color: #fff;
    cursor: pointer;
}
</style>
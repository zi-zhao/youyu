<template>
    <div class="all">
      <FirstPage></FirstPage>
      <!-- <TheNews v-if="!isMobile"></TheNews>
      <DiscussPage v-if="!isMobile"></DiscussPage>
      <BussinessPage v-if="!isMobile"></BussinessPage>
      <JoinPage v-if="!isMobile"></JoinPage>
      <TheLast v-if="!isMobile"></TheLast> -->
      <!-- <TheNews v-if="!isMobile"></TheNews> -->
      <DiscussPage v-if="!isMobile"></DiscussPage>
      <BussinessPage v-if="!isMobile"></BussinessPage>
      <JoinPage v-if="!isMobile"></JoinPage>
      <TheLast v-if="!isMobile"></TheLast>
      <TheDialog ></TheDialog>
      <ToRegister></ToRegister>
     
    </div>
  
  </template>
  
  <script setup>
  // import TheNews from './components/TheNews.vue'
  import FirstPage from './components/FirstPage.vue'
  import LoginDialog from './components/TheDialog/LoginDialog.vue'
  import RegisterDialog from './components/TheDialog/RegisterDialog.vue'
  import DiscussPage from './components/DiscussPage.vue'
  import BussinessPage from './components/BussinessPage.vue'
  import JoinPage from './components/JoinPage.vue'
  import TheLast from './components/TheLast.vue'
  import { ref , onMounted } from 'vue'

  // 简单的移动设备检测
  const isMobile = ref(false);
  onMounted(() => {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    isMobile.value = /Mobi|Android|iPhone/i.test(userAgent);
  });
  </script>
  
  <style scoped>
  .all{
    background-color: #fdfbf6;
  }
  </style>
  
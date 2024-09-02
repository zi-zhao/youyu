<script setup>
import TheHeader from "@/page/components/TheHeader.vue";
import YyButton from "@/page/components/YyButton.vue";
import router from "@/router";

const goToFirst = () =>{
  router.push('/')
}
</script>

<template>
  <!--  container用于整个页面的居中和响应式-->
  <div class="container">
    <TheHeader />
    <!--    page用于控制整体内容-->
    <div class="page">
      <div class="img-bx"><img src="@/assets/error/404.svg" /></div>

      <div class="not-found">404 NOT FOUND</div>

      <div class="main">
        <div class="text-title">很抱歉！没有找到你想要的页面！</div>
        <div class="text-detail">
          The requested URL was not found on this server.
          确保浏览器的地址栏中显示的网站地址的拼写和格式正确无误。<br />
          如果通过单击链接而到达了该网页，请与我们联系，通知我们该链接的格式不正确。<br />
          单机后退按钮尝试另一个链接。<br />
          您可以尝试访问以下链接：<br />
        </div>
      </div>

      <footer class="footer">
        <YyButton theme="primary" class="btn btn1" @click="goToFirst">回到首页</YyButton>
        <YyButton theme="primary" class="btn btn2">咨询客服</YyButton>
      </footer>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.container {
  display: flex;
  margin: 0 auto;
  justify-content: center;
}

.page {
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
  margin-top: 40px;
  gap: 10px;
}

.not-found {
  margin-top: -10px;
  width: 100%;
  text-align: center;
  color: #1c66cb;
  font-size: 40px;
  font-weight: 400;
  border-bottom: 3px solid #a3c9ff;
  padding-bottom: 1.5rem;
}

.main {
  padding-top: 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3rem;
}

.text-title {
  color: #1c66cb;
  font-size: 24px;
  font-weight: 400;
}

.footer {
  padding: 20px 0;
  display: flex;
  gap: 3rem;
}

.btn {
  font-size: 20px;
  font-weight: 700;
  padding: 8px 12px;
  border-radius: 8px;
}

.btn2 {
  background-color: #a3c9ff;
  border: none;
  &:hover {
    background-color: #bdccf6;
  }
}
</style>

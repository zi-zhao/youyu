<template>
  <div class="container">
    <div class="phone">
      <div class="title">原手机号</div>
      <div class="content">
        <div class="phone-num">188****8888</div>
        <div class="input-bx">
          <el-input />
          <YyButton theme="nobgc" class="verify">获取验证码</YyButton>
        </div>
      </div>
    </div>

    <div class="email">
      <div class="title">新手机号</div>
      <div class="content">
        <el-input />
        <div class="input-bx">
          <el-input />
          <YyButton theme="nobgc" class="verify">获取验证码</YyButton>
        </div>
      </div>
    </div>
  </div>

  <div class="footer">
    <YyButton theme="purple">确认</YyButton>
    <YyButton theme="gray">取消</YyButton>
  </div>
</template>

<script setup>
import YyButton from "@/page/components/YyButton.vue";
</script>

<style scoped>
.container{
  display: flex;
  flex-direction: column;
  gap: 3rem;
}

.phone{
  display: flex;
  justify-content: center;
  gap: 5rem;
}

.email{
  display: flex;
  justify-content: center;
  gap: 5rem;
}

.title{
  font-size: 16px;
  color: #7D7979;
}

.content{
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  gap: 2rem;
}

.input-bx{
  display: flex;
  height: 35px;
  gap: 2rem;
}

.footer{
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin: 5rem auto 1rem;
}

.verify{
  width: 155px;
}
</style>

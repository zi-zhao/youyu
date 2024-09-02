<!-- 用于展示客户中心的内容 -->
<template>
<CusDefault v-if="!showWebDesc" @change="handleChange"/>

  <WebDesc v-else/>
</template>

<script setup>
import CusDefault from "@/page/CustomerService/components/CusDefault.vue";
import WebDesc from "@/page/CustomerService/components/WebDesc.vue";

import { ref } from 'vue';

const showWebDesc = ref(false)

const handleChange = (value) => {
  showWebDesc.value = value;
}
</script>

<style scoped>

</style>
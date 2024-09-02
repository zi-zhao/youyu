<template>
  <div class="title_box">
    <div class="title-text">
      <span style="display: inline-block;line-height: 32px;">{{ message }}</span>
    </div>
    <div v-if=showBtn style="display: flex ; align-items: center ; gap: 40px;">
      <span >展示</span>
      <el-switch v-model="isShow" inline-prompt active-text="on" inactive-text="off"/>
    </div>
  </div>
</template>

<script setup>
import {ref, defineProps} from 'vue'

const isShow = ref(true)

defineProps({
  message: String,
  showBtn: Boolean
})

</script>

<style scoped>
.title_box {
  height: 32px;
  display: flex;
  align-items: center;
  gap: 40px;
  width: 93%;
  border-bottom: 1px solid #E3E3E3;
  padding: 1rem 2rem;
  position: relative;
}

.title-text {
  color: #8290C0;
  display: flex;
  align-items: center;
  padding-left: 25px;
}
.title-text::before { 
  content: '';
  position: absolute;
  left: 3%;
  top: 50%;
  transform: translateY(-50%); 
  width: 4px;
  height: 32px; 
  background-color: #8290C0;
}
</style>
<template>
  <div class="container">
    <div class="page">
      <XXXXManagement v-if="showXXXXManagement" @switchToAManagementDetail="switchToAManagementDetail"
        :ClassifyName=popboxInform></XXXXManagement>
      <component v-if="showcomponent" :is="activeComponent" @switchToComponent="switchToComponent" :Name=name :Id=id />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import XXXXManagement from './XXXXManagement.vue';
import AFManagementDetail from './ManuscriptManagement/ManuscriptManagementDetail/AFManagementDetail.vue'
import ACManagementDetail from './ManuscriptManagement/ManuscriptManagementDetail/ACManagementDetail.vue'
import SFManagementDetail from './ManuscriptManagement/ManuscriptManagementDetail/SFManagementDetail.vue'
import SCManagementDetail from './ManuscriptManagement/ManuscriptManagementDetail/SCManagementDetail.vue'

const activeComponent = ref(XXXXManagement);  // 一开始是XXXXManagement组件
const showXXXXManagement = ref(true);
const showcomponent = ref(false);
const popboxInform = ref("");//给子组件传值
const name = ref("");//存放专栏或收藏的名字
const id = ref(null);//存放专栏或收藏的Id

//接受子组件传值，判断该跳转到哪个“管理”页面
const switchToAManagementDetail = (payload) => {
  if (payload.title === '文章专栏') {
    activeComponent.value = ACManagementDetail;
    name.value = payload.name;
    id.value = payload.id;
    showXXXXManagement.value = false;
    showcomponent.value = true;
  } else if (payload.title === '分享专栏') {
    activeComponent.value = SCManagementDetail;
    name.value = payload.name;
    id.value = payload.id;
    showXXXXManagement.value = false;
    showcomponent.value = true;
  } else if (payload.title === '分享收藏') {
    activeComponent.value = SFManagementDetail;
    name.value = payload.name;
    id.value = payload.id;
    showXXXXManagement.value = false;
    showcomponent.value = true;
  } else if (payload.title === '文章收藏') {
    activeComponent.value = AFManagementDetail;
    name.value = payload.name;
    id.value = payload.id;
    showXXXXManagement.value = false;
    showcomponent.value = true;
  }
}

const switchToComponent = (payload) => {
  popboxInform.value = payload.title;
  showXXXXManagement.value = true;
  showcomponent.value = false;
}

</script>

<style scoped>
.container {
  background-color: #F5F5F5;
  display: flex;
  justify-content: center;
  width: 86%;
}

.page {
  background-color: #fff;
  width: 92%;
  padding: 2rem 3rem;
}
</style>
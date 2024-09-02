<template>
    <div class="container">
        <TheHeader />
        <TopNews />
        <div class="main">
            <div class="demo-tabs">
                <div @click="showComponent('NewsReport')" :class="{ 'active': activeTab === 'NewsReport' }" class="item">新闻公告</div>
                <div @click="showComponent('BusinessCooperation')" :class="{ 'active': activeTab === 'BusinessCooperation' }" class="item">商务合作</div>
                <div @click="showComponent('AboutUs')" :class="{ 'active': activeTab === 'AboutUs' }" class="item">关于我们</div>
            </div>

          <component :is="currentComponent" />
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import TheHeader from "@/page/components/TheHeader.vue";
import TopNews from './components/TopNews.vue'
import AboutUs from './components/AboutUs.vue'
import BusinessCooperation from './components/BusinessCooperation.vue'
import NewsReport from './components/NewsReport.vue'

const currentComponent = ref(NewsReport);

const activeTab = ref('NewsReport');

const showComponent = (component) => {
  activeTab.value = component;
  switch(component) {
    case 'NewsReport':
      currentComponent.value = NewsReport;
      break;
    case 'BusinessCooperation':
      currentComponent.value = BusinessCooperation;
      break;
    case 'AboutUs':
      currentComponent.value = AboutUs;
      break;
  }
};

</script>

<style scoped>
.main {
    padding-top: 1rem;
    width: 100%;
    min-height: 583px;
    display: flex;
    flex-direction: column;
    align-items: center;
    background: url("@/assets/NewsCenter/NewsBgi.svg");
    background-position: center;
    background-size: cover;
    background-repeat: no-repeat;

}
.demo-tabs {
  width: 30%;
  display: flex;
  justify-content: center;
}

.item{
  font-size: 20px;
  /* font-weight: 600; */
  padding: 1rem 1rem;
  cursor: pointer;
}
.item.active {
  font-weight: 700;
}
.el-menu--horizontal>.el-menu-item {
    border-bottom: none;
  background-color: rgba(255, 255, 255, 0.5)
}

.el-menu--horizontal>.el-menu-item.is-active {
  border-bottom: none;
  background-color: rgba(255, 255, 255, 0.5)
}
</style>

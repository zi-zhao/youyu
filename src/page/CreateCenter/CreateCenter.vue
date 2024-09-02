<script>
import TheHeader from "@/page/components/TheHeader.vue";
import SideBar from './components/SideBar.vue'
import MainSection from './components/MainSection.vue'
import CommentManagement from './components/CommentManagement.vue'
import WorkManagement from './components/WorkManagement.vue'
import XXXXGeneral from './components/XXXXGeneral.vue'
import ArticleData from './components/TheData/ArticleData.vue'
import IncomeData from './components/TheData/IncomeData.vue'
import FansData from './components/TheData/FansData.vue'
import ShareData from './components/TheData/ShareData.vue'

export default {
  name: 'CreateIndex',
  data() {
    return {
      // 默认显示为MainSection
      currentComponent: MainSection
    }
  },
  components: {
    TheHeader,
    SideBar,
    MainSection,
    CommentManagement,
    XXXXGeneral,
    WorkManagement,
    ArticleData,
    IncomeData,
    FansData,
    ShareData,
  },
  methods: {
    showComponent(component) {
      this.currentComponent = component;
    }
  }
}
</script>

<template>
  <TheHeader></TheHeader>
  <div class="low">

    <!-- 固定侧边栏 -->
    <SideBar class="sideBar" @show-component="showComponent" />

    <!-- 监听自定义事件 -->
    <component :is="currentComponent" class="center" />
  </div>
</template>

<style scoped>
.sideBar {
  width: 180px;
  height: 94vh;
  background: #fff;
  position: fixed;
  top: 40px;
  padding-top: 1rem;
}

.center {
  padding-left: 180px;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0px auto;
}

.low {
  padding-top: 2rem;
  display: flex;
}
</style>


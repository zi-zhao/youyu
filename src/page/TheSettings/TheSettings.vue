<template>
  <TheHeader/>
  <div class="container">
    <SideBar class="sidebar" @show-component="showComponent"/>
    <component :is="currentComponent" class="main"></component>
  </div>
</template>

<script>
import TheHeader from "@/page/components/TheHeader.vue";
import SideBar from "@/page/TheSettings/components/SideBar.vue";
import BasicInfo from "@/page/TheSettings/components/BasicInfo.vue";
import NotiSet from "@/page/TheSettings/components/NotiSet.vue";
import PersExpe from "@/page/TheSettings/components/PersExpe.vue";
// import AccountSec from "@/page/TheSettings/SecuLog/AccountSec.vue";
import LogExit from "@/page/TheSettings/SecuLog/LogExit.vue";
import ExchangeTo from "./Mypurse/ExchangeTo.vue";
import BalanceSection from "./Mypurse/BalanceSection.vue";
// import TopUp from "./Mypurse/TopUp.vue";
import QASetting from './components/QASetting.vue'

export default {
  name:'TheSettings',
  data(){
    return{
      currentComponent:BasicInfo
    }
  },
  components:{
    TheHeader,
    SideBar,
    BasicInfo,
    NotiSet,
    PersExpe,
    LogExit,
    // AccountSec,
    ExchangeTo,
    BalanceSection,
    // TopUp,
    QASetting,
  },
  methods:{
    showComponent(component){
      this.currentComponent = component;
    }
  }
}

</script>

<style scoped>
.bgc_box{
  width: 100%;
  display: flex;
  justify-content: center;
}
.container {
  width: 90%;
  padding-top: 32px;
  display: flex;
  justify-content: space-between;
  margin: 0px auto;
  height: 93vh;
}

.sidebar {
  position: relative;
  width: 18%;
  height: 100%;
}

.main{
  width: 85%;
  height: 100%;
  border: 1px solid rgba(0,0,0,0.1);
  box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.2);
}

@media (max-width:768px){
  .bgc_box{
    width: 1200px;
  }
  .sidebar{
    width: 200px;
    height: auto;
  }
  .container{
    width: 1200px;
    position: initial;
    height: auto;
  }
  .main{
    width: 1000px;
    height: auto;
  }
}
</style>

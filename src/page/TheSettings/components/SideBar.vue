<template>
  <!-- <div class="large_box"> -->
    <el-aside width="100%" class="all">
      <div class="setting">
        <el-icon><Setting /></el-icon>
        <span>个人设置</span>
      </div>

      <el-menu class="sidebar-menu" >
        <el-menu-item
          v-for="item in menuItems"
          :key="item.componentName"
          :class="{ 
            'mid-item': item.isMidItem, 
            'title1': item.isTitle, 
            'active': activeComponent === item.componentName, 
            'disabled': item.disabled 
          }"
          :disabled="item.disabled"
          @click="selectComponent(item.componentName)">
          <el-icon v-if="item.icon"><component :is="item.icon" /></el-icon>
          <span>{{ item.label }}</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
  <!-- </div> -->
</template>

<script>
export default {
  data() {
    return {
      activeComponent: 'BasicInfo',  
      menuItems: [
        { label: '账户设置', disabled: true,isTitle: true, icon: 'User', componentName: 'BasicInfo' },
        { label: '基本信息', isMidItem: true, componentName: 'BasicInfo' },
        { label: '个人经历', isMidItem: true, componentName: 'PersExpe' },
        { label: '通知设置', isMidItem: true, componentName: 'NotiSet' },
        { label: '问答设置', isMidItem: true, componentName: 'QASetting' },
        { label: '安全设置', disabled: true,  componentName: 'SecuLog' ,isTitle: true,icon:'Lock' },
        // { label: '账户安全',isMidItem: true,componentName: 'AccountSec'},
        {label: '退出登录', isMidItem: true,componentName: 'LogExit'},
        { label: '我的钱包',  disabled: true,isTitle: true, icon: 'Coin', componentName: 'BalanceSection' },
        { label: '我的余额', isMidItem: true, componentName: 'BalanceSection' },
        { label: '兑换鱼饵', isMidItem: true, componentName: 'ExchangeTo' },
        // { label: '充值渔币', isMidItem: true, componentName: 'TopUp' }
      ]
    };
  },
  methods: {
    selectComponent(componentName) {
      this.activeComponent = componentName;  // 修改这里的变量名
      this.$emit('show-component', componentName);
    }
  }
}
</script>

<style scoped>
.large_box{
  background-color: #EEEEEE;
}

.all{
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
  background-color: #EEEEEE;
}

.sidebar-menu{
  background-color: #EEEEEE;
  display: flex;
  flex-direction: column;
  gap: 5px;
}
::v-deep .el-menu-item{
  height: 45px;
}
.setting{
  display: flex;
  align-items: center;
  gap: 10px;
  font-size:20px ;
  font-weight: 700;
  padding: 20px 15px 15px 0px;
}

.user{
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  padding-bottom: 10px;
}

.title1{
  display: flex;
  gap: 5px;
  justify-content: center;
  align-items: center;
  background-color: #EEEEEE;
  padding: 0 55px 0 80px;
  font-weight: 600;
  font-size: 18px;
}

.mid-item{
  color: #757575;
  background-color: #EEEEEE;
  display: flex;
  justify-content: center;
  border-radius: 6px;
}

::v-deep .el-menu-item{
  border-radius: 6px;
}

::v-deep .el-menu{
  border: none;
  text-decoration: none;
}

::v-deep .el-menu-item:hover{
  background-color: #9FA9CA !important;
  color: #FFF !important;
}

::v-deep .el-menu-item:hover i {
  color: #757575;
}
::v-deep .el-menu-item.is-disabled{
  opacity: 1;
}
.active {
  background-color: #9FA9CA !important;
  color: #FFF !important;
}
.disabled {
  pointer-events: none;   
  color: #757575 !important; 
  background-color: #EEEEEE !important; 
}
/* 调整滚动条宽度和颜色 */
::-webkit-scrollbar {
    width: 6px; /* 增加纵向滚动条的宽度 */
    height: 8px; /* 增加横向滚动条的高度 */
    background: transparent;
}

/* 定义滚动条轨道，设置为透明 */
::-webkit-scrollbar-track {
    box-shadow: inset 0 0 8px rgba(0, 0, 0, 0); /* 内阴影 */
    background: transparent; /* 将轨道背景设置为透明 */
}

/* 定义滑块，设置为浅灰色并增加内阴影 */
::-webkit-scrollbar-thumb {
    box-shadow: inset 0 0 8px rgba(115, 115, 115, 0.3); /* 添加淡灰色内阴影 */
    background-color: #dbdbdb; /* 滑块的颜色改为浅灰色 */
    border-radius: 10px; /* 保持圆角不变 */
}
/* 当鼠标悬停在滚动条滑块上时改变滑块的颜色 */
::-webkit-scrollbar-thumb:hover {
    background: #c6c6c6;
}
</style>

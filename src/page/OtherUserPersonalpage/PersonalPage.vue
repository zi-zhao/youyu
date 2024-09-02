<template>
  <div class="all">
    <TheHeader></TheHeader>
    <UserInformatin></UserInformatin>
    <router-view />

    
  </div>
</template>

<script>
import TheHeader from '../components/TheHeader.vue'
import UserInformatin from '../OtherUserPersonalpage/componentes/UserInformatin.vue'

export default {
  name: 'App',
  components: {
    TheHeader,
    UserInformatin,
  }
}
</script>

<style scoped>
.all{
  background-color: #fffffc;
}
@media (max-width:768px){
  .all{
    width: 1200px;
  }
}
</style>

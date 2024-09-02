<template>
    <div class="all">
      <PageMenu></PageMenu>
      <TaAction></TaAction>

  
      
    </div>
  </template>
  
  <script>
  
  import PageMenu from '../Personalpage/componentes/PageMenu.vue'
  import TaAction from '../Personalpage/componentes/TaAction.vue'
  
  
  export default {
    name: 'App',
    components: {
      PageMenu,
      TaAction
    }
  }
  </script>
  
  <style scpoed>
  .all{
    background-color: #fffffc;
  }
  @media (max-width:768px){
    .all{
      width: 1200px;
    }
  }
  </style>
  
<template>
    <div class="all">
      
      <TheHeader></TheHeader>
      <MainShare></MainShare>
      
    </div>
  </template>
  
  <script>
  import TheHeader from '../components/TheHeader.vue'
  import MainShare from './components/MainShare.vue'
  
  export default {
    name: 'App',
    components: {
      TheHeader,
      MainShare
    }
  }
  </script>
  
  <style>
  
  </style>
  
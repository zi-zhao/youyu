<template>
    <TheHeader></TheHeader>
    <TheMiddle></TheMiddle>
  </template>
  
  <script>
  import TheHeader from '../components/TheHeader.vue'
  import TheMiddle from './components/TheMiddle.vue'
  
  export default {
    name: 'TheMain',
    components: {
    TheHeader,
    TheMiddle
},
  }
  </script>
  
  <style>
  *{
    margin: 0;
  }
  </style>
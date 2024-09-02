<template>
    <TheHeader></TheHeader>
    <div class="bgc_box">
        <div class="large_box">
            <div class="top">
                <div class="QASquare" @click="switchNumber = 0" :class="{ active: switchNumber === 0 }">
                    <img v-if="switchNumber === 0" src="@/assets/QACenter/QASquare_W.svg" alt="">
                    <img v-if="switchNumber === 1" src="@/assets/QACenter/QASquare_B.svg" alt="">
                    <span  class="title"  :class="{ active: switchNumber === 0 }">推荐答主</span>
                </div>
                <div class="myquestion" @click="switchNumber = 1" :class="{ active: switchNumber === 1 }">
                    <span  class="title"  :class="{ active: switchNumber === 1 }">我的问题</span>
                </div>
            </div>
            <div class="then" v-if="switchNumber === 0">
                <QASquare></QASquare>
            </div>
            <div class="then" v-if="switchNumber === 1">
                <QuestionTitle></QuestionTitle>
            </div>
        </div>
    </div>
</template>

<script setup>
import QASquare from './QASquare'
import TheHeader from '../../components/TheHeader.vue'
import QuestionTitle from './QuestionTitle'
import {ref} from 'vue'

const switchNumber = ref(0);

</script>

<style scoped>
.bgc_box{
  background-color: #F8F8F8;
  width: 100%;
  height: 100%;
}
.large_box{
  width: 100%;
  margin: 0px auto;
}
.top{
  width: 100%;
  margin-top: 2.5rem;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #F8F8F8;
  border-bottom: 2px solid #9FA9CA;
}
.QASquare,
.myquestion{
  width: 115px;
  height: 2rem;
  padding: 0.3rem 1rem;
  border-radius: 4px 4px 0px 0px;
  display: flex;
  gap: 5px;
  justify-content: center;
  align-items: center;
  cursor: pointer;
}
.title{
  color: #000;
  font-size: 20px;
  font-weight: 700;
  text-decoration: none;
}
.active{
  background-color: #9FA9CA;
  color: #FFF;
}
.then{
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0px auto;
  border-radius: 16px;
  background: #FFF;
}

@media screen and (max-width: 768px) {
  .large_box{
    width: 100%;
    margin: 0px auto;
  }
  .top{
    width: 100%;
  }
  .QASquare,
  .myquestion{
    width: auto;
    padding: 0.2rem 0.6rem;
  }
  .QASquare img,
  .myquestion img{
    width: 1.2rem;
  }
  .then{
    width: 100%;
  }
  .title{
    font-size: 16px;
  }
}
</style>
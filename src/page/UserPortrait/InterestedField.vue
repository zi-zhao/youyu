<template>
    <div class="main-box">
        <div class="one">
            <div class="pic-container">
                <img src="../../assets/UserPortrait/Applaud.svg" alt="">
            </div>
            <div>
                <span class="text1">欢迎来到有渔！</span>
                <span class="text2">完善信息后，将为您提供个性的使用说明</span>
            </div>
        </div>
        <div class="middle">
            <span class="text3">选择你感兴趣的领域:</span>
            <span class="text4">可多选</span>
        </div>
        <div class="check-box">
            <el-checkbox-group v-model="checkList">
                <el-checkbox label="Option A" border/>
                <el-checkbox label="论文" border/>
                <el-checkbox label="Option C" border/>
                <el-checkbox label="Option D" border/>
                <el-checkbox label="Option E" border />
                <el-checkbox label="Option F" border/>
                <el-checkbox label="Option G" border/>
                <el-checkbox label="Option H" border />
            </el-checkbox-group>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'

const checkList = ref(['Option A'])
</script>

<style scoped>
.main-box{
    width: 690px;
    height: 190px;
    margin: 25px auto 0px;
    display: flex;
    flex-direction: column;
    gap: 15px;
}
.one{
    display: flex;
    align-items: center;
    gap: 10px;
}
.pic-container{
    width: 52px;
    height: 52px;
    border-radius: 50%;
    background-color: #fff;
}
.pic-container img{
    width: 52px;
    height: 52px;
}
.text1{
    text-align: center;
    font-size: 16px;
    font-weight: 700;
    line-height: 1.6;
}
.text2{
    color: #6A6A6A;
    font-size: 14px;
    line-height: 1.6; 
}
.middle{
    display: flex;
    align-items: center;
    gap: 10px;
}
.text3{
    font-size: 14px;
    font-weight: 700;
}
.text4{
    color: #706969;
    font-size: 12px;
}
.check-box{
    width: 570px;
    margin: 5px auto 0px;
}
::v-deep .el-checkbox-group{
    display: flex;
    flex-wrap: wrap;
    gap: 18px 30px;
}
::v-deep .el-checkbox{
    margin: 0px;
    width: 120px;
}
::v-deep .el-checkbox.is-bordered.is-checked{
    border-color: #9FA9CA;
}
::v-deep .el-checkbox.is-bordered{
    border-radius: 8px;
}

::v-deep .el-checkbox__input.is-checked+.el-checkbox__label{
    color: #000;
}
::v-deep .custom-checked-icon {
  background-image: url('../../assets/CheckMark.svg');
  background-size: cover;
  display: inline-block;
  width: 16px;  
  height: 16px; 
}

::v-deep .custom-unchecked-icon {
    border-radius: 50%;
    background-size: cover;
    display: inline-block;
    width: 16px;  
    height: 16px; 
}
::v-deep .el-checkbox__inner{
    border-radius: 50%;
}
::v-deep .el-checkbox__inner::after{
    content:'';
    background-image: url('../../assets/CheckMark.svg');
    background-size: cover;
    border: none;
    background-repeat: no-repeat;
    height: 14px;
    width: 14px;
    left: -1px;
    top: -1px;
}
::v-deep .el-checkbox__input.is-checked .el-checkbox__inner{
    background-color: #fff;
    border-color: #dcdfe6;
}
::v-deep .el-checkbox__input.is-checked .el-checkbox__inner::after{
    transform: rotate(0deg) scaleY(1);
}
::v-deep .el-checkbox__inner:hover {
    border-color: #dcdfe6;
}
</style>
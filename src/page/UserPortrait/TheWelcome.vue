<template>
    <div class="big">
        <div class="welcome">
            <div class="pic-box">
                <img src="@/assets/UserPortrait/Applaud.svg" alt="">
            </div>
            <span>欢迎来到有渔!</span>
        </div>
    </div>
</template>

<script setup>

</script>

<style scoped>
.big{
    width: 100%; 
    display: flex; 
    flex-direction: column;
    align-items: center; 
    margin-top: 100px;
    gap: 65px;
}
.welcome{
    display: flex;
    align-items: center; 
    gap: 20px;
}
.pic-box{
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background-color: #fff;
}
img{
    width: 80px;
    height: 80px;
}
span{
    color: #000;
    text-align: center;
    font-size: 24px;
    font-weight: 700;
    line-height: 1.6; 
}

</style>
<template>
    <div>
        <div class="first">
            <div class="one">
                <img src="@/assets/MessageCenter/one.svg" alt="">
                <span>系统通知</span>
            </div>
            <div>
                <el-checkbox v-model="checked1" label="网站通知" size="large" @change="change"/>
                <el-checkbox v-model="checked2" label="审核通知" size="large" @change="change"/>
                <el-checkbox v-model="checked3" label="举报通知" size="large" @change="change"/>
            </div>
        </div>
        <div class="then" v-infinite-scroll="load" infinite-scroll-distance="100" infinite-scroll-immediate="false">
            <div v-for="(source,index) in systemNotification" :key="index" class="box">
                <div style="    display: flex;justify-content: space-between;margin-bottom: 20px;">
                    <span class="title">{{ source.title }}</span>
                    <span class="time">{{ source.createTime }}</span>
                </div>
                <div>
                    <p class="content">{{ source.content }}</p>
                </div>
            </div>
            <el-empty 
                v-if="systemNotification.length === 0  || !systemNotification" 
                :image-size="200" 
                description="您暂时还没有收到系统消息呢！"
            />
        </div>
    </div>
</template>

<script setup>
    import { onMounted,ref,computed,watch } from 'vue';
    import axios from '@/utils/request'
    import { convertDateFormat } from '@/utils/timeFormat';
    import { ElMessage } from 'element-plus';

    const currentPage = ref(1);
    const systemNotification = ref([]);
    const checked1 = ref(true)
    const checked2 = ref(true)
    const checked3 = ref(true)
    const types = computed(() => {
        let tempTypes = [];
        if (checked1.value) tempTypes.push(0);
        if (checked2.value) tempTypes.push(1);
        if (checked3.value) tempTypes.push(2);
        return tempTypes;
    });
    const typeString = computed(() => {
        return types.value.join(',');
    });

    // 这里的代码会在`type`变化时重新运行
    watch(types, () => {
        currentPage.value = 1; // 重置页码
        systemNotification.value.splice(0, systemNotification.value.length);
        getSystemNote(currentPage.value)
    })

    // 添加一个锁状态
    let isLoading = false;
    async function load() {
        if (isLoading) return; // 如果已经在加载中，则直接返回不执行新的加载
        isLoading = true; // 开始加载数据，设置锁状态为true
        try {
            if(currentPage.value === 1){
                currentPage.value++;
            }
            await getSystemNote(currentPage.value);
            currentPage.value++; // 只有在请求成功完成后才递增页码
        } catch (error) {
            console.error(error);
            ElMessage.error('滚动时的未知错误');
        } finally {
            isLoading = false; // 请求完成，无论成功或失败，都释放锁状态
        }
    }

    async function getSystemNote(currentPage) {
        try {
            const response = await axios.get('/notice/system', {
                params: {
                    type: typeString.value,
                    page:currentPage,
                    pageSize:10,
                }
            });
            if (response.data.code === 1 && response.data.data.records.length > 0) {
                const updates = response.data.data.records.map(async (record) => {
                    const createTime = convertDateFormat(record.createTime);
                    return { ...record, createTime };
                });
                const updatedRecords = await Promise.all(updates);
                systemNotification.value = [...systemNotification.value, ...updatedRecords];
                console.log(response.data.data);
            }else if (response.data.code === 1 && response.data.data.records.length === 0) {
                // ElMessage.info('已加载所有数据');
            }else if(response.data.code === 0 && response.data.msg){
                ElMessage.error(response.data.msg.toString());
            }else(error)=>{
                console.log(error);
            }
        } catch (error) {
            console.log(error);
        }
    }

    onMounted(()=>{
        getSystemNote(currentPage.value);
    })

</script>

<style scoped>
.first{
    width: 77vw;
    padding: 12px 12px 0px; 
    justify-content: center; 
    gap: 12px;
    border-radius: 8px;
    border: 2px solid #F0F0F0;
    background: #FFF;
    margin-top: 50px;
}
.one{
    display: flex;
    margin-bottom: 5px;
    align-items: center;
}
.one img{
    width: 20px;
    height: 20px;
}
.one span{
    color: #6B757B;
    text-align: center;
    font-weight: 700;
    line-height: 1.6; 
    margin-left: 8px;
}
.then{
    width: 77vw;
    height: 72vh;
    overflow-y: scroll;
    padding: 12px 12px 0px;
    border-radius: 8px;
    border: 2px solid #F0F0F0;
    margin-top: 12px;
}
.box{
    width: 900px;
    border-bottom: 1px solid #e7e7e7;
    margin-bottom: 10px;
    width: 95%;
    min-height: 60px;
    margin: 0 auto;
    padding-left: 5px;
    padding: 20px 5px;
}
.title{
    color: #000;
    text-align: center;
    font-family: Microsoft YaHei;
    font-size: 14px;
    font-style: normal;
    font-weight: 700;
    line-height: 120%; 
}
.time{
    color: #A1A1A1;
    font-size: 12px;
    font-style: normal;
    font-weight: 400;
    line-height: 120%; 
    margin-left: 15px;
}
.content{
    color: #505050;
    font-family: Microsoft YaHei;
    font-size: 14px;
    font-style: normal;
    font-weight: 400;
    line-height: 120%; /* 16.8px */
}
::v-deep .el-checkbox.el-checkbox--large{
    width: 80px;
}
@media (max-width: 768px) {
    .first,
    .then{
        width: 800px;
    }
}
</style>
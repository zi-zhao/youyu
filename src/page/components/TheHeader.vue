<template>
    <div class="large">
        <div class="logo" @click="goToFirstpage">
            <img src="@/assets/fish.png"  alt="" >
            <span class="hover-text">返回首页</span>
        </div>
        <div class="little">
            <!-- 用户头像 -->
            <div class="navbar-avatar-container">
                <img 
                    v-if="user.newAvatar"
                    :src="user.newAvatar"
                    alt=""
                    class="navbar-avatar"
                    @click="navigateToUserProfile1"
                >
                <div class="hover-box">
                    <div style="display: flex;justify-content: space-around;">
                        <div class="data-item">
                            <span class="num">{{ user.subscribeCount }}</span>
                            <span class="text1">关注</span>
                        </div>
                        <div class="data-item">
                            <span class="num">{{ user.fanCount }}</span>
                            <span class="text1">粉丝</span>
                        </div>
                        <div class="data-item">
                            <span class="num">{{ user.manuscript }}</span>
                            <span class="text1">发帖</span>
                        </div>
                    </div>
                    <div class="line"></div>
                    <div style="display: flex;flex-direction: column;align-items: center;gap: 12px;">
                        <div @click="navigateToUserProfile2" class="fun-item phone">
                            <span>个人主页</span>
                        </div>
                        <div @click="goToMessageCenter" class="fun-item">
                            <span>消息中心</span>
                            <img src="@/assets/MessageCenter/message.svg" alt="">
                        </div>
                        <div @click="goToTheSetting" class="fun-item">
                            <span>个人设置</span>
                            <el-icon><Setting /></el-icon>
                        </div>
                        <div @click="goToHistoryRecord" class="fun-item">
                            <span>历史记录</span>
                            <img src="@/assets/HistoryRecord/RecordCircle.svg" alt="">
                        </div>
                        <div @click="goToCustomerService" class="fun-item">
                            <span>网站反馈</span>
                            <img src="@/assets/CustomerServices/网站说明.svg" alt="">
                        </div>
                    </div>
                </div>
            </div>
            <!-- 对a标签遍历添加点击后样式 -->
            <div class="list">
                <a
                    href="#"
                    class="navbar-link"
                    :class="{'navbar-link-active': activeLink === index, 'message-center': link === '消息中心'}"
                    @click.prevent="navigateTo(link, index)"
                    v-for="(link, index) in ['主页', '问答中心','视频课程','创作中心','分享展示']"
                    :key="index"
                >
                    {{ link }}
                    <!-- 判断当前是否是消息中心 -->
                    <!-- 判断消息条数是否大于99，若不是，则只用unread类名即可，若大于，则需再加一个unread-99类名 -->
                    <div v-if="link === '消息中心' && numData > 99 " class="unread ">
                        {{ numData }}
                    </div>
                    <div v-if="link === '消息中心'  && numData <= 99 && numData != 0" class="unread-99">
                        {{ numData }}
                    </div>
                </a>
            </div>
        </div>
    </div>

</template>

<script>
import { useRouter } from 'vue-router'
import {ref,onMounted} from 'vue'
import { getUsersAvatarFromCOS } from '@/utils/cosService';
import axios from '@/utils/request';
import { ElMessage } from 'element-plus';
import { openUrl } from '@/utils/routeJudge'

export default {
    setup() {
        const user = ref({});
        const activeLink = ref(null);// 用于记录当前激活标签的响应式引用
        const router = useRouter();
        const data = ref({});
        const numData = ref(0);
        const userId = localStorage.getItem("userId"); // 获取用户ID

        const navigateTo = (linkName) => {
            if (linkName === '主页') {
                router.push('/TheMain');
            }
            if (linkName === '分享展示') {
                // const routeLocation = router.resolve({ path: '/ShareShow' });
                // window.open(routeLocation.href, '_blank');
                router.push('/ShareShow');
            }
            if (linkName === '问答中心') {
                // const routeLocation = router.resolve({ path: '/DefaultPresentation' });
                // window.open(routeLocation.href, '_blank');
                router.push('/DefaultPresentation');
            }
            if (linkName === '视频课程') {
                // const routeLocation = router.resolve({ path: '/VideoMain' });
                // window.open(routeLocation.href, '_blank');
                router.push('/VideoMain');
            }
            if (linkName === '创作中心') {
                // const routeLocation = router.resolve({ path: '/CreateCenter' });
                // window.open(routeLocation.href, '_blank');
                router.push('/CreateCenter');
            }
        };

        const goToFirstpage = () => {
            router.push('/');
        };
        const goToMessageCenter = () => {
            // const routeLocation = router.resolve({ path: '/MessageCenter' });
            // window.open(routeLocation.href, '_blank');
            openUrl('/MessageCenter');
        };
        const goToTheSetting = () => {
            // const routeLocation = router.resolve({ path: '/TheSettings' });
            // window.open(routeLocation.href, '_blank');
            openUrl('/TheSettings');
        };
        const goToHistoryRecord = () => {
            // const routeLocation = router.resolve({ path: '/HistoryRecord' });
            // window.open(routeLocation.href, '_blank');
            openUrl('/HistoryRecord');
        };
        const goToCustomerService = () => {
            // const routeLocation = router.resolve({ path: '/CustomerService' });
            // window.open(routeLocation.href, '_blank');
            openUrl('/CustomerService');
        };


        // 获取用户信息
        const fetchAvatar = async () => {
            try {
                const response = await axios.get(`/users/${userId}`);
                if(response.data.code === 1){
                    user.value = response.data.data;
                    user.value.newAvatar = await getUsersAvatarFromCOS(userId);
                    user.value.manuscript =  Number(user.value.articleCount) +  Number(user.value.shareCount);
                }else if(response.data.code === 0 && response.data.msg){
                    ElMessage.error(response.data.msg.toString());
                }else{
                    ElMessage.error('获取用户信息失败');
                }
            } catch (error) {
                console.error("获取用户信息失败", error);
                ElMessage.error('获取用户信息失败');
            }
        };

        function isMobileDevice() {
            return /Mobi|Android|iPhone/i.test(navigator.userAgent);
        }

        //点击头像是否可以跳转要根据使用设备进行判断
        const navigateToUserProfile1 = () => {
            if (isMobileDevice()) {
                return;
            }
            openUrl('/PersonalPage');
        };
        // 隐藏起来的盒子只有在手机端才会有“个人主页”
        const navigateToUserProfile2 = () => {
            router.push('/PersonalPage')
        };

        const setActiveLink = (index) => {
            activeLink.value = index;
        };

        //获取各个类别消息数目
        async function getNotice() {
            try {
                const response = await axios.get('/notice');
                if(response.data.code === 1){
                    data.value = response.data.data;
                    numData.value = Number(data.value[0]+data.value[1]+data.value[2]+data.value[3]+data.value[4]+data.value[5]+data.value[6]);
                    console.log(numData.value);
                }else if(response.data.code === 0 && response.data.msg){
                    ElMessage.error(response.data.msg.toString());
                }else{
                    console.error("获取各个类别消息数目失败");
                }
            } catch (error) {
                console.error("获取各个类别消息数目失败", error); 
            }
        }
        // 在创建组件后立即获取用户头像
        
        onMounted(() => {
            fetchAvatar();
            getNotice();
            isMobileDevice()
        })

        return {
            user,
            activeLink,
            data,
            numData,
            navigateTo,
            goToFirstpage,
            getUsersAvatarFromCOS,
            navigateToUserProfile1,
            navigateToUserProfile2,
            setActiveLink,
            getNotice,
            goToMessageCenter,
            goToTheSetting,
            goToHistoryRecord,
            goToCustomerService
        };
    }
}
</script>

<style scoped>
.large{
    width: 100%;
    height: 2.5rem;
    background-color: rgb(207 215 226);
    display: flex;
    justify-content: space-between;
    align-items: center;
    /* 固定导航栏 */
    position: fixed;
    top: 0;
    left: 0;
    z-index: 9999;
}
.logo{
    cursor: pointer;
    position: relative;
}
.hover-text {
    visibility: hidden;
    position: absolute;
    bottom: -28px;
    left: 75%;
    transform: translateX(-50%);
    background-color: #f9f9f9;
    color: black;
    font-size: 14px;
    text-align: center;
    padding: 3px 5px;
    border-radius: 5px;
    white-space: nowrap;
}

.logo:hover .hover-text {
    visibility: visible; /* 当鼠标悬停在 .logo 上时显示文本 */
}
/* logo图片样式 */
.logo img{
    display: flex;
    width: 32px;
    height: 32px;
    justify-content: center;
    align-items: center;
    flex-shrink: 0;
    margin-left: 12px;
}
.little{
    height: 40px;
    display: flex;  
    align-items: center;  
    justify-content: center;
    margin-right: 10px;
}
.list {
    border-radius: 20px;
    background-color: #f1f3ff;
}
.navbar-avatar-container{
    position: relative;
    height: 35px;
}
.navbar-avatar-container:hover .hover-box {
    visibility: visible;
}
/* 用户头像 */
.navbar-avatar {
    display: inline-block; 
    width: 35px;
    height: 35px;
    border-radius: 50%;
    cursor: pointer;
    margin-right: 10px; 
}
.hover-box{
    visibility: hidden;
    width: 160px;
    height: 200px;
    border: 1px solid #e7e7e7;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    left: -77px;
    top: 35px;
    position: absolute;
    border-radius: 10px;
    background: #fff;
    box-shadow: 1px 1px 12px 1px rgb(108 108 108 / 16%);
    padding: 20px;
}
.data-item{
    display: flex;
    flex-direction: column;
}
.num{
    font-weight: 700;
    text-align: center;
}
.text1{
    font-size: 14px;
    color: #9F9F9F;
    line-height: 1.6;
}
.line{
    width: 100%;
    height: 1px;
    background-color: #7D7D7D;;
}
.fun-item{
    display: flex;
    gap: 15px;
    align-items: center;
    cursor: pointer;
}
.fun-item img{
    width: 18px;
    height: 18px;
}
/* a标签样式 */
.navbar-link {
  display: inline-block;
  text-decoration: none;
  color: #706969;
  padding: 5px 25px 5px 25px;
  transition: background-color 0.3s ease;
  position: relative;
}

.navbar-link-active {
  background-color: rgba(114, 139, 171, 0.34);
  color: black;
  border-radius: 20px;
}
/* 添加伪类实现鼠标悬停效果 */
/* .navbar-link::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  background-color: black;
  transform: scaleY(0);
  transition: transform 0.3s ease;
} */

.navbar-link:hover {
  transform: translateY(-5px);
}

.navbar-link:hover::after {
  transform: scaleY(1);
}
.message-center{
    position: relative;
}
.unread,
.unread-99{
    position: absolute;
    top: 0px;
    height: 16px;
    font-size: 9px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #ff5757;
    color: #fff;
    font-weight: 700;
}
.unread{
    width: 16px;
    border-radius: 50%;
    right: -4px;
}
.unread-99{
    width: 26px;
    border-radius: 50%;
    right: -10px;
}
.phone{
    display: none;
}

@media screen and (max-width: 768px) {
    .logo img {
        width: 28px;
        height: 28px;
    }
    .navbar-link {
        padding: 5px 8px;
        font-size: 14px;
    }

    .navbar-avatar {
        width: 30px;
        height: 30px;
    }

    .hover-box {
        width: 140px;
        height: auto;
        flex-direction: column;
    }
    .phone{
        display: block;
        margin-top: 10px;
    }
    .fun-item img,
    .fun-item .el-icon{
        display: none;
    }
    .list a:last-child,
    .list a:nth-last-child(2){
        display: none;
    }
}
</style>
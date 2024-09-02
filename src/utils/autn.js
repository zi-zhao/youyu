// 判断登录权限
const token = localStorage.getItem('token')
// 若没有登录权限，则跳转至首页
if(!token){
    location.href='../APP.vue'
}
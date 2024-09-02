import axios from "axios";
// import { ElMessage } from "element-plus";
// axios公共配置
// 创建一个 axios 实例
const instance = axios.create({
  //  baseURL: "https://mock.apifox.cn/m1/3107728-0-default", // 设置基本的请求URL
     baseURL: "http://154.8.172.164:8081", // 设置基本的请求URL
  // baseURL: "http://localhost:8081", // 设置基本的请求URL
  //baseURL: "http://127.0.0.1:4523/m1/3107728-0-default"
  timeout: 10000, // 设置请求超时时间
});

  // 请求拦截器
  instance.interceptors.request.use(config => {
    // 获取token数据
    const token = localStorage.getItem('token');
    // 拼接token数据
    if(token){
      config.headers.Authorization = ` ${token} `;
    }
    return config
  },e => Promise.reject(e))

  
  //响应拦截器
  instance.interceptors.response.use(
    (res) => {return res},
    (e) => {
      // 统一错误提示
      // ElMessage({
      //   type: "warning",
      //   message: e.response.data.message,
      // });
      return Promise.reject(e);
    }
  );

  export default instance;
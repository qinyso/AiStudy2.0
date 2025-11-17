import axios from 'axios'
const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_APP_API_BASE_URL || '',
    timeout:5000,
})
// 请求拦截器：添加认证 Token 到请求头
axiosInstance.interceptors.request.use(
    (config)=>{
        const token=localStorage.getItem('token');
         // 2. 如果 Token 存在，添加到请求头的 Authorization 字段中
        if(token){
            config.headers.Authorization =`Bearer ${token}`;
        }
        return config;
    },
    (error)=>Promise.reject(error)
)
// 响应拦截器：统一处理错误（如 Token 过期）
axiosInstance.interceptors.response.use(
    (response) =>response,
    (error) =>{
        if(error.response.status===401){
            localStorage.removeItem('token');
            localStorage.removeItem('userInfo');
            window.location.href='/Enter';
        }
        return Promise.reject(error)
    }
);
export default axiosInstance;
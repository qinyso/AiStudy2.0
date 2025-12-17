import axios from 'axios'
const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_APP_API_BASE_URL || '',
    timeout:100000,
})
// 请求拦截器：添加认证 Token 到请求头
axiosInstance.interceptors.request.use(
    (config)=>{
        // 添加请求调试日志
        console.log('🚀 [Axios] 请求开始');
        console.log('📋 [Axios] 请求信息:', {
            method: config.method?.toUpperCase(),
            url: config.url,
            baseURL: config.baseURL,
            fullURL: config.baseURL + config.url
        });
        
        const token=localStorage.getItem('token');
        console.log('🔑 [Axios] Token:', token ? '***' + token.slice(-8) : '无');
        
        // 如果 Token 存在且不是特定的不需要鉴权的接口，添加到请求头的 Authorization 字段中
        const skipAuthUrls = ['https://ferny-darlene-unled.ngrok-free.dev/inferenceimage'];
        if(token && !skipAuthUrls.some(url => config.url === url)){
            config.headers.Authorization =`Bearer ${token}`;
        }
        
        // 添加ngrok跳过浏览器警告的请求头，避免请求被拦截
        config.headers['ngrok-skip-browser-warning'] = 'true';
        
        console.log('📝 [Axios] 请求头:', config.headers);
        
        // 打印请求参数（GET请求在params，POST请求在data）
        if (config.method?.toLowerCase() === 'get' && config.params) {
            console.log('📊 [Axios] GET请求参数:', config.params);
        } else if ((config.method?.toLowerCase() === 'post' || config.method?.toLowerCase() === 'put' || config.method?.toLowerCase() === 'patch') && config.data) {
            // 处理FormData类型
            if (config.data instanceof FormData) {
                console.log('📁 [Axios] FormData请求数据:', Array.from(config.data.entries()).reduce((obj, [key, value]) => {
                    obj[key] = value instanceof File ? `${value.name} (${value.size} bytes)` : value;
                    return obj;
                }, {}));
            } else {
                console.log('📊 [Axios] 请求数据:', config.data);
            }
        }
        
        console.log('----------------------------------------');
        
        return config;
    },
    (error)=>{
        console.log('❌ [Axios] 请求配置错误:', error);
        return Promise.reject(error);
    }
)
// 响应拦截器：统一处理错误（如 Token 过期）
axiosInstance.interceptors.response.use(
    (response) => {
        console.log('----------------------------------------');
        console.log('✅ [Axios] 响应成功');
        console.log('📋 [Axios] 响应信息:', {
            status: response.status,
            statusText: response.statusText,
            url: response.config.url
        });
        console.log('📝 [Axios] 响应头:', response.headers);
        // 如果响应类型是blob，不打印数据以避免错误
        if (response.config.responseType !== 'blob') {
            console.log('📦 [Axios] 响应数据:', response.data);
        } else {
            console.log('📦 [Axios] 响应数据: Blob数据');
        }
        console.log('----------------------------------------');
        return response;
    },
    (error) => {
        console.log('----------------------------------------');
        console.log('❌ [Axios] 响应错误');
        
        if (error.response) {
            // 服务器返回了错误状态码
            console.log('📋 [Axios] 错误信息:', {
                status: error.response.status,
                statusText: error.response.statusText,
                url: error.config.url
            });
            console.log('📝 [Axios] 响应头:', error.response.headers);
            console.log('📦 [Axios] 错误响应数据:', error.response.data);
        } else if (error.request) {
            // 请求已发送但没有收到响应
            console.log('📡 [Axios] 请求发送成功，但未收到响应:', error.request);
        } else {
            // 请求配置错误
            console.log('⚙️ [Axios] 请求配置错误:', error.message);
        }
        
        console.log('📋 [Axios] 错误配置:', error.config);
        
        // 先检查error.response是否存在
        if(error.response && error.response.status===401){
            console.log('🔒 [Axios] Token过期或无效，清除本地存储并跳转到登录页');
            localStorage.removeItem('token');
            localStorage.removeItem('userInfo');
            window.location.href='/Enter';
        }
        
        console.log('----------------------------------------');
        return Promise.reject(error);
    }
);
export default axiosInstance;
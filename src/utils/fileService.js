import axiosInstance from './axiosInstance';

/**
 * 文件服务类，封装文件上传、获取文件列表、分析任务等操作
 */
export class FileService {
  /**
   * 获取用户文件列表
   * @returns {Promise<Object>} 文件列表数据
   */
  static async getUserFiles() {

    try {
      console.log('📡 [FileService] 开始请求: getUserFiles');
      
      // 1. 先检查Token是否存在（接口文档要求鉴权）
      const token = localStorage.getItem('token');
      console.log('🔑 [FileService] Token存在:', !!token);
      
      if (!token) {
        console.log('❌ [FileService] Token不存在，返回鉴权错误');
        return {
          success: false,
          message: '请先登录',
          isAuthError: true
        };
      }

      console.log('🔄 [FileService] 发送GET请求到: /api/files');
      const response = await axiosInstance.get('/api/files');
      console.log('✅ [FileService] 请求成功，状态码:', response.status);
      console.log('📦 [FileService] 完整响应数据:', response.data);
      const res = response.data;

      // 2. 检查业务成功状态码
      console.log('🔍 [FileService] 业务状态码:', res.code);
      
      if (res.code !== 200) {
        console.log('⚠️ [FileService] 业务请求失败:', res.msg || '获取文件列表失败');
        return {
          success: false,
          message: res.msg || '获取文件列表失败'
        };
      }

      // 3. 按接口文档约定提取数据
      const result = {
        success: true,
        data: {
          files: res.data?.files || [],
          total_files: res.data?.total_files || 0
        }
      };
      
      console.log('📤 [FileService] 返回处理后的数据:', result);
      return result;
    } catch (error) {
      console.log('❌ [FileService] 请求发生异常:', error);
      console.error('详细错误信息:', error);
      
      // 详细记录错误响应信息
      console.error('🔍 [FileService] 错误响应详情:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        headers: error.response?.headers
      });
      
      // 处理FastAPI默认错误格式
      if (error.response) {
        // 检查是否为鉴权相关错误
        const isAuthError = error.response.status === 401 || 
                          (error.response.data?.detail && (error.response.data.detail.includes('登录') || 
                          error.response.data.detail.includes('token')));
        
        if (isAuthError) {
          // 清除无效token
          localStorage.removeItem('token');
          localStorage.removeItem('userInfo');
          return {
            success: false,
            message: error.response.data?.detail || '登录已过期，请重新登录',
            isAuthError: true
          };
        }
        
        // 处理500服务器错误
        if (error.response.status === 500) {
          let errorMessage = '服务器内部错误，请稍后重试';
          
          // 尝试从响应中提取更详细的错误信息
          if (error.response.data?.detail) {
            errorMessage = error.response.data.detail;
          } else if (error.response.data?.msg) {
            errorMessage = error.response.data.msg;
          } else if (typeof error.response.data === 'string') {
            errorMessage = error.response.data;
          }
          
          return {
            success: false,
            message: `服务器错误: ${errorMessage}`,
            isServerError: true
          };
        }
        
        // 处理其他状态码错误
        const errorMessage = error.response.data?.detail || 
                          error.response.data?.msg || 
                          error.response.statusText || 
                          '请求失败';
        
        return {
          success: false,
          message: errorMessage
        };
      }

      // 处理网络错误或其他异常
      return {
        success: false,
        message: error.message || '网络异常，请检查网络连接后重试'
      };
    }
  }

  /**
   * 上传文件
   * @param {File} file - 要上传的文件对象
   * @returns {Promise<Object>} 上传结果
   */
  static async uploadFile(file) {
    try {
      console.log('📡 [FileService] 开始请求: uploadFile');
      console.log('📁 [FileService] 上传文件信息:', { name: file.name, size: file.size, type: file.type });
      
      // 1. 先检查Token是否存在（接口文档要求鉴权）
      const token = localStorage.getItem('token');
      console.log('🔑 [FileService] Token存在:', !!token);
      
      if (!token) {
        console.log('❌ [FileService] Token不存在，返回鉴权错误');
        return {
          success: false,
          message: '请先登录',
          isAuthError: true
        };
      }

      const formData = new FormData();
      formData.append('file', file);
      
      console.log('🔄 [FileService] 发送POST请求到: /api/upload');
  
      const response = await axiosInstance.post('/api/upload', formData);

      const res = response.data;
      console.log('✅ [FileService] 请求成功，状态码:', response.status);
      console.log('📦 [FileService] 完整响应数据:', res);

      // 2. 检查业务成功状态码
      console.log('🔍 [FileService] 业务状态码:', res.code);
      
      if (res.code !== 200) {
        console.log('⚠️ [FileService] 业务请求失败:', res.msg || '文件上传失败');
        return {
          success: false,
          message: res.msg || '文件上传失败'
        };
      }
      
      // 3. 根据API文档中的响应格式，返回file_id
      const result = {
        success: true,
        data: {
          id: res.data?.file_id,
          originalName: res.data?.original_name,
          ...res.data
        }
      };
      
      console.log('📤 [FileService] 返回处理后的数据:', result);
      return result;
    } catch (error) {
      console.log('❌ [FileService] 请求发生异常:', error);
      console.error('详细错误信息:', error);
      
      // 详细记录错误响应信息
      console.error('🔍 [FileService] 错误响应详情:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        headers: error.response?.headers
      });
      
      // 处理FastAPI默认错误格式
      if (error.response) {
        // 检查是否为鉴权相关错误
        const isAuthError = error.response.status === 401 || 
                          (error.response.data?.detail && (error.response.data.detail.includes('登录') || 
                          error.response.data.detail.includes('token')));
        
        if (isAuthError) {
          // 清除无效token
          localStorage.removeItem('token');
          localStorage.removeItem('userInfo');
          return {
            success: false,
            message: error.response.data?.detail || '登录已过期，请重新登录',
            isAuthError: true
          };
        }
        
        // 处理500服务器错误
        if (error.response.status === 500) {
          let errorMessage = '服务器内部错误，请稍后重试';
          
          // 尝试从响应中提取更详细的错误信息
          if (error.response.data?.detail) {
            errorMessage = error.response.data.detail;
          } else if (error.response.data?.msg) {
            errorMessage = error.response.data.msg;
          } else if (typeof error.response.data === 'string') {
            errorMessage = error.response.data;
          }
          
          return {
            success: false,
            message: `服务器错误: ${errorMessage}`,
            isServerError: true
          };
        }
        
        // 处理其他状态码错误
        const errorMessage = error.response.data?.detail || 
                          error.response.data?.msg || 
                          error.response.statusText || 
                          '请求失败';
        
        return {
          success: false,
          message: errorMessage
        };
      }

      // 处理网络错误或其他异常
      return {
        success: false,
        message: error.message || '网络异常，请检查网络连接后重试'
      };
    }
  }

  /**
   * 启动分析任务
   * @param {string} fileId - 文件ID
   * @param {string} analysisType - 分析类型：report/glomeruli_count/nuclei_count
   * @param {Object} parameters - 可选参数
   * @returns {Promise<Object>} 任务信息
   */
  static async startAnalysisTask(fileId, analysisType, parameters = {}) {
    try {
      console.log('📡 [FileService] 开始请求: startAnalysisTask');
      console.log('📥 [FileService] 输入参数:', { fileId, analysisType, parameters });
      
      // 1. 先检查Token是否存在（接口文档要求鉴权）
      const token = localStorage.getItem('token');
      console.log('🔑 [FileService] Token存在:', !!token);
      
      if (!token) {
        console.log('❌ [FileService] Token不存在，返回鉴权错误');
        return {
          success: false,
          message: '请先登录',
          isAuthError: true
        };
      }

      console.log('🔄 [FileService] 发送POST请求到: /api/analyze');
      const response = await axiosInstance.post('/api/analyze', {
        analysis_type: analysisType,
        file_id: fileId,
        parameters: parameters
      });

      const res = response.data;
      console.log('✅ [FileService] 请求成功，状态码:', response.status);
      console.log('📦 [FileService] 完整响应数据:', res);

      // 2. 检查业务成功状态码
      console.log('🔍 [FileService] 业务状态码:', res.code);
      
      if (res.code !== 200) {
        console.log('⚠️ [FileService] 业务请求失败:', res.msg || '启动分析任务失败');
        return {
          success: false,
          message: res.msg || '启动分析任务失败'
        };
      }
      
      const result = {
        success: true,
        data: res.data
      };
      
      console.log('📤 [FileService] 返回处理后的数据:', result);
      return result;
    } catch (error) {
      console.log('❌ [FileService] 请求发生异常:', error);
      console.error('详细错误信息:', error);
      
      // 详细记录错误响应信息
      console.error('🔍 [FileService] 错误响应详情:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        headers: error.response?.headers
      });
      
      // 处理FastAPI默认错误格式
      if (error.response) {
        // 检查是否为鉴权相关错误
        const isAuthError = error.response.status === 401 || 
                          (error.response.data?.detail && (error.response.data.detail.includes('登录') || 
                          error.response.data.detail.includes('token')));
        
        if (isAuthError) {
          // 清除无效token
          localStorage.removeItem('token');
          localStorage.removeItem('userInfo');
          return {
            success: false,
            message: error.response.data?.detail || '登录已过期，请重新登录',
            isAuthError: true
          };
        }
        
        // 处理500服务器错误
        if (error.response.status === 500) {
          let errorMessage = '服务器内部错误，请稍后重试';
          
          // 尝试从响应中提取更详细的错误信息
          if (error.response.data?.detail) {
            errorMessage = error.response.data.detail;
          } else if (error.response.data?.msg) {
            errorMessage = error.response.data.msg;
          } else if (typeof error.response.data === 'string') {
            errorMessage = error.response.data;
          }
          
          return {
            success: false,
            message: `服务器错误: ${errorMessage}`,
            isServerError: true
          };
        }
        
        // 处理其他状态码错误
        const errorMessage = error.response.data?.detail || 
                          error.response.data?.msg || 
                          error.response.statusText || 
                          '请求失败';
        
        return {
          success: false,
          message: errorMessage
        };
      }

      // 处理网络错误或其他异常
      return {
        success: false,
        message: error.message || '网络异常，请检查网络连接后重试'
      };
    }
  }

  /**
   * 查询任务状态
   * @param {string} taskId - 任务ID
   * @returns {Promise<Object>} 任务状态和结果
   */
  static async getTaskStatus(taskId) {
    try {
      console.log('📡 [FileService] 开始请求: getTaskStatus');
      console.log('📥 [FileService] 输入参数:', { taskId });
      
      // 1. 先检查Token是否存在（接口文档要求鉴权）
      const token = localStorage.getItem('token');
      console.log('🔑 [FileService] Token存在:', !!token);
      
      if (!token) {
        console.log('❌ [FileService] Token不存在，返回鉴权错误');
        return {
          success: false,
          message: '请先登录',
          isAuthError: true
        };
      }

      console.log('🔄 [FileService] 发送GET请求到: /api/task-status/' + taskId);
      const response = await axiosInstance.get(`/api/task-status/${taskId}`);
      console.log('✅ [FileService] 请求成功，状态码:', response.status);
      console.log('📦 [FileService] 完整响应数据:', response.data);
      const res = response.data;

      // 2. 检查业务成功状态码
      console.log('🔍 [FileService] 业务状态码:', res.code);
      
      if (res.code !== 200) {
        console.log('⚠️ [FileService] 业务请求失败:', res.msg || '查询任务状态失败');
        return {
          success: false,
          message: res.msg || '查询任务状态失败'
        };
      }
      
      const result = {
        success: true,
        data: res.data
      };
      
      console.log('📤 [FileService] 返回处理后的数据:', result);
      return result;
    } catch (error) {
      console.log('❌ [FileService] 请求发生异常:', error);
      console.error('详细错误信息:', error);
      
      // 详细记录错误响应信息
      console.error('🔍 [FileService] 错误响应详情:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        headers: error.response?.headers
      });
      
      // 处理FastAPI默认错误格式
      if (error.response) {
        // 检查是否为鉴权相关错误
        const isAuthError = error.response.status === 401 || 
                          (error.response.data?.detail && (error.response.data.detail.includes('登录') || 
                          error.response.data.detail.includes('token')));
        
        if (isAuthError) {
          // 清除无效token
          localStorage.removeItem('token');
          localStorage.removeItem('userInfo');
          return {
            success: false,
            message: error.response.data?.detail || '登录已过期，请重新登录',
            isAuthError: true
          };
        }
        
        // 处理500服务器错误
        if (error.response.status === 500) {
          let errorMessage = '服务器内部错误，请稍后重试';
          
          // 尝试从响应中提取更详细的错误信息
          if (error.response.data?.detail) {
            errorMessage = error.response.data.detail;
          } else if (error.response.data?.msg) {
            errorMessage = error.response.data.msg;
          } else if (typeof error.response.data === 'string') {
            errorMessage = error.response.data;
          }
          
          return {
            success: false,
            message: `服务器错误: ${errorMessage}`,
            isServerError: true
          };
        }
        
        // 处理其他状态码错误
        const errorMessage = error.response.data?.detail || 
                          error.response.data?.msg || 
                          error.response.statusText || 
                          '请求失败';
        
        return {
          success: false,
          message: errorMessage
        };
      }

      // 处理网络错误或其他异常
      return {
        success: false,
        message: error.message || '网络异常，请检查网络连接后重试'
      };
    }
  }

  /**
   * 下载/预览二进制文件（如图片、分割mask等）
   * @param {string} url - 文件的API路径
   * @returns {Promise<Object>} 包含blob对象和URL的结果
   */
  static async downloadResult(url) {
    try {
      console.log('📡 [FileService] 开始请求: downloadResult');
      console.log('📥 [FileService] 输入参数:', { url });
      
      // 1. 先检查Token是否存在（接口文档要求鉴权）
      const token = localStorage.getItem('token');
      console.log('🔑 [FileService] Token存在:', !!token);
      
      if (!token) {
        console.log('❌ [FileService] Token不存在，返回鉴权错误');
        return {
          success: false,
          message: '请先登录',
          isAuthError: true
        };
      }

      console.log('🔄 [FileService] 发送GET请求到:', url);
      console.log('📋 [FileService] 配置: responseType=blob (二进制文件模式)');
      
      // 设置responseType为blob，告诉axios不要把二进制文件当JSON解析
      const response = await axiosInstance.get(url, {
        responseType: 'blob'
      });
      
      console.log('✅ [FileService] 请求成功，状态码:', response.status);
      console.log('📦 [FileService] 响应类型:', response.data.type);
      console.log('📦 [FileService] 响应大小:', response.data.size, 'bytes');

      // 2. 创建Blob URL用于在浏览器中显示
      const blob = response.data;
      const blobUrl = URL.createObjectURL(blob);
      console.log('🔗 [FileService] 创建的Blob URL:', blobUrl);

      const result = {
        success: true,
        data: {
          blob: blob,          // 二进制文件对象
          blobUrl: blobUrl,    // 浏览器可直接使用的URL
          contentType: response.data.type  // 文件类型
        }
      };
      
      console.log('📤 [FileService] 返回处理后的数据:', result);
      return result;
    } catch (error) {
      console.log('❌ [FileService] 请求发生异常:', error);
      console.error('详细错误信息:', error);
      
      // 处理FastAPI默认错误格式（鉴权失败）
      if (error.response?.data?.detail) {
        // 检查是否为鉴权相关错误
        const isAuthError = error.response.status === 401 || 
                          error.response.data.detail.includes('登录') || 
                          error.response.data.detail.includes('token');
        
        if (isAuthError) {
          // 清除无效token
          localStorage.removeItem('token');
          localStorage.removeItem('userInfo');
          return {
            success: false,
            message: error.response.data.detail,
            isAuthError: true
          };
        }
        
        return {
          success: false,
          message: error.response.data.detail
        };
      }

      // 处理其他异常（网络错误、服务器宕机等）
      return {
        success: false,
        message: error.message || '网络异常，请稍后重试'
      };
    }
  }
}
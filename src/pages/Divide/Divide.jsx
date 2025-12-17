import './Divide.css';
import React, { useState, useEffect, useRef } from 'react';
import { InboxOutlined, FileTextOutlined, FolderOutlined, LoadingOutlined, PlusOutlined, SettingOutlined } from '@ant-design/icons';
import { message, Upload, Button, Modal, Spin, Typography, Card, Progress, Slider, Space, Divider, List, Select, InputNumber } from 'antd';
const { Dragger } = Upload;
const { Title, Paragraph, Text } = Typography;
import { themeColors } from '../../theme';
import { FileService } from '../../utils/fileService';
import axios from 'axios';

// 从localStorage获取token
const getToken = () => {
  return localStorage.getItem('token');
};

// 处理文件选择
const handleFileSelect = async (files, handleResultsUpdate, setIsProcessing, setProcessingProgress, params) => {
  if (!files || files.length === 0) return;
  
  // 过滤出图片文件
  const imageFiles = Array.from(files).filter(file => {
    const ext = file.name.split('.').pop().toLowerCase();
    return ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'tif', 'tiff', 'svs'].includes(ext);
  });
  
  if (imageFiles.length === 0) {
    message.error('请选择有效的图片文件');
    return;
  }
  
  message.loading(`正在上传 ${imageFiles.length} 个文件...`, 0);
  
  try {
    setIsProcessing(true);
    message.destroy();
    
    // 处理第一个文件（为简化演示，只处理一个文件）
    const file = imageFiles[0];
    
    // 创建表单数据
    const formData = new FormData();
    formData.append('file', file);
    formData.append('fist_channel', params.first_channel || '0'); 
    formData.append('second_channel', params.second_channel || '1');
    formData.append('third_channel', params.third_channel || '2');
    formData.append('flow_threhold', params.flow_threshold || '0.5'); 
    // 只保留Apifox示例中存在的参数
    formData.append('cellprob_threshold', params.cellprob_threshold || '0.0');
    formData.append('tile_norm_blocksize', params.tile_norm_blocksize || '0');
    
    // 调用新的inferenceimage接口
    console.log('=== 调用新的/inferenceimage接口 ===');
    console.log('参数:', { 
      file: file.name, 
      first_channel: params.first_channel, 
      second_channel: params.second_channel, 
      third_channel: params.third_channel,
      flow_threshold: params.flow_threshold,
      cellprob_threshold: params.cellprob_threshold,
      tile_norm_blocksize: params.tile_norm_blocksize
    });
    
    // 使用单独的axios实例，不使用现有的axiosInstance
    // 创建时传入空配置，确保不继承任何全局设置
    const directAxios = axios.create({
      baseURL: '', // 显式设置为空
      timeout: 0, // 无超时限制
      headers: {}
    });
    
    // 清除所有拦截器，确保请求不受全局配置影响
    directAxios.interceptors.request.clear();
    directAxios.interceptors.response.clear();
    
    // 调试信息：检查创建的axios实例配置
    console.log('📡 [Divide] 创建的directAxios实例配置:', {
      baseURL: directAxios.defaults.baseURL,
      timeout: directAxios.defaults.timeout,
      headers: directAxios.defaults.headers
    });
    
    // 发送请求前再次确认请求头
    const requestConfig = {
      responseType: 'blob', // 明确指定响应类型为Blob，处理图片二进制流
      headers: {
        'ngrok-skip-browser-warning': 'true' // 添加ngrok跳过浏览器警告的请求头
        // 不手动设置Content-Type，让浏览器自动处理
        // 不设置Authorization头，确保不会发送鉴权信息
      }
    };
    
    console.log('📡 [Divide] 请求配置:', {
      url: '/inferenceimage',
      method: 'POST',
      data: 'FormData (file: ' + file.name + ')',
      config: requestConfig
    });
    
    const response = await directAxios.post('/inferenceimage', formData, requestConfig);
    
    // 调试信息：查看响应类型和内容
    console.log('📡 [Divide] 响应状态:', response.status);
    console.log('📡 [Divide] 响应头:', response.headers);
    console.log('📡 [Divide] 响应数据类型:', typeof response.data);
    console.log('📡 [Divide] 响应数据长度:', response.data.length || 'N/A');
    
    // 处理成功响应 - 接口返回图片二进制流
    // 由于已经指定responseType: 'blob'，axios会直接返回Blob对象
    const blob = response.data;
    const outlinedImageUrl = URL.createObjectURL(blob);
    
    console.log('✅ [Divide] 图片二进制流处理完成，已创建Object URL');
    console.log('📋 [Divide] 图片信息:', {
      type: blob.type,
      size: blob.size + ' bytes'
    });
    
    message.destroy();
    message.success('细胞分割完成！');
    
    // 更新结果
    console.log('📊 [Divide] 任务结果数据:', { analysisResult: outlinedImageUrl });
    
    const results = {
      originalImage: URL.createObjectURL(file),
      analysisResult: outlinedImageUrl
    };
    
    console.log('📋 [Divide] 最终渲染结果:', results);
    
    handleResultsUpdate(results, file, { result: {} });
  } catch (error) {
    message.destroy();
    message.error(`处理过程中发生错误: ${error.message}`);
  } finally {
    setIsProcessing(false);
    setProcessingProgress(0);
  }
};



const props = {
  beforeUpload: () => false, // 禁用默认上传逻辑
  showUploadList: false, // 隐藏上传列表
  multiple: true,
  withCredentials: false,
  onDrop(e) {
    console.log('Dropped files', e.dataTransfer.files);
  },
};

const DivideComponent = () => {
  // 状态管理
  const [segmentationResults, setSegmentationResults] = useState({
    processed: false,
    originalImage: '',
    analysisResult: '',
    fileName: ''
  });
  
  // 上传方式选择弹窗状态
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  
  // 处理状态 - 控制加载动画
  const [isProcessing, setIsProcessing] = useState(false);
  
  // 处理进度
  const [processingProgress, setProcessingProgress] = useState(0);
  
  // 细胞分割参数
  const [segmentationParams, setSegmentationParams] = useState({
    first_channel: '0',
    second_channel: '1',
    third_channel: '2',
    flow_threshold: '0.4',
    cellprob_threshold: '0.0',
    tile_norm_blocksize: '0'
  });
  
  // 病例列表
  const [cases, setCases] = useState([]);
  
  // 当前选中的病例
  const [selectedCase, setSelectedCase] = useState(null);
  
  // 更新分割结果
  const handleResultsUpdate = (results, file, taskResult) => {
    // 设置当前分割结果
    setSegmentationResults({
      processed: true,
      originalImage: results.originalImage,
      analysisResult: results.analysisResult,
      fileName: file.name
    });
    
    // 保存结果到localStorage
    const saveResultToLocalStorage = () => {
      try {
        // 获取现有病例数据
        const existingCases = JSON.parse(localStorage.getItem('recentPathologyCases')) || [];
        
        // 创建新病例记录
        const newCase = {
          id: Date.now().toString(), // 使用时间戳作为唯一ID
          name: file.name,
          date: new Date().toISOString().split('T')[0],
          result: {
            originalImage: results.originalImage,
            analysisResult: results.analysisResult,
            fileName: file.name
          }
        };
        
        // 添加到病例列表开头
        const updatedCases = [newCase, ...existingCases];
        
        // 限制最多保存10个最近病例
        const limitedCases = updatedCases.slice(0, 10);
        
        // 保存到localStorage
        localStorage.setItem('recentPathologyCases', JSON.stringify(limitedCases));
        
        // 更新界面显示的病例列表
        setCases(limitedCases);
        
        console.log('✅ [Divide] 分析结果已保存到本地存储');
      } catch (error) {
        console.error('❌ [Divide] 保存结果到本地存储失败:', error);
        message.error('保存分析结果失败');
      }
    };
    
    // 执行保存操作
    saveResultToLocalStorage();
  };
  
  // 处理参数变化
  const handleParamChange = (paramName, value) => {
    setSegmentationParams(prev => ({
      ...prev,
      [paramName]: value
    }));
  };
  
  // 打开上传方式选择弹窗
  const openUploadModal = () => {
    setUploadModalVisible(true);
  };
  
  // 关闭上传方式选择弹窗
  const closeUploadModal = () => {
    setUploadModalVisible(false);
  };
  
  // 处理普通文件上传
  const handleFileUpload = () => {
    if (isProcessing) return;
    
    closeUploadModal();
    
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.jpg,.jpeg,.png,.gif,.bmp,.tif,.tiff,.svs';
    input.onchange = (e) => {
      handleFileSelect(e.target.files, handleResultsUpdate, setIsProcessing, setProcessingProgress, segmentationParams);
    };
    input.click();
  };
  
  // 重新上传
  const handleReupload = () => {
    setSegmentationResults({
      processed: false,
      originalImage: '',
      analysisResult: '',
      fileName: ''
    });
    openUploadModal();
  };
  
  // 页面布局样式
  const pageContainerStyle = {
    padding: '20px',
    display: 'flex',
    gap: '20px',
    minHeight: '100vh',
    width: '100%',
    backdropFilter: 'blur(10px)',
    position: 'relative',
    zIndex: 1,
    margin: 0,
    backgroundImage: 'radial-gradient(circle at 100% 0%, rgba(14, 165, 233, 0.1) 0%, transparent 20%), radial-gradient(circle at 0% 100%, rgba(139, 92, 246, 0.1) 0%, transparent 20%)',
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
  };
  
  // 左侧边栏样式
  const sidebarStyle = {
    width: '300px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    flexShrink: 0,
  };
  
  // 主内容区域样式
  const mainContentStyle = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  };
  
  // 图像对比区域样式
  const imageCompareStyle = {
    display: 'flex',
    gap: '20px',
    flexWrap: 'wrap',
    alignItems: 'stretch',
    justifyContent: 'flex-start', // 确保子元素从左边开始排列
  };
  
  // 图像容器样式
  const imageContainerStyle = {
    flex: 1,
    minWidth: '300px',
    display: 'flex',
    flexDirection: 'column',
  };
  
  // 结果区域样式
  const resultsAreaStyle = {
    display: 'flex',
    gap: '20px',
    flexWrap: 'wrap',
  };
  
  // 通用卡片样式
  const cardStyle = {
    borderRadius: 12,
    border: `1px solid ${themeColors.colorBorder}`,
    background: 'rgba(15, 23, 42, 0.9)',
    boxShadow: themeColors.boxShadow.medium,
    backdropFilter: 'blur(10px)',
    transition: 'all 0.3s ease',
    color: '#e2e8f0',
  };
  
  // 标题样式
  const titleStyle = {
    fontSize: 28,
    fontWeight: 700,
    color: '#10b981',
    marginBottom: 30,
    textAlign: 'center',
    textShadow: '0 2px 8px rgba(16, 185, 129, 0.3)',
    letterSpacing: '0.5px',
  };
  
  // 小节标题样式
  const sectionTitleStyle = {
    fontSize: 18,
    fontWeight: 600,
    color: '#ffffff',
    marginBottom: 15,
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  };
  
  // 拖拽上传区域样式
  const draggerStyle = {
    width: '100%',
    borderRadius: 12,
    border: `2px dashed ${themeColors.colorBorder}`,
    background: 'rgba(15, 23, 42, 0.7)',
    minHeight: '200px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    backdropFilter: 'blur(10px)',
    transition: 'all 0.3s ease',
    '&:hover': {
      borderColor: '#10b981',
      boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)',
      transform: 'translateY(-2px)',
    }
  };
  
  // 图像样式
  const imageStyle = {
    width: '100%',
    height: 'auto',
    borderRadius: 8,
    objectFit: 'contain',
    maxHeight: '500px',
  };

  // 验证token是否存在
  const token = getToken();
  
  // 获取用户文件列表
  const fetchUserFiles = async () => {
    try {
      console.log('=== 调用 FileService.getUserFiles ===');
      const filesResult = await FileService.getUserFiles();
      console.log('响应:', filesResult);
      
      if (filesResult.success) {
        // 处理API返回的对象格式的文件列表
        const filesObj = filesResult.data.files;
        const files = Object.keys(filesObj).map(fileId => ({
          id: fileId,
          name: filesObj[fileId].original_name,
          date: filesObj[fileId].upload_time?.split('T')[0] || '',
          status: '已完成'
        }));
        setCases(files);
      } else {
        // 处理鉴权错误
        if (filesResult.isAuthError) {
          message.error('登录已过期，请重新登录');
          // 跳转到登录页面
          setTimeout(() => {
            window.location.href = '/Enter';
          }, 1500);
          return;
        }
        
        message.error(filesResult.message || '获取文件列表失败');
      }
    } catch (error) {
      console.error('获取文件列表失败:', error);
      message.error('获取文件列表失败');
    }
  };
  
  // 组件挂载时从localStorage加载最近病例
  useEffect(() => {
    const loadCasesFromLocalStorage = () => {
      try {
        const savedCases = JSON.parse(localStorage.getItem('recentPathologyCases')) || [];
        setCases(savedCases);
        console.log('✅ [Divide] 从本地存储加载了', savedCases.length, '个最近病例');
      } catch (error) {
        console.error('❌ [Divide] 从本地存储加载病例失败:', error);
        setCases([]);
      }
    };
    
    loadCasesFromLocalStorage();
  }, []);
  
  return (
    <div style={{ position: 'relative' }}>
        {/* 背景模糊效果 - 实现Topbar模糊 */}
        <div style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          backdropFilter: 'blur(10px)', 
          zIndex: -1 
        }}></div>
        
        <div style={{ padding: '20px' }}>
          <h1 style={titleStyle}>细胞分割与计数</h1>
        </div>
        
        <div style={pageContainerStyle}>
          {/* 左侧栏：整合功能入口 + 参数控制 */}
          <div style={sidebarStyle}>
            {/* 病例管理 */}
            <Card title="病例管理" style={cardStyle} className="custom-card" titleStyle={{ color: '#ffffff', fontWeight: 600 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {/* 上传区域 */}
            <div>
              <h3 style={sectionTitleStyle}>上传图片</h3>
              <Dragger {...props} style={{ ...draggerStyle, opacity: isProcessing ? 0.5 : 1 }} onClick={(e) => {
              e.preventDefault();
              openUploadModal();
            }} disabled={isProcessing}>
                <p className="ant-upload-drag-icon" style={{ fontSize: '36px', color: isProcessing ? themeColors.colorTextTertiary : '#10b981' }}>
                  {isProcessing ? <LoadingOutlined spin /> : <FileTextOutlined />}
                </p>
                <p className="ant-upload-text" style={{ color: '#ffffff', fontSize: 16 }}>
                  {isProcessing ? '正在处理图片...' : '点击选择上传方式'}
                </p>
                <p className="ant-upload-hint" style={{ color: '#ffffff' }}>
                  {isProcessing ? '正在进行细胞分割，请稍候...' : '上传病理图片以进行细胞分割和计数分析。'}
                </p>
                
                {/* 处理进度条 */}
                {isProcessing && (
                  <div style={{ width: '80%', marginTop: 15 }}>
                    <Progress percent={processingProgress} status="active" showInfo={true} />
                  </div>
                )}
              </Dragger>
            </div>
                
                {/* 快速上传按钮 */}
                {!isProcessing && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <Button 
                      type="primary" 
                      icon={<FileTextOutlined />}
                      onClick={handleFileUpload}
                      style={{ 
                        height: '45px',
                        fontSize: '15px',
                        fontWeight: '600',
                        background: `linear-gradient(135deg, #10b981 0%, #059669 100%)`,
                        border: `1px solid #10b981`,
                        boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)',
                        transition: 'all 0.3s ease',
                      }}
                      disabled={isProcessing}
                    >
                      上传图片文件
                    </Button>
                    
                    {segmentationResults.processed && (
                      <Button 
                        icon={<PlusOutlined />}
                        onClick={handleReupload}
                        style={{ 
                          height: '45px',
                          fontSize: '15px',
                          fontWeight: '600',
                          background: `linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)`,
                          border: `1px solid #3b82f6`,
                          boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)',
                          transition: 'all 0.3s ease',
                          color: 'white'
                        }}
                        disabled={isProcessing}
                      >
                        重新上传
                      </Button>
                    )}
                  </div>
                )}
                
                <Divider style={{ borderColor: themeColors.colorBorder }} />
                
                {/* 病例列表 */}
                <div style={{ height: '320px', overflowY: 'auto' }}>
                  <h3 style={sectionTitleStyle}>最近病例</h3>
                  <List
                    size="small"
                    dataSource={cases}
                    renderItem={item => (
                      <List.Item
                        style={{ 
                          backgroundColor: selectedCase?.id === item.id ? 'rgba(16, 185, 129, 0.2)' : 'transparent',
                          borderLeft: selectedCase?.id === item.id ? '3px solid #10b981' : 'none',
                          cursor: isProcessing ? 'not-allowed' : 'pointer',
                          opacity: isProcessing ? 0.6 : 1,
                          transition: 'all 0.3s ease'
                        }}
                        onClick={() => {
                          if (isProcessing) return;
                          
                          // 选中当前病例
                          setSelectedCase(item);
                          
                          // 加载历史结果
                          if (item.result) {
                            setSegmentationResults({
                              processed: true,
                              originalImage: item.result.originalImage,
                              analysisResult: item.result.analysisResult,
                              fileName: item.result.fileName
                            });
                            
                            console.log('✅ [Divide] 已加载历史病理结果:', item.name);
                          }
                        }}
                      >
                        <List.Item.Meta
                          title={<Text style={{ color: '#ffffff' }}>{item.name}</Text>}
                          description={<Text style={{ color: '#ffffff' }}>{item.date}</Text>}
                        />
                      </List.Item>
                    )}
                  />
                </div>
              </div>
            </Card>
            

          </div>
          
          {/* 主内容区域：聚焦图像 + 结果 */}
          <div style={mainContentStyle}>
            {/* 图像对比展示 */}
            <div style={imageCompareStyle}>
              {/* 分析结果图 */}
              <div style={{ ...imageContainerStyle, width: '100%', minWidth: 'auto' }}>
                <Card title="分析结果图" style={ {borderRadius:12, width: '100%',
                  border: `1px solid ${themeColors.colorBorder}`,
                   background: 'rgba(15, 23, 42, 0.9)',
                   boxShadow: themeColors.boxShadow.medium,
                    backdropFilter: 'blur(10px)',
                       transition: 'all 0.3s ease',
                      color: '#e2e8f0'}} className="custom-card" titleStyle={{ color: '#ffffff', fontWeight: 600 }}>
                  {isProcessing ? (
                    <div style={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      height: '400px',
                      color: themeColors.colorTextSecondary
                    }}>
                      <Spin indicator={<LoadingOutlined spin style={{ fontSize: 48, color: '#10b981', marginBottom: 16 }} />} />
                      <span>正在生成分析结果...</span>
                      <Progress percent={processingProgress} style={{ width: '80%', marginTop: 20 }} showInfo={true} />
                    </div>
                  ) : !segmentationResults.processed ? (
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      height: '400px',
                      color: themeColors.colorTextSecondary
                    }}>
                      <span>请上传图片以查看分析结果</span>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                      <img 
                        src={segmentationResults.analysisResult} 
                        alt="分析结果" 
                        style={imageStyle}
                      />
                     
                      {/* 颜色图例 */}
                    
                    </div>
                  )}
                </Card>
              </div>
            </div>
            
            {/* 下方：分析结果区域 */}
            <div style={resultsAreaStyle}>
              {/* 分割结果汇总 */}
              <Card title="分割结果" style={{ ...cardStyle, flex: '1 1 calc(50% - 15px)' }} className="custom-card" titleStyle={{ color: '#ffffff', fontWeight: 600 }} height="100%">
                {isProcessing ? (
                  <div style={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      height: '200px',
                      color: '#ffffff'
                    }}>
                    <Spin indicator={<LoadingOutlined spin style={{ fontSize: 32, color: '#10b981', marginBottom: 16 }} />} />
                    <span>正在生成分割结果...</span>
                    <Progress percent={processingProgress} style={{ width: '80%', marginTop: 20 }} showInfo={true} />
                  </div>
                ) : !segmentationResults.processed ? (
                  <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      height: '200px',
                      color: '#ffffff'
                    }}>
                    <span>请上传图片以查看分割结果</span>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ padding: '15px', backgroundColor: 'rgba(5, 150, 105, 0.1)', borderRadius: 12, borderLeft: `4px solid #10b981` }}>
                      <p style={{ color: '#ffffff', marginBottom: 5, fontSize: 16 }}>图像名称: <Text strong style={{ color: '#10b981' }}>{segmentationResults.fileName}</Text></p>
                    </div>
                    

                    

                    
                    <Divider style={{ borderColor: themeColors.colorBorder }} />
                    
                    {/* 分析信息 */}
                    <div style={{ color: '#ffffff', fontSize: 14 }}>
                      <p>分析方法: Cellpose 图像分割</p>
                      <p>分析时间: {new Date().toLocaleString()}</p>
                      <p>参数设置:</p>
                      <ul style={{ marginTop: 5, marginBottom: 10, paddingLeft: 20 }}>
                        <li>通道1: {segmentationParams.first_channel}</li>
                        <li>通道2: {segmentationParams.second_channel}</li>
                        <li>通道3: {segmentationParams.third_channel}</li>
                        <li>Flow Threshold: {segmentationParams.flow_threshold}</li>
                        <li>Cellprob Threshold: {segmentationParams.cellprob_threshold}</li>
                        <li>Tile Norm Blocksize: {segmentationParams.tile_norm_blocksize}</li>
                      </ul>
                    </div>
                  </div>
                )}
              </Card>
              
              {/* 分割参数控制 - 从侧边栏移到此处 */}
              <Card title="分割参数" style={{ ...cardStyle, flex: '1 1 calc(50% - 15px)' }} className="custom-card" titleStyle={{ color: '#ffffff', fontWeight: 600 }} height="100%">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <h3 style={sectionTitleStyle}>
                    <SettingOutlined /> 细胞分割控制
                  </h3>
                  
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                        <Text style={{ color: '#ffffff' }}>第一个通道 (R)</Text>
                        <Select
                          value={segmentationParams.first_channel}
                          onChange={(value) => handleParamChange('first_channel', value)}
                          style={{ width: 100, color: '#ffffff' }}
                          disabled={isProcessing}
                          options={[
                            { value: 'None', label: 'None' },
                            { value: '0', label: '0' },
                            { value: '1', label: '1' },
                            { value: '2', label: '2' },
                            { value: '3', label: '3' },
                            { value: '4', label: '4' },
                            { value: '5', label: '5' }
                          ]}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                        <Text style={{ color: '#ffffff' }}>第二个通道 (G)</Text>
                        <Select
                          value={segmentationParams.second_channel}
                          onChange={(value) => handleParamChange('second_channel', value)}
                          style={{ width: 100, color: '#ffffff' }}
                          disabled={isProcessing}
                          options={[
                            { value: 'None', label: 'None' },
                            { value: '0', label: '0' },
                            { value: '1', label: '1' },
                            { value: '2', label: '2' },
                            { value: '3', label: '3' },
                            { value: '4', label: '4' },
                            { value: '5', label: '5' }
                          ]}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                        <Text style={{ color: '#ffffff' }}>第三个通道 (B)</Text>
                        <Select
                          value={segmentationParams.third_channel}
                          onChange={(value) => handleParamChange('third_channel', value)}
                          style={{ width: 100, color: '#ffffff' }}
                          disabled={isProcessing}
                          options={[
                            { value: 'None', label: 'None' },
                            { value: '0', label: '0' },
                            { value: '1', label: '1' },
                            { value: '2', label: '2' },
                            { value: '3', label: '3' },
                            { value: '4', label: '4' },
                            { value: '5', label: '5' }
                          ]}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                        <Text style={{ color: '#ffffff' }}>Flow Threshold</Text>
                        <Text style={{ color: '#10b981' }}>{segmentationParams.flow_threshold}</Text>
                      </div>
                      <Slider
                        value={parseFloat(segmentationParams.flow_threshold)}
                        onChange={(value) => handleParamChange('flow_threshold', value.toString())}
                        min={0.0}
                        max={1.0}
                        step={0.1}
                        disabled={isProcessing}
                      />
                    </div>
                    
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                        <Text style={{ color: '#ffffff' }}>Cellprob Threshold</Text>
                        <Text style={{ color: '#10b981' }}>{segmentationParams.cellprob_threshold}</Text>
                      </div>
                      <Slider
                        value={parseFloat(segmentationParams.cellprob_threshold)}
                        onChange={(value) => handleParamChange('cellprob_threshold', value.toString())}
                        min={0.0}
                        max={1.0}
                        step={0.1}
                        disabled={isProcessing}
                      />
                    </div>
                    
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                        <Text style={{ color: '#ffffff' }}>Tile Norm Blocksize</Text>
                        <InputNumber
                          value={parseInt(segmentationParams.tile_norm_blocksize)}
                          onChange={(value) => handleParamChange('tile_norm_blocksize', value ? value.toString() : '0')}
                          min={0}
                          max={1000}
                          style={{ width: 100 }}
                          disabled={isProcessing}
                        />
                      </div>
                    </div>
                  </Space>
                </div>
              </Card>
            </div>
          </div>
        </div>
        
        {/* 上传方式选择弹窗 */}
                <Modal
                  title="选择上传方式"
                  open={uploadModalVisible}
                  onCancel={closeUploadModal}
                  footer={null}
                  width={400}
                  style={{ borderRadius: '12px', overflow: 'hidden' }}
                >
                  <div style={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', padding: '0' }}>
                    <div style={{ backgroundColor: '#1e293b', borderBottom: '1px solid #334155', padding: '16px 24px' }}>
                      <h3 style={{ color: '#ffffff', margin: '0', fontWeight: '600' }}>选择上传方式</h3>
                    </div>
                    <div style={{ padding: '20px 0', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center', padding: '24px' }}>
                      <Button 
                        type="primary" 
                        size="large"
                        icon={<FileTextOutlined />}
                        onClick={(e) => {
                          e.preventDefault();
                          handleFileUpload();
                        }}
                        style={{ 
                          width: '85%', 
                          height: '50px', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          background: `linear-gradient(135deg, #10b981 0%, #059669 100%)`,
                          border: `1px solid #10b981`,
                          boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)',
                          transition: 'all 0.3s ease',
                        }}
                      >
                        上传图片文件
                      </Button>
                      <p style={{ color: '#ffffff', fontSize: 14, margin: '0 auto', textAlign: 'center' }}>
                        支持 .jpg, .jpeg, .png, .gif, .bmp, .tif, .tiff, .svs 格式图片
                      </p>
                    </div>
                  </div>
                </Modal>
    </div>
  );
};

export default DivideComponent;
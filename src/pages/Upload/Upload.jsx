import './Upload.css';
import React, { useState, useRef, useEffect } from 'react';
import { InboxOutlined, FileTextOutlined, FolderOutlined, LoadingOutlined, UploadOutlined, FileImageOutlined } from '@ant-design/icons';
import { message, Upload, Button, Modal } from 'antd';
const { Dragger } = Upload;
import { Card } from 'antd';
import { themeColors } from '../../theme';
import axios from 'axios';

const getToken = () => {
  return localStorage.getItem('token');
};

// 自定义上传函数 - 使用BiomedCoOp API
const customUpload = async (files, setIsProcessing) => {
  // 使用相对路径，通过Vite代理处理CORS问题
  const token = getToken();
  
  if (!token) {
    message.error('请先登录再上传文件');
    return { success: false, message: '未登录' };
  }
  
  try {
    message.loading('开始上传文件...', 0);
    
    // Step 1: 上传图片到服务器
    const uploadFormData = new FormData();
    files.forEach(file => {
      uploadFormData.append('files', file);
    });
    // 添加文件夹名称参数
    uploadFormData.append('folder_name', 'temp');
    
    const uploadResponse = await fetch('/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: uploadFormData
    });
    
    if (!uploadResponse.ok) {
      throw new Error(`文件上传失败: ${uploadResponse.status}`);
    }
    
    const uploadResult = await uploadResponse.json();
    message.destroy();
    
    // 显示上传成功提示
    alert(`文件上传成功！共 ${files.length} 个文件`);
    
    // 显示加载动画 - 更新状态
    if (setIsProcessing) setIsProcessing(true);
    message.loading('正在执行模型推理...', 0);
    
    // Step 2: 执行模型推理
    const predictResponse = await fetch('/predict', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!predictResponse.ok) {
      throw new Error(`推理失败: ${predictResponse.status}`);
    }
    
    const predictResult = await predictResponse.json();
    message.destroy();
    
    return { 
      success: true, 
      data: {
        upload: uploadResult,
        prediction: predictResult
      } 
    };
  } catch (error) {
    message.destroy();
    console.error('处理错误:', error);
    return { success: false, message: error.message };
  } finally {
    // 无论成功失败，都隐藏加载动画
    if (setIsProcessing) setIsProcessing(false);
  }
};

// 处理文件选择
const handleFileSelect = async (files, handleResultsUpdate, setIsProcessing) => {
  if (!files || files.length === 0) return;
  
  // 过滤出图片文件
  const imageFiles = Array.from(files).filter(file => {
    const ext = file.name.split('.').pop().toLowerCase();
    return ['jpg', 'jpeg', 'png', 'gif', 'bmp'].includes(ext);
  });
  
  if (imageFiles.length === 0) {
    message.error('请选择有效的图片文件');
    return;
  }
  
  message.loading(`正在上传 ${imageFiles.length} 个文件...`, 0);
  
  try {
    const uploadResult = await customUpload(imageFiles, setIsProcessing);
    
    if (uploadResult.success) {
      message.destroy();
      message.success(`文件上传成功！共 ${imageFiles.length} 个文件`);
      // 更新分析结果
      handleResultsUpdate(uploadResult.data, imageFiles);
    } else {
      message.destroy();
      message.error(`上传失败: ${uploadResult.message}`);
    }
  } catch (error) {
    message.destroy();
    message.error(`上传过程中发生错误: ${error.message}`);
    if (setIsProcessing) setIsProcessing(false);
  }
};

const props = {
  beforeUpload: () => false, // 禁用默认上传逻辑
  showUploadList: false, // 隐藏上传列表
  multiple: true,
  // 禁用默认的Content-Type设置，让浏览器自动处理multipart/form-data
  withCredentials: false,
  onDrop(e) {
    // 处理拖放上传（支持文件和文件夹）
    console.log('Dropped files', e.dataTransfer.files);
    // 这里不直接处理拖放，而是在下面的自定义点击逻辑中处理
  },
};
const UploadComponent = () =>{
    // 状态管理
    const [analysisResults, setAnalysisResults] = useState({
      uploaded: false,
      normalPercent: 0,
      abnormalPercent: 0,
      normalDescription: '',
      abnormalDescription: '',
      recommendation: '',
      uploadedFiles: []
    });
    
    // 上传方式选择弹窗状态
    const [uploadModalVisible, setUploadModalVisible] = useState(false);
    
    // 处理状态 - 控制加载动画
    const [isProcessing, setIsProcessing] = useState(false);
    
    // 处理分类结果更新 - 使用BiomedCoOp API返回的真实推理结果
    const handleResultsUpdate = (results, files) => {
      // 检查是否有推理结果
      if (!results || !results.prediction) {
        message.error('未收到有效的推理结果');
        return;
      }
      
      const predictions = results.prediction.predictions || [];
      console.log('BiomedCoOp 推理结果:', predictions);
      
      // 统计各类别的数量
      const categoryStats = {
        no_tumor: 0,
        meningioma_tumor: 0,
        glioma_tumor: 0,
        pituitary_tumor: 0,
        other: 0
      };
      
      predictions.forEach(pred => {
        if (categoryStats.hasOwnProperty(pred.category)) {
          categoryStats[pred.category]++;
        } else {
          categoryStats.other++;
        }
      });
      
      // 计算百分比
      const totalPredictions = predictions.length;
      const normalPercent = totalPredictions > 0 ? Math.round((categoryStats.no_tumor / totalPredictions) * 100) : 100;
      const abnormalPercent = 100 - normalPercent;
      
      // 生成描述文本
      let normalDescription = '';
      let abnormalDescription = '';
      let recommendation = '';
      
      if (normalPercent === 100) {
        normalDescription = '所有图像均显示正常，未检测到肿瘤迹象。';
        recommendation = '建议定期进行健康检查，保持健康的生活方式。如有不适，请及时就医。';
      } else if (normalPercent > 0) {
        const normalCount = categoryStats.no_tumor;
        normalDescription = `部分图像显示正常 (${normalCount}张)，未检测到肿瘤迹象。`;
        
        // 生成异常类型描述
        const abnormalTypes = [];
        if (categoryStats.meningioma_tumor > 0) abnormalTypes.push(`脑膜瘤 (${categoryStats.meningioma_tumor}处)`);
        if (categoryStats.glioma_tumor > 0) abnormalTypes.push(`胶质瘤 (${categoryStats.glioma_tumor}处)`);
        if (categoryStats.pituitary_tumor > 0) abnormalTypes.push(`垂体瘤 (${categoryStats.pituitary_tumor}处)`);
        if (categoryStats.other > 0) abnormalTypes.push(`其他异常 (${categoryStats.other}处)`);
        
        abnormalDescription = `检测到异常区域，包括: ${abnormalTypes.join('、')}。`;
        recommendation = '建议进行进一步的医学检查和专业诊断。请咨询神经科医生获取详细的治疗建议。';
        
        if (abnormalPercent > 50) {
          recommendation = '异常区域比例较高，建议立即就医，进行进一步的影像学检查和病理活检。';
        }
      } else { // normalPercent === 0
        normalDescription = '所有图像均显示异常。';
        
        // 生成异常类型描述
        const abnormalTypes = [];
        if (categoryStats.meningioma_tumor > 0) abnormalTypes.push(`脑膜瘤 (${categoryStats.meningioma_tumor}处)`);
        if (categoryStats.glioma_tumor > 0) abnormalTypes.push(`胶质瘤 (${categoryStats.glioma_tumor}处)`);
        if (categoryStats.pituitary_tumor > 0) abnormalTypes.push(`垂体瘤 (${categoryStats.pituitary_tumor}处)`);
        if (categoryStats.other > 0) abnormalTypes.push(`其他异常 (${categoryStats.other}处)`);
        
        abnormalDescription = `检测到异常区域，包括: ${abnormalTypes.join('、')}。`;
        recommendation = '未检测到正常组织，建议立即就医，进行全面的医学检查和专业诊断。';
      }
      
      // 更新状态
      setAnalysisResults({
        uploaded: true,
        normalPercent: normalPercent,
        abnormalPercent: abnormalPercent,
        normalDescription: normalDescription,
        abnormalDescription: abnormalDescription,
        recommendation: recommendation,
        uploadedFiles: files,
        predictions: predictions,
        totalSamples: results.prediction.total_samples_processed_to_date,
        processingTime: results.prediction.message
      });
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
      input.multiple = true;
      input.accept = '.jpg,.jpeg,.png,.gif,.bmp';
      input.onchange = (e) => {
        handleFileSelect(e.target.files, handleResultsUpdate, setIsProcessing);
      };
      input.click();
    };
    
    // 处理文件夹上传
    const handleFolderUpload = () => {
      if (isProcessing) return;
      
      closeUploadModal();
      
      const input = document.createElement('input');
      input.type = 'file';
      input.webkitdirectory = true; // 允许选择文件夹
      input.multiple = true;
      input.onchange = (e) => {
        handleFileSelect(e.target.files, handleResultsUpdate, setIsProcessing);
      };
      input.click();
    };
    
    // 上传容器样式
  const uploadContainerStyle = {
    width: '100vw',
    minHeight: '100vh',
    padding: '20px',
    background: 'rgba(15, 23, 42, 0.3)',
    overflowX: 'hidden',
    position: 'relative',
    backgroundImage: 'radial-gradient(circle at 100% 0%, rgba(14, 165, 233, 0.1) 0%, transparent 20%), radial-gradient(circle at 0% 100%, rgba(139, 92, 246, 0.1) 0%, transparent 20%)',
  };
  
  // 背景模糊效果
  const backgroundBlurStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.1) 0%, rgba(139, 92, 246, 0.08) 100%)',
    zIndex: -1,
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
  };
    
    // 验证token是否存在
    const token = getToken();
    
    // 主内容区域样式 - 左右布局
    const mainContentStyle = {
      display: 'flex',
      width: '100%',
      maxWidth: 1600,
      gap: 20,
      alignItems: 'stretch', // 修改为stretch，使两个卡片高度相同
      justifyContent: 'center',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
    };
    
    // 左右两列的通用样式
    const columnStyle = {
      width: '48%',
      maxWidth: 800,
      display: 'flex',
      flexDirection: 'column', // 确保内部元素也能占满高度
    };

  
    

    
    return (
        <div className="upload-container">
          {/* 背景模糊效果 */}
          <div className="upload-background-blur"></div>
          
          {/* 上传方式选择弹窗 */}
          <Modal
            title="选择上传方式"
            open={uploadModalVisible}
            onCancel={closeUploadModal}
            footer={null}
            width={400}
            className="upload-modal"
          >
            <div style={{ padding: '20px 0', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
              <Button 
                className="upload-button upload-button-primary"
                size="large"
                icon={<FileTextOutlined />}
                onClick={handleFileUpload}
              >
                上传图片文件
              </Button>
              <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: 14, margin: '0 auto' }}>
                支持 .jpg, .jpeg, .png, .gif, .bmp 格式图片
              </p>
              
              <Button 
                className="upload-button upload-button-secondary"
                size="large"
                icon={<FolderOutlined />}
                onClick={handleFolderUpload}
              >
                上传整个文件夹
              </Button>
              <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: 14, margin: '0 auto' }}>
                自动识别文件夹中的所有图片文件
              </p>
            </div>
          </Modal>
          
          {/* 主要内容区域 */}
          <div className="upload-main-content">
            {/* 上部：图像上传与展示区域 */}
            <div className="upload-image-section">
              <h1 className="upload-title">病理图片上传与分析</h1>
              
              {/* 上传区域 */}
              {!analysisResults.uploaded ? (
                <div className="upload-card upload-area-card">
                  <div className="upload-card-content">
                    <Dragger {...props} className={`upload-dragger ${isProcessing ? 'disabled' : ''}`} onClick={openUploadModal} disabled={isProcessing}>
                      <p className="ant-upload-drag-icon upload-drag-icon">
                        {isProcessing ? <LoadingOutlined spin /> : <FileTextOutlined />}
                      </p>
                      <p className="ant-upload-text upload-drag-text">
                        {isProcessing ? '正在处理图片...' : '点击选择上传方式'}
                      </p>
                      <p className="ant-upload-hint upload-drag-hint">
                        {isProcessing ? '正在分析图片，请稍候...' : '支持单个文件、多个文件或整个文件夹上传病理图片。'}
                      </p>
                    </Dragger>
                  </div>
                </div>
              ) : (
                /* 图像展示区域 */
                <div className="upload-image-container">
                  <div className="upload-image-box">
                    <div className="upload-image-title">原始图像</div>
                    {/* 这里可以添加图像预览 */}
                    <div className="upload-image-placeholder">
                      <FileImageOutlined style={{ fontSize: '48px', color: 'rgba(255, 255, 255, 0.3)' }} />
                      <p>原始病理图像</p>
                    </div>
                  </div>
                  
                  <div className="upload-image-box">
                    <div className="upload-image-title">分析结果</div>
                    {/* 这里可以添加分析后的图像预览 */}
                    <div className="upload-image-placeholder">
                      <FileImageOutlined style={{ fontSize: '48px', color: 'rgba(255, 255, 255, 0.3)' }} />
                      <p>AI分析结果图像</p>
                    </div>
                    {/* 图例 */}
                    <div className="upload-legend">
                      <div className="upload-legend-item">
                        <div className="upload-legend-color" style={{ backgroundColor: '#ff0000' }}></div>
                        <span>肿瘤区域</span>
                      </div>
                      <div className="upload-legend-item">
                        <div className="upload-legend-color" style={{ backgroundColor: '#0000ff' }}></div>
                        <span>正常组织</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* 下部：分析结果卡片 */}
            <div className="upload-results-section">
              <Card className="upload-card result-card">
                <div className="upload-card-content">
                  <h2 className="upload-results-title">分析结果</h2>
          
              {!analysisResults.uploaded ? (
                <p style={{ color: 'white', marginBottom: 15, fontSize: 16, textAlign: 'center', padding: '20px' }}>
                  请上传病理图片以获取AI分析结果
                </p>
              ) : (
                <>
                  {/* 显示处理统计信息 */}
                  {analysisResults.processingTime && (
                    <div className="upload-processing-info">
                      <p className="upload-info-label">处理信息：</p>
                      <p className="upload-info-value">{analysisResults.processingTime}</p>
                    </div>
                  )}
                  
                  {/* 显示预测结果详情 */}
                  {analysisResults.predictions && analysisResults.predictions.length > 0 && (
                    <div className="upload-prediction-summary">
                      <div className="upload-prediction-item">
                        <span className="upload-prediction-label">肿瘤类型：</span>
                        <span className={`upload-prediction-value ${analysisResults.predictions[0].category}`}>
                          {{
                            'no_tumor': '无肿瘤',
                            'meningioma_tumor': '脑膜瘤',
                            'glioma_tumor': '胶质瘤',
                            'pituitary_tumor': '垂体瘤'
                          }[analysisResults.predictions[0].category] || analysisResults.predictions[0].category}
                        </span>
                      </div>
                    </div>
                  )}
                  
                  <div className="upload-results-stats">
                    <div className="upload-stat-item">
                      <div className="upload-stat-label">肿瘤区域占比：</div>
                      <div className="upload-stat-value">{analysisResults.abnormalPercent || 0}%</div>
                    </div>
                    <div className="upload-stat-item">
                      <div className="upload-stat-label">正常组织占比：</div>
                      <div className="upload-stat-value">{analysisResults.normalPercent || 0}%</div>
                    </div>
                  </div>
                  
                  <div className="upload-status-card recommendation">
                    <p className="upload-status-recommendation">
                      <strong>临床建议：</strong>
                      {analysisResults.recommendation}
                    </p>
                  </div>
                </>
              )}
            </div>
              </Card>
            </div>
          </div>
        </div>
        
    )
}
export default UploadComponent;
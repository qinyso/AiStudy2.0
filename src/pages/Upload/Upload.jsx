import './Upload.css';
import React, { useState } from 'react';
import { InboxOutlined, FileTextOutlined, FolderOutlined, LoadingOutlined } from '@ant-design/icons';
import { message, Upload, Button, Modal } from 'antd';
const { Dragger } = Upload;
import { Card } from 'antd';
import { themeColors } from '../../theme';
// 从localStorage获取token
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
    
    // 上传组件样式
    const uploadContainerStyle = {
      marginTop: 40,
      padding: '0 20px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      minHeight: '80vh',
      width: '100%',
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
    };
    
    // 左右两列的通用样式
    const columnStyle = {
      width: '48%',
      maxWidth: 800,
      display: 'flex',
      flexDirection: 'column', // 确保内部元素也能占满高度
    };

    // 拖拽上传区域样式
    const draggerStyle = {
      width: '100%',
      borderRadius: 12,
      border: `2px dashed ${themeColors.colorBorder}`,
      background: 'rgba(15, 23, 42, 0.7)',
      minHeight: '400px', // 设置与右侧卡片相同的最小高度
      display: 'flex', // 添加flex布局
      flexDirection: 'column', // 垂直排列内容
      alignItems: 'center', // 水平居中
      justifyContent: 'center', // 垂直居中
      padding: '20px', // 添加内边距
      '&:hover': {
        borderColor: themeColors.colorPrimary,
        boxShadow: themeColors.boxShadow.medium,
      }
    };

    // 卡片样式
    const cardStyle = {
      width: '100%',
      borderRadius: 12,
      border: `1px solid ${themeColors.colorBorder}`,
      background: 'rgba(15, 23, 42, 0.7)',
      boxShadow: themeColors.boxShadow.medium,
      minHeight: '400px', // 增加最小高度，使界面更加美观
      display: 'flex',
      flexDirection: 'column',
      margin: 0, // 移除默认边距
    };

    // 标题样式
    const titleStyle = {
      fontSize: 24,
      fontWeight: 600,
      color: themeColors.colorPrimary,
      marginBottom: 20,
      textAlign: 'center',
    };

    // 列表样式
    const listStyle = {
      paddingLeft: 20,
      color: themeColors.colorTextSecondary,
    };
    
    return (
        <div style={uploadContainerStyle}>
          <h1 style={titleStyle}>病理图片上传与分析</h1>
          
          <div style={mainContentStyle}>
            {/* 左侧：上传区域 */}
            <div style={columnStyle}>
              <Dragger {...props} style={draggerStyle} onClick={openUploadModal} disabled={isProcessing}>
                <p className="ant-upload-drag-icon" style={{ fontSize: '48px', color: isProcessing ? themeColors.colorTextTertiary : themeColors.colorPrimary }}>
                  {isProcessing ? <LoadingOutlined spin /> : <FileTextOutlined />}
                </p>
                <p className="ant-upload-text" style={{ color: themeColors.colorTextBase, fontSize: 18 }}>
                  {isProcessing ? '正在处理图片...' : '点击选择上传方式'}
                </p>
                <p className="ant-upload-hint" style={{ color: themeColors.colorTextTertiary }}>
                  {isProcessing ? '正在分析图片，请稍候...' : '支持单个文件、多个文件或整个文件夹上传病理图片。'}
                </p>
                
                {/* 快速上传提示 */}
                <div style={{ marginTop: '15px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <Button 
                    type="primary" 
                    icon={<FileTextOutlined />}
                    onClick={(e) => { e.stopPropagation(); handleFileUpload(); }}
                    style={{ maxWidth: '300px', alignSelf: 'center' }}
                    disabled={isProcessing}
                  >
                    上传图片文件
                  </Button>
                  <Button 
                    icon={<FolderOutlined />}
                    onClick={(e) => { e.stopPropagation(); handleFolderUpload(); }}
                    style={{ maxWidth: '300px', alignSelf: 'center' }}
                    disabled={isProcessing}
                  >
                    上传文件夹
                  </Button>
                </div>
              </Dragger>
            </div>
            
            {/* 上传方式选择弹窗 */}
            <Modal
              title="选择上传方式"
              open={uploadModalVisible}
              onCancel={closeUploadModal}
              footer={null}
              width={400}
            >
              <div style={{ padding: '20px 0', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
                <Button 
                  type="primary" 
                  size="large"
                  icon={<FileTextOutlined />}
                  onClick={handleFileUpload}
                  style={{ width: '80%', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  上传图片文件
                </Button>
                <p style={{ color: themeColors.colorTextTertiary, fontSize: 14, margin: '0 auto' }}>
                  支持 .jpg, .jpeg, .png, .gif, .bmp 格式图片
                </p>
                
                <Button 
                  size="large"
                  icon={<FolderOutlined />}
                  onClick={handleFolderUpload}
                  style={{ width: '80%', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  上传整个文件夹
                </Button>
                <p style={{ color: themeColors.colorTextTertiary, fontSize: 14, margin: '0 auto' }}>
                  自动识别文件夹中的所有图片文件
                </p>
              </div>
            </Modal>
            
            {/* 右侧：分析结果卡片 */}
            <div style={columnStyle}>
              <Card style={cardStyle}>
            <div>
              <h2 style={{ color: themeColors.colorPrimary, fontSize: 20, marginBottom: 15, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={themeColors.colorPrimary} strokeWidth="2">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                  <path d="M13 16l-3-3m0 0l3-3m-3 3v6"/>
                </svg>
                病理图像分析结果
              </h2>
              
              {!analysisResults.uploaded ? (
                <p style={{ color: themeColors.colorTextSecondary, marginBottom: 15, fontSize: 16, textAlign: 'center', padding: '20px' }}>
                  请上传病理图片以获取AI分析结果
                </p>
              ) : (
                <>
                  <p style={{ color: themeColors.colorTextSecondary, marginBottom: 15, fontSize: 16 }}>AI辅助诊断系统已完成对您上传病理切片的分析，结果如下：</p>
                  
                  {/* 显示处理统计信息 */}
                  {analysisResults.processingTime && (
                    <div style={{ marginBottom: 20, padding: '10px', backgroundColor: 'rgba(15, 23, 42, 0.5)', borderRadius: 8 }}>
                      <p style={{ color: themeColors.colorTextSecondary, marginBottom: 5, fontSize: 14 }}><strong>处理信息：</strong></p>
                      <p style={{ color: themeColors.colorTextTertiary, fontSize: 14, margin: 0 }}>{analysisResults.processingTime}</p>
                    </div>
                  )}
                  
                  {/* 显示预测结果详情 */}
                  {analysisResults.predictions && analysisResults.predictions.length > 0 && (
                    <div style={{ marginBottom: 20, padding: '15px', backgroundColor: 'rgba(15, 23, 42, 0.5)', borderRadius: 8 }}>
                      <p style={{ color: themeColors.colorTextSecondary, marginBottom: 10, fontSize: 14 }}><strong>预测结果详情：</strong></p>
                      <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                        {analysisResults.predictions.map((prediction, index) => {
                          // 获取对应的文件名
                          const fileName = analysisResults.uploadedFiles[index] ? analysisResults.uploadedFiles[index].name : `Image ${index + 1}`;
                          
                          // 根据预测类别设置样式
                          let categoryStyle = { color: themeColors.colorTextTertiary };
                          let categoryText = prediction.category;
                          
                          // 创建英文名称到中文翻译的映射
                          const categoryTranslations = {
                            'no_tumor': '无肿瘤',
                            'meningioma_tumor': '脑膜瘤',
                            'glioma_tumor': '胶质瘤',
                            'pituitary_tumor': '垂体瘤'
                          };
                           
                          // 在英文名称后面添加中文翻译
                          if (prediction.category === 'no_tumor') {
                            categoryStyle = { color: themeColors.colorSuccess };
                            categoryText = `${prediction.category} (${categoryTranslations[prediction.category]})`;
                          } else if (prediction.category === 'meningioma_tumor') {
                            categoryStyle = { color: themeColors.colorWarning };
                            categoryText = `${prediction.category} (${categoryTranslations[prediction.category]})`;
                          } else if (prediction.category === 'glioma_tumor') {
                            categoryStyle = { color: themeColors.colorError };
                            categoryText = `${prediction.category} (${categoryTranslations[prediction.category]})`;
                          } else if (prediction.category === 'pituitary_tumor') {
                            categoryStyle = { color: themeColors.colorPrimary };
                            categoryText = `${prediction.category} (${categoryTranslations[prediction.category]})`;
                          } else {
                            // 对于未知类型，保持英文名称不变
                            categoryText = prediction.category;
                          }
                          
                          return (
                            <div key={index} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: index < analysisResults.predictions.length - 1 ? `1px solid ${themeColors.colorBorder}` : 'none' }}>
                              <span style={{ fontSize: 13, color: themeColors.colorTextTertiary, maxWidth: '60%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {fileName}
                              </span>
                              <span style={{ fontSize: 13, ...categoryStyle, fontWeight: 'bold' }}>
                                {categoryText}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  
                  <div style={{ marginBottom: 20, padding: '15px', backgroundColor: 'rgba(5, 150, 105, 0.1)', borderRadius: 8, borderLeft: `4px solid ${themeColors.colorSuccess}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' }}>
                      <span style={{ fontWeight: 'bold', color: themeColors.colorSuccess, fontSize: 18 }}>正常组织</span>
                      <span style={{ padding: '2px 8px', borderRadius: '12px', backgroundColor: themeColors.colorSuccess, color: 'white', fontSize: 12 }}>{analysisResults.normalPercent}%</span>
                    </div>
                    <p style={{ color: themeColors.colorTextTertiary, marginTop: '5px', fontSize: 14 }}>{analysisResults.normalDescription}</p>
                  </div>
                  
                  <div style={{ marginBottom: 20, padding: '15px', backgroundColor: 'rgba(220, 38, 38, 0.1)', borderRadius: 8, borderLeft: `4px solid ${themeColors.colorError}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' }}>
                      <span style={{ fontWeight: 'bold', color: themeColors.colorError, fontSize: 18 }}>异常区域</span>
                      <span style={{ padding: '2px 8px', borderRadius: '12px', backgroundColor: themeColors.colorError, color: 'white', fontSize: 12 }}>{analysisResults.abnormalPercent}%</span>
                    </div>
                    <p style={{ color: themeColors.colorTextTertiary, marginTop: '5px', fontSize: 14 }}>{analysisResults.abnormalDescription}</p>
                  </div>
                  
                  <div style={{ padding: '15px', backgroundColor: 'rgba(217, 119, 6, 0.1)', borderRadius: 8, borderLeft: `4px solid ${themeColors.colorWarning}` }}>
                    <p style={{ color: themeColors.colorTextSecondary, fontSize: 14, margin: 0 }}>
                      <strong style={{ color: themeColors.colorWarning }}>临床建议：</strong>
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
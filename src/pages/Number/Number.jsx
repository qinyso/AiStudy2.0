import './Number.css';
import React, { useState } from 'react';
import { InboxOutlined, FileTextOutlined, FolderOutlined, LoadingOutlined, ReloadOutlined } from '@ant-design/icons';
import { message, Upload, Button, Modal, Card } from 'antd';
const { Dragger } = Upload;
import { themeColors } from '../../theme';

// 从localStorage获取token
const getToken = () => {
  return localStorage.getItem('token');
};

// 模拟WSI处理函数 - 将图片分割成patch并生成mask
const processWSIWithPatch = async (files) => {
  // 模拟处理延迟
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // 模拟肾小球数量（随机生成，范围50-200）
  const glomerulusCount = Math.floor(Math.random() * 150) + 50;
  
  // 模拟生成的图片URL（使用占位图）
  const originalImage = URL.createObjectURL(files[0]);
  
  // 生成模拟的mask图片（这里使用原始图片作为模拟，实际应用中需要根据处理结果生成）
  // 由于不能直接生成mask，我们使用模拟数据
  const maskImage = originalImage; // 实际应用中应替换为真实的mask图像
  const overlayImage = originalImage; // 实际应用中应替换为带有标记的叠加图像
  
  return {
    success: true,
    data: {
      glomerulusCount,
      originalImage,
      maskImage,
      overlayImage,
      processingDetails: {
        totalPatches: 128, // 模拟分割成128个patch
        processedPatches: 128,
        patchSize: '512x512',
        processingTime: '2.8s'
      }
    }
  };
};

// 自定义上传函数
const customUpload = async (files, setIsProcessing) => {
  const token = getToken();
  
  if (!token) {
    message.error('请先登录再上传文件');
    return { success: false, message: '未登录' };
  }
  
  try {
    message.loading('开始上传WSI图像...', 0);
    
    // 模拟上传延迟
    await new Promise(resolve => setTimeout(resolve, 1000));
    message.destroy();
    
    // 显示加载动画 - 更新状态
    if (setIsProcessing) setIsProcessing(true);
    message.loading('正在分割图像并生成mask...', 0);
    
    // 处理WSI图像
    const processResult = await processWSIWithPatch(files);
    message.destroy();
    
    return { 
      success: true, 
      data: processResult.data
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
    return ['jpg', 'jpeg', 'png', 'tif', 'tiff', 'svs', 'ndpi'].includes(ext);
  });
  
  if (imageFiles.length === 0) {
    message.error('请选择有效的WSI图像文件');
    return;
  }
  
  if (imageFiles.length > 1) {
    message.warning('一次仅支持上传一个WSI图像，将处理第一个文件');
  }
  
  message.loading(`正在处理WSI图像...`, 0);
  
  try {
    const uploadResult = await customUpload([imageFiles[0]], setIsProcessing);
    
    if (uploadResult.success) {
      message.destroy();
      message.success(`WSI图像处理成功！`);
      // 更新分析结果
      handleResultsUpdate(uploadResult.data, imageFiles[0]);
    } else {
      message.destroy();
      message.error(`处理失败: ${uploadResult.message}`);
    }
  } catch (error) {
    message.destroy();
    message.error(`处理过程中发生错误: ${error.message}`);
    if (setIsProcessing) setIsProcessing(false);
  }
};

const props = {
  beforeUpload: () => false, // 禁用默认上传逻辑
  showUploadList: false, // 隐藏上传列表
  multiple: false, // 单次只上传一个WSI图像
  withCredentials: false,
  onDrop(e) {
    console.log('Dropped files', e.dataTransfer.files);
  },
};

const NumberComponent = () => {
  // 状态管理
  const [analysisResults, setAnalysisResults] = useState({
    processed: false,
    glomerulusCount: 0,
    originalImage: '',
    maskImage: '',
    overlayImage: '',
    processingDetails: null,
    uploadedFile: null
  });
  
  // 上传方式选择弹窗状态
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  
  // 处理状态 - 控制加载动画
  const [isProcessing, setIsProcessing] = useState(false);
  
  // 处理结果更新
  const handleResultsUpdate = (results, file) => {
    setAnalysisResults({
      processed: true,
      glomerulusCount: results.glomerulusCount,
      originalImage: results.originalImage,
      maskImage: results.maskImage,
      overlayImage: results.overlayImage,
      processingDetails: results.processingDetails,
      uploadedFile: file
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
    input.accept = '.jpg,.jpeg,.png,.tif,.tiff,.svs,.ndpi';
    input.onchange = (e) => {
      handleFileSelect(e.target.files, handleResultsUpdate, setIsProcessing);
    };
    input.click();
  };
  
  // 重新上传文件
  const handleReupload = () => {
    setAnalysisResults({
      processed: false,
      glomerulusCount: 0,
      originalImage: '',
      maskImage: '',
      overlayImage: '',
      processingDetails: null,
      uploadedFile: null
    });
    openUploadModal();
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
    alignItems: 'stretch',
    justifyContent: 'center',
  };
  
  // 左右两列的通用样式
  const columnStyle = {
    width: '48%',
    maxWidth: 800,
    display: 'flex',
    flexDirection: 'column',
  };

  // 拖拽上传区域样式
  const draggerStyle = {
    width: '100%',
    borderRadius: 12,
    border: `2px dashed ${themeColors.colorBorder}`,
    background: 'rgba(15, 23, 42, 0.7)',
    minHeight: '400px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
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
    minHeight: '400px',
    display: 'flex',
    flexDirection: 'column',
    margin: 0,
  };

  // 标题样式
  const titleStyle = {
    fontSize: 24,
    fontWeight: 600,
    color: themeColors.colorPrimary,
    marginBottom: 20,
    textAlign: 'center',
  };

  // 图像容器样式
  const imagesContainerStyle = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 15,
    justifyContent: 'center',
    marginTop: 20,
  };

  // 单个图像卡片样式
  const imageCardStyle = {
    width: 'calc(50% - 10px)',
    minWidth: '250px',
    marginBottom: 15,
  };

  // 图像样式
  const imageStyle = {
    width: '100%',
    height: 'auto',
    maxHeight: '300px',
    objectFit: 'contain',
    borderRadius: 8,
  };
  
  return (
      <div style={uploadContainerStyle}>
        <h1 style={titleStyle}>WSI图像分割与肾小球计数</h1>
        
        <div style={mainContentStyle}>
          {/* 左侧：上传区域 */}
          <div style={columnStyle}>
            <Dragger {...props} style={draggerStyle} onClick={openUploadModal} disabled={isProcessing || analysisResults.processed}>
              <p className="ant-upload-drag-icon" style={{ fontSize: '48px', color: (isProcessing || analysisResults.processed) ? themeColors.colorTextTertiary : themeColors.colorPrimary }}>
                {isProcessing ? <LoadingOutlined spin /> : <FileTextOutlined />}
              </p>
              <p className="ant-upload-text" style={{ color: themeColors.colorTextBase, fontSize: 18 }}>
                {isProcessing ? '正在处理图像...' : analysisResults.processed ? '已完成处理' : '点击选择上传方式'}
              </p>
              <p className="ant-upload-hint" style={{ color: themeColors.colorTextTertiary }}>
                {isProcessing ? '正在分割图像并生成mask，请稍候...' : 
                 analysisResults.processed ? '处理已完成，显示结果如下' : 
                 '支持上传WSI图像文件（.jpg, .jpeg, .png, .tif, .tiff, .svs, .ndpi）'}
              </p>
              
              {!isProcessing && !analysisResults.processed && (
                <div style={{ marginTop: '15px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <Button 
                    type="primary" 
                    icon={<FileTextOutlined />}
                    onClick={(e) => { e.stopPropagation(); handleFileUpload(); }}
                    style={{ maxWidth: '300px', alignSelf: 'center' }}
                  >
                    上传WSI图像
                  </Button>
                </div>
              )}
              
              {analysisResults.processed && (
                <div style={{ marginTop: '15px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <Button 
                    type="primary" 
                    icon={<ReloadOutlined />}
                    onClick={handleReupload}
                    style={{ maxWidth: '300px', alignSelf: 'center' }}
                  >
                    重新上传
                  </Button>
                </div>
              )}
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
                上传WSI图像文件
              </Button>
              <p style={{ color: themeColors.colorTextTertiary, fontSize: 14, margin: '0 auto' }}>
                支持 .jpg, .jpeg, .png, .tif, .tiff, .svs, .ndpi 格式
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
                  肾小球分割与计数结果
                </h2>
                
                {!analysisResults.processed ? (
                  <p style={{ color: themeColors.colorTextSecondary, marginBottom: 15, fontSize: 16, textAlign: 'center', padding: '20px' }}>
                    请上传WSI图像以获取分割与计数结果
                  </p>
                ) : (
                  <>
                    {/* 显示肾小球计数 */}
                    <div style={{ marginBottom: 20, padding: '20px', backgroundColor: 'rgba(5, 150, 105, 0.1)', borderRadius: 8, borderLeft: `4px solid ${themeColors.colorSuccess}`, textAlign: 'center' }}>
                      <h3 style={{ color: themeColors.colorSuccess, fontSize: 18, marginBottom: 10 }}>肾小球计数</h3>
                      <div style={{ fontSize: 48, fontWeight: 'bold', color: themeColors.colorPrimary, marginBottom: 10 }}>
                        {analysisResults.glomerulusCount}
                      </div>
                      <p style={{ color: themeColors.colorTextTertiary, fontSize: 14 }}>在WSI图像中检测到的肾小球总数</p>
                    </div>
                    
                    {/* 显示处理统计信息 */}
                    {analysisResults.processingDetails && (
                      <div style={{ marginBottom: 20, padding: '15px', backgroundColor: 'rgba(15, 23, 42, 0.5)', borderRadius: 8 }}>
                        <p style={{ color: themeColors.colorTextSecondary, marginBottom: 10, fontSize: 14 }}><strong>处理信息：</strong></p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                          <div style={{ backgroundColor: 'rgba(15, 23, 42, 0.8)', padding: '8px 12px', borderRadius: 6 }}>
                            <span style={{ color: themeColors.colorTextTertiary, fontSize: 12 }}>总Patches：</span>
                            <span style={{ color: themeColors.colorTextSecondary, fontSize: 12, fontWeight: 'bold' }}>{analysisResults.processingDetails.totalPatches}</span>
                          </div>
                          <div style={{ backgroundColor: 'rgba(15, 23, 42, 0.8)', padding: '8px 12px', borderRadius: 6 }}>
                            <span style={{ color: themeColors.colorTextTertiary, fontSize: 12 }}>Patch大小：</span>
                            <span style={{ color: themeColors.colorTextSecondary, fontSize: 12, fontWeight: 'bold' }}>{analysisResults.processingDetails.patchSize}</span>
                          </div>
                          <div style={{ backgroundColor: 'rgba(15, 23, 42, 0.8)', padding: '8px 12px', borderRadius: 6 }}>
                            <span style={{ color: themeColors.colorTextTertiary, fontSize: 12 }}>处理时间：</span>
                            <span style={{ color: themeColors.colorTextSecondary, fontSize: 12, fontWeight: 'bold' }}>{analysisResults.processingDetails.processingTime}</span>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* 显示处理后的图像 */}
                    <div style={imagesContainerStyle}>
                      <Card 
                        title="原始图像" 
                        style={imageCardStyle}
                        size="small"
                      >
                        {analysisResults.originalImage && (
                          <img src={analysisResults.originalImage} alt="原始WSI图像" style={imageStyle} />
                        )}
                      </Card>
                      
                      <Card 
                        title="分割Mask" 
                        style={imageCardStyle}
                        size="small"
                      >
                        {analysisResults.maskImage && (
                          <img src={analysisResults.maskImage} alt="肾小球分割Mask" style={imageStyle} />
                        )}
                      </Card>
                      
                      <Card 
                        title="叠加结果" 
                        style={{ width: '100%', minWidth: '250px' }}
                        size="small"
                      >
                        {analysisResults.overlayImage && (
                          <img src={analysisResults.overlayImage} alt="肾小球叠加结果" style={imageStyle} />
                        )}
                      </Card>
                    </div>
                  </>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
};

export default NumberComponent;
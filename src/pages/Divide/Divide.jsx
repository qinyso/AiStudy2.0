import './Divide.css';
import React, { useState } from 'react';
import { InboxOutlined, FileTextOutlined, FolderOutlined, LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import { message, Upload, Button, Modal, Spin, Typography, Card, Progress } from 'antd';
const { Dragger } = Upload;
const { Title, Paragraph, Text } = Typography;
import { themeColors } from '../../theme';

// 从localStorage获取token
const getToken = () => {
  return localStorage.getItem('token');
};

// 模拟cellpose处理函数 - 实际项目中应该通过API调用后端服务
const processImageWithCellpose = async (file, setProcessingProgress) => {
  // 模拟处理进度
  for (let i = 0; i <= 100; i += 10) {
    await new Promise(resolve => setTimeout(resolve, 100));
    if (setProcessingProgress) setProcessingProgress(i);
  }

  // 模拟返回结果 - 实际项目中应替换为真实API调用
  return {
    originalImage: URL.createObjectURL(file),
    outlinedImage: URL.createObjectURL(file), // 实际应该是处理后的图像
    maskImage: URL.createObjectURL(file),      // 实际应该是处理后的图像
    cellCount: 158, // 模拟细胞数量
    // 在实际应用中，这里会返回后端处理生成的图像URL
  };
};

// 处理文件选择
const handleFileSelect = async (files, handleResultsUpdate, setIsProcessing, setProcessingProgress) => {
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
    setIsProcessing(true);
    message.destroy();
    message.loading('正在进行细胞分割...', 0);
    
    // 处理第一个文件（为简化演示，只处理一个文件）
    const results = await processImageWithCellpose(imageFiles[0], setProcessingProgress);
    
    message.destroy();
    message.success('细胞分割完成！');
    handleResultsUpdate(results, imageFiles[0]);
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
    outlinedImage: '',
    maskImage: '',
    cellCount: 0,
    fileName: ''
  });
  
  // 上传方式选择弹窗状态
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  
  // 处理状态 - 控制加载动画
  const [isProcessing, setIsProcessing] = useState(false);
  
  // 处理进度
  const [processingProgress, setProcessingProgress] = useState(0);
  
  // 更新分割结果
  const handleResultsUpdate = (results, file) => {
    setSegmentationResults({
      processed: true,
      originalImage: results.originalImage,
      outlinedImage: results.outlinedImage,
      maskImage: results.maskImage,
      cellCount: results.cellCount,
      fileName: file.name
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
    input.accept = '.jpg,.jpeg,.png,.gif,.bmp';
    input.onchange = (e) => {
      handleFileSelect(e.target.files, handleResultsUpdate, setIsProcessing, setProcessingProgress);
    };
    input.click();
  };
  
  // 重新上传
  const handleReupload = () => {
    setSegmentationResults({
      processed: false,
      originalImage: '',
      outlinedImage: '',
      maskImage: '',
      cellCount: 0,
      fileName: ''
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
  const imageContainerStyle = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 15,
    justifyContent: 'center',
    marginTop: 20,
  };

  // 单个图像卡片样式
  const imageCardStyle = {
    width: 'calc(33.333% - 10px)',
    minWidth: '200px',
    borderRadius: 8,
    overflow: 'hidden',
  };

  // 图像样式
  const imageStyle = {
    width: '100%',
    height: 'auto',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  };

  // 验证token是否存在
  const token = getToken();
  
  return (
    <div style={uploadContainerStyle}>
      <h1 style={titleStyle}>细胞分割与计数</h1>
      
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
              {isProcessing ? '正在进行细胞分割，请稍候...' : '上传病理图片以进行细胞分割和计数分析。'}
            </p>
            
            {/* 处理进度条 */}
            {isProcessing && (
              <div style={{ width: '80%', marginTop: 20 }}>
                <Progress percent={processingProgress} status="active" />
              </div>
            )}
            
            {/* 快速上传按钮 */}
            {!isProcessing && (
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
              上传图片文件
            </Button>
            <p style={{ color: themeColors.colorTextTertiary, fontSize: 14, margin: '0 auto' }}>
              支持 .jpg, .jpeg, .png, .gif, .bmp 格式图片
            </p>
          </div>
        </Modal>
        
        {/* 右侧：分割结果卡片 */}
        <div style={columnStyle}>
          <Card style={cardStyle}>
            <div>
              <h2 style={{ color: themeColors.colorPrimary, fontSize: 20, marginBottom: 15, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={themeColors.colorPrimary} strokeWidth="2">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                  <path d="M13 16l-3-3m0 0l3-3m-3 3v6"/>
                </svg>
                细胞分割与计数结果
              </h2>
              
              {!segmentationResults.processed && !isProcessing ? (
                <p style={{ color: themeColors.colorTextSecondary, marginBottom: 15, fontSize: 16, textAlign: 'center', padding: '20px' }}>
                  请上传病理图片以获取细胞分割与计数结果
                </p>
              ) : (
                <>
                  {isProcessing ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 0' }}>
                      <Spin size="large" tip="正在进行细胞分割，请稍候..." />
                      <div style={{ marginTop: 20, width: '80%' }}>
                        <Progress percent={processingProgress} status="active" />
                      </div>
                    </div>
                  ) : (
                    <>
                      <p style={{ color: themeColors.colorTextSecondary, marginBottom: 15, fontSize: 16 }}>已完成对图片 <Text strong>{segmentationResults.fileName}</Text> 的细胞分割和计数分析</p>
                      
                      {/* 显示细胞数量 */}
                      <div style={{ marginBottom: 20, padding: '15px', backgroundColor: 'rgba(5, 150, 105, 0.1)', borderRadius: 8, borderLeft: `4px solid ${themeColors.colorSuccess}` }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' }}>
                          <span style={{ fontWeight: 'bold', color: themeColors.colorSuccess, fontSize: 18 }}>细胞总数</span>
                          <span style={{ padding: '5px 15px', borderRadius: '16px', backgroundColor: themeColors.colorSuccess, color: 'white', fontSize: 16, fontWeight: 'bold' }}>{segmentationResults.cellCount}</span>
                        </div>
                        <p style={{ color: themeColors.colorTextTertiary, marginTop: '5px', fontSize: 14 }}>Cellpose 检测到的细胞核总数: {segmentationResults.cellCount}个</p>
                      </div>
                      
                      {/* 显示分割结果图像 */}
                      <div style={imageContainerStyle}>
                        {/* 原始图像 */}
                        <Card title="原始图像" size="small" style={imageCardStyle}>
                          <img src={segmentationResults.originalImage} alt="原始图像" style={imageStyle} />
                        </Card>
                        
                        {/* 轮廓图像 */}
                        <Card title="预测轮廓" size="small" style={imageCardStyle}>
                          <img src={segmentationResults.outlinedImage} alt="预测轮廓" style={imageStyle} />
                        </Card>
                        
                        {/* 掩码图像 */}
                        <Card title="预测掩码" size="small" style={imageCardStyle}>
                          <img src={segmentationResults.maskImage} alt="预测掩码" style={imageStyle} />
                        </Card>
                      </div>
                      
                      {/* 重新上传按钮 */}
                      <div style={{ marginTop: 20, textAlign: 'center' }}>
                        <Button 
                          type="primary" 
                          icon={<PlusOutlined />}
                          onClick={handleReupload}
                        >
                          重新上传
                        </Button>
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DivideComponent;
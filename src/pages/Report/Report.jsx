import './Report.css';
import React, { useState, useRef, useEffect } from 'react';
import { 
  FileTextOutlined, FolderOutlined, LoadingOutlined, CopyOutlined, 
  EyeOutlined, DeleteOutlined, ArrowRightOutlined, FileSearchOutlined, 
  FilePdfOutlined, UploadOutlined 
} from '@ant-design/icons';
import { message, Upload, Button, Modal, Card, Spin, Progress } from 'antd';
const { Dragger } = Upload;
import { themeColors } from '../../theme';
import z4 from '../../assets/z4.png';
import z3 from '../../assets/z3.png';
import z2 from '../../assets/z2.png';
import z1 from '../../assets/z1.png';
// 示例病理图数据
const exampleImages = [
  {
    id: 1,
    name: 'IgA肾病切片',
    description: '系膜细胞增生，系膜区增宽，免疫复合物沉积',
    src: z1
  },
  {
    id: 2,
    name: '膜性肾病切片',
    description: '基底膜增厚，上皮下电子致密物沉积',
    src: z2
  },
  {
    id: 3,
    name: '微小病变肾病',
    description: '肾小球基本正常，肾小管上皮细胞变性',
    src: z3
  },
  {
    id: 4,
    name: '膜增生性肾小球肾炎',
    description: '系膜插入，基底膜呈双轨征',
    src: z4
  }
];

const ReportComponent = () => {
  // 状态管理
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [exampleModalVisible, setExampleModalVisible] = useState(false);
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [showHighlight, setShowHighlight] = useState(false);
  const [showProgressTip, setShowProgressTip] = useState(false);
  const [generateProgress, setGenerateProgress] = useState(0);
  const reportRef = useRef(null);
  
  // 报告数据状态
  const [reportData, setReportData] = useState({
    generated: false,
    generating: false,
    generatedTime: '',
    imageInfo: [],
    finalDiagnosis: '',
    microscopicFindings: '',
    criticalFindings: ''
  });

  // 定义文件验证常量
  // 支持病理WSI格式文件
  const ALLOWED_FILE_TYPES = ['image/x-svs', 'image/tiff', 'image/x-ndpi', 'image/x-mrx', 'image/x-vsi'];
  const MAX_FILE_SIZE = 1024 * 1024 * 1024; // 1GB，支持更大的WSI文件
  
  // 调用病理报告生成API
  const generateReportFromImage = async (file, setProgress) => {
    const API_URL = '/api/report';
    
    // 创建FormData
    const formData = new FormData();
    formData.append('file', file);
    
    // 模拟进度更新
    let progressInterval;
    if (setProgress) {
      setProgress(0);
      progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 5, 90)); // 最多到90%，等待API返回
      }, 1000);
    }
    
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        body: formData
      });
      
      // 清除进度更新
      if (progressInterval) clearInterval(progressInterval);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API请求失败: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      
      // 更新进度为100%
      if (setProgress) setProgress(100);
      
      // 返回处理结果
      return {
        fileName: file.name,
        fileUrl: URL.createObjectURL(file),
        fileData: file,
        reportText: data.report
      };
    } catch (error) {
      // 清除进度更新
      if (progressInterval) clearInterval(progressInterval);
      
      throw error;
    }
  };
  
  // 处理文件选择和报告生成 - 类似于Divide页面的handleFileSelect
  const handleFileSelect = async (files) => {
    if (!files || files.length === 0) return;
    
    // 支持的文件扩展名
    const ALLOWED_EXTENSIONS = ['.svs', '.tif', '.tiff', '.ndpi', '.mrxs', '.vsi'];
    
    // 过滤出有效的病理WSI格式文件
    const imageFiles = Array.from(files).filter(file => {
      // 检查文件扩展名
      const fileName = file.name.toLowerCase();
      const hasValidExtension = ALLOWED_EXTENSIONS.some(ext => fileName.endsWith(ext));
      
      // 检查文件大小
      const isValidSize = file.size <= MAX_FILE_SIZE;
      
      return hasValidExtension && isValidSize;
    });
    
    if (imageFiles.length === 0) {
      message.error('请选择有效的病理WSI格式文件 (SVS, TIFF, NDPI, MRXS, VSI), 大小不超过1GB');
      return;
    }
    
    message.loading(`正在上传 ${imageFiles.length} 个文件...`, 0);
    
    try {
      // 重置报告状态
      setReportData(prev => ({
        ...prev,
        generated: false,
        generating: true
      }));
      setGeneratingReport(true);
      setGenerateProgress(0);
      
      message.destroy();
      message.loading('正在生成分析报告...', 0);
      
      // 处理第一个文件（为简化演示，只处理一个文件）
      const results = await generateReportFromImage(imageFiles[0], setGenerateProgress);
      
      message.destroy();
      
      // 更新文件列表
      const mockFileData = {
        uid: Date.now(),
        name: results.fileName,
        status: 'done',
        url: results.fileUrl,
        thumbUrl: results.fileUrl,
        uploadTime: new Date().toLocaleString('zh-CN'),
        file: results.fileData
      };
      
      setUploadedFiles([mockFileData]);
      
      // 处理报告数据
      processReportData(results, [mockFileData]);
      
      message.success('报告生成成功！');
    } catch (error) {
      message.destroy();
      message.error(`处理过程中发生错误: ${error.message}`);
      console.error('报告生成错误:', error);
    } finally {
      setGeneratingReport(false);
      setReportData(prev => ({ ...prev, generating: false }));
    }
  };
  
  // 重新上传
  const handleReupload = () => {
    setUploadedFiles([]);
    setReportData({
      generated: false,
      generating: false,
      generatedTime: '',
      imageInfo: [],
      finalDiagnosis: '',
      microscopicFindings: '',
      criticalFindings: ''
    });
    openUploadModal();
  };
  
  // 删除文件
  const handleRemove = (file) => {
    setUploadedFiles(prevFiles => prevFiles.filter(item => item.uid !== file.uid));
    
    if (uploadedFiles.length <= 1) {
      setReportData({
        generated: false,
        generating: false,
        generatedTime: '',
        imageInfo: [],
        finalDiagnosis: '',
        microscopicFindings: '',
        criticalFindings: ''
      });
    }
    
    message.success(`${file.name} 已删除`);
    return true;
  };
  
  // 预览图片
  const handlePreview = (file) => {
    setPreviewImage(file.url || file.thumbUrl);
    setPreviewVisible(true);
    return false;
  };
  
  // 处理API返回的报告数据
  const processReportData = (results, fileList = []) => {
    const now = new Date();
    
    // 解析报告文本，提取三个核心字段
    const reportText = results.reportText;
    
    // 解析三个主要字段
    const finalDiagnosis = reportText.match(/final diagnosis:(.*?)(?:\n|$)/i)?.[1]?.trim() || '未找到诊断结果';
    const microscopicFindings = reportText.match(/Microscopic findings:(.*?)(?:\n|$)/i)?.[1]?.trim() || '未找到显微镜检查结果';
    const criticalFindings = reportText.match(/Critical findings:(.*?)(?:\n|$)/i)?.[1]?.trim() || '未找到关键发现';
    
    setReportData(prev => ({
      ...prev,
      generated: true,
      generating: false,
      imageInfo: fileList.map(file => ({
        uid: file.uid,
        name: file.name,
        url: file.url || file.thumbUrl,
        uploadTime: file.uploadTime || now.toLocaleString('zh-CN')})),
      finalDiagnosis,
      microscopicFindings,
      criticalFindings,
      generatedTime: now.toLocaleString('zh-CN')
    }));
    
    // 生成完成后隐藏进度提示
    setShowProgressTip(false);
    setGenerateProgress(0);
    
    // 显示成功消息
    message.success('报告生成成功');
    
    // 滚动到报告顶部并高亮核心结论
    setTimeout(() => {
      if (reportRef.current) {
        reportRef.current.scrollTop = 0;
      }
      
      // 高亮核心结论模块1秒
      setShowHighlight(true);
      setTimeout(() => {
        setShowHighlight(false);
      }, 1000);
    }, 200);
  };
  
  // 导出PDF功能
  const handleExportPDF = () => {
    try {
      message.loading('正在生成PDF...', 0.5);
      
      // 模拟PDF生成过程
      setTimeout(() => {
        message.success('报告已导出为PDF');
      }, 500);
    } catch (error) {
      console.error('PDF导出失败:', error);
      message.error('PDF导出失败，请重试');
    }
  };
  
  // 复制结论功能
  const handleCopyConclusion = () => {
    try {
      const textToCopy = reportData.coreConclusions?.join('\n') || '';
      
      if (!textToCopy) {
        message.warning('没有可复制的结论内容');
        return;
      }
      
      navigator.clipboard.writeText(textToCopy)
        .then(() => message.success('结论已复制到剪贴板'))
        .catch(() => {
          // 降级方案：使用旧的复制方法
          const textArea = document.createElement('textarea');
          textArea.value = textToCopy;
          textArea.style.position = 'fixed';
          textArea.style.left = '-9999px';
          document.body.appendChild(textArea);
          textArea.select();
          
          try {
            document.execCommand('copy');
            message.success('结论已复制到剪贴板');
          } catch (err) {
            message.error('复制失败，请手动复制');
          }
          
          document.body.removeChild(textArea);
        });
    } catch (error) {
      console.error('复制失败:', error);
      message.error('复制失败，请重试');
    }
  };
  
  // 查看示例病理图
  const handleViewExample = () => {
    setExampleModalVisible(true);
  };
  
  const handleCloseExampleModal = () => {
    setExampleModalVisible(false);
  };
  
  const handleExampleImageClick = (example) => {
    setPreviewImage(example.src);
    setPreviewVisible(true);
    setExampleModalVisible(false);
  };
  
  // 统一的重置报告函数
  const resetReport = () => {
    setReportData({
      generated: false,
      generating: false,
      generatedTime: '',
      imageInfo: [],
      analysisDescription: '',
      coreConclusions: []
    });
    setUploadedFiles([]);
    setGenerateProgress(0);
  };
  
  // 打开上传方式选择弹窗
  const openUploadModal = () => {
    setUploadModalVisible(true);
  };
  
  // 关闭上传方式选择弹窗
  const closeUploadModal = () => {
    setUploadModalVisible(false);
  };
  
  // 处理文件上传 - 类似于Divide页面的实现
  const handleFileUpload = () => {
    if (reportData.generating) return;
    
    closeUploadModal();
    
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.svs,.tif,.tiff,.ndpi,.mrxs,.vsi';
    input.onchange = (e) => {
      handleFileSelect(e.target.files);
    };
    input.click();
  };
  
  // 处理文件夹上传
  const handleFolderUpload = () => {
    message.info('暂不支持文件夹上传');
    closeUploadModal();
  };
  
  // 上传组件的props配置 - 类似于Divide页面的实现
  const uploadProps = {
    beforeUpload: () => false, // 禁用默认上传逻辑
    showUploadList: false, // 隐藏上传列表
    multiple: true,
    withCredentials: false,
    onDrop(e) {
      console.log('Dropped files', e.dataTransfer.files);
    },
    onChange: () => {} // 由于我们使用自定义上传，这里留空
  };
  
  // 监听滚动事件，实现高亮效果
  useEffect(() => {
    const handleScroll = () => {
      if (reportRef.current && reportData.generated) {
        setShowHighlight(true);
        
        const timer = setTimeout(() => {
          setShowHighlight(false);
        }, 3000);
        
        return () => clearTimeout(timer);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [reportData.generated]);
  
  // 医疗主题配色方案 - 增强视觉层次
  const MEDICAL_THEME = {
    // 主色调
    primary: themeColors.colorPrimary || '#165DFF',
    primaryLight: themeColors.colorPrimaryLight || '#E8F3FF',
    primaryHover: themeColors.colorPrimaryHover || '#0E4AD9',
    
    // 辅助色
    secondary: themeColors.colorInfo || '#36CFC9',
    accent: themeColors.gradientColors?.accent || 'rgba(59, 130, 246, 0.15)',
    
    // 背景色 (与Divide界面保持一致)
    background: themeColors.colorBgBase || '#2c2c2c',
    backgroundSecondary: themeColors.colorBgSecondary || '#1e1e1e',
    backgroundTertiary: themeColors.colorBgTertiary || '#1e1e1e',
    backgroundDark: themeColors.colorBgDark || '#1E293B',
    
    // 边框色 (与Divide界面保持一致)
    border: themeColors.colorBorder || '#3a3a3a',
    borderLight: themeColors.colorBorderSecondary || '#4B5563',
    borderDark: themeColors.colorBorderDark || '#334155',
    
    // 文本色 (与Divide界面保持一致)
    text: themeColors.colorTextBase || '#FFFFFF',
    textSecondary: themeColors.colorTextSecondary || '#cccccc',
    textTertiary: themeColors.colorTextTertiary || '#9CA3AF',
    
    // 状态色
    success: themeColors.colorSuccess || '#52C41A',
    warning: themeColors.colorWarning || '#FAAD14',
    error: themeColors.colorError || '#FF4D4F',
    info: themeColors.colorInfo || '#165DFF',
    
    // 阴影
    boxShadowSmall: '0 2px 4px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.1)',
    boxShadowMedium: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    boxShadowLarge: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    
    // 渐变
    gradientPrimary: `linear-gradient(135deg, ${themeColors.colorPrimary || '#165DFF'} 0%, ${themeColors.colorPrimaryHover || '#0E4AD9'} 100%)`,
    gradientSecondary: `linear-gradient(135deg, ${themeColors.colorInfo || '#36CFC9'} 0%, #20B2AA 100%)`
  };
  
  // 统一的卡片样式
  const cardStyle = {
    width: '100%',
    borderRadius: 16,
    border: '1px solid rgba(14, 165, 233, 0.3)',
    background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9), rgba(30, 41, 59, 0.85))',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), 0 0 20px rgba(14, 165, 233, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
    minHeight: '350px',
    display: 'flex',
    flexDirection: 'column',
    margin: 0,
    transition: 'all 0.3s ease-in-out',
    padding: 0,
    overflow: 'hidden',
    transition: 'all 0.3s ease-in-out'
  };

  return (
    <div className="report-container" style={{
      position: 'relative',
      width: '100vw',
      minHeight: '100vh',
      padding: '24px',
      // 使用与主页一致的渐变背景
      background: 'linear-gradient(135deg, #0f172a 0%, #0c4a6e 50%, #0f172a 100%)',
      backgroundImage: 'radial-gradient(circle at 20% 30%, rgba(14, 165, 233, 0.2) 0%, transparent 40%), radial-gradient(circle at 80% 70%, rgba(2, 132, 199, 0.2) 0%, transparent 40%)',
      color: '#ffffff',
      overflow: 'hidden',
      fontFamily: 'Arial, sans-serif'
    }}>
      {/* 装饰性光线效果 - 增强视觉层次 */}
      <div style={{
        position: 'absolute',
        top: '-30%',
        right: '-10%',
        width: '70%',
        height: '150%',
        background: 'radial-gradient(circle, rgba(22, 93, 255, 0.08) 0%, transparent 70%)',
        filter: 'blur(80px)',
        transform: 'rotate(30deg)',
        pointerEvents: 'none',
        zIndex: 0
      }} />
      
      <div style={{
        position: 'absolute',
        bottom: '-30%',
        left: '-10%',
        width: '70%',
        height: '150%',
        background: 'radial-gradient(circle, rgba(54, 207, 201, 0.08) 0%, transparent 70%)',
        filter: 'blur(80px)',
        transform: 'rotate(-30deg)',
        pointerEvents: 'none',
        zIndex: 0
      }} />
      
      <div className="report-main-content" style={{
        position: 'relative',
        zIndex: 1,
        display: 'flex',
        gap: '24px',
        marginTop: '16px',
        width: '100%',
        height: 'calc(100vh - 80px)',
        overflow: 'hidden'
      }}>
        {/* 左侧上传区域 */}
        <div className="report-left-column" style={{
          flex: '0 0 38%',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          background: 'linear-gradient(135deg, rgba(30, 27, 75, 0.8), rgba(67, 56, 202, 0.7))',
          borderRadius: '20px',
          padding: '28px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), 0 0 10px rgba(14, 165, 233, 0.2)',
          border: '1px solid rgba(14, 165, 233, 0.3)',
          transition: 'all 0.3s ease-in-out',
          overflow: 'auto',
          backdropFilter: 'blur(10px)'
        }}>
          <h2 style={{
            fontSize: 20,
            fontWeight: 600,
            color: '#ffffff',
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            paddingBottom: '16px',
            borderBottom: '1px solid rgba(139, 92, 246, 0.3)'
          }}>
            <FileTextOutlined style={{ color: '#8b5cf6', fontSize: 22 }} /> 
            病理图片上传区
          </h2>
          
          <div className="report-upload-section">
            {/* 上传容器 */}            <Upload.Dragger
              {...uploadProps}
              disabled={reportData.generating}
              className="report-upload-dragger"
              style={{
                width: '100%',
                height: '300px',
                border: '2px dashed rgba(139, 92, 246, 0.5)',
                background: 'linear-gradient(135deg, rgba(49, 46, 129, 0.7), rgba(79, 70, 229, 0.6))',
                borderRadius: '16px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '40px',
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'hidden'
              }}
              onDragOver={(e) => {
                e.preventDefault();
                document.querySelector('.report-upload-dragger').style.borderColor = '#8b5cf6';
                document.querySelector('.report-upload-dragger').style.background = 'linear-gradient(135deg, rgba(67, 56, 202, 0.8), rgba(139, 92, 246, 0.7))';
              }}
              onDragLeave={() => {
                document.querySelector('.report-upload-dragger').style.borderColor = 'rgba(139, 92, 246, 0.5)';
                document.querySelector('.report-upload-dragger').style.background = 'linear-gradient(135deg, rgba(49, 46, 129, 0.7), rgba(79, 70, 229, 0.6))';
              }}
            >
              {uploadedFiles.length === 0 ? (
                <div style={{ textAlign: 'center', zIndex: 1, cursor: 'pointer' }} onClick={openUploadModal}>
                  <div style={{
                    width: '80px',
                    height: '50px',
                    borderRadius: '50%',
                    background: 'rgba(139, 92, 246, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 20px',
                    boxShadow: '0 0 20px rgba(139, 92, 246, 0.3)'
                  }}>
                    <UploadOutlined style={{ fontSize: 36, color: '#8b5cf6' }} />
                  </div>
                  <p className="ant-upload-text report-upload-text" style={{
                      fontSize: 16,
                      color: '#ffffff',
                      fontWeight: 600,
                      margin: '0 0 8px 0',
                      textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
                    }}>
                      拖拽病理图片至此处上传
                    </p>
                    <p className="ant-upload-hint report-upload-hint" style={{
                      fontSize: 14,
                      boxShadow: '0 2px 8px rgba(6, 182, 212, 0.4)',
                      color: '#e9d5ff',
                      margin: '0 0 24px 0',
                      opacity: 0.9
                    }}>
                      支持WSI上传，自动生成分析报告
                    </p>
                  
                  {/* 操作按钮 */}
                  <div className="report-button-group" style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                    <Button 
                      type="primary"
                      icon={<FileTextOutlined />} 
                      className="report-action-button"
                      onClick={(e) => {
                        e.stopPropagation(); // 阻止事件冒泡
                        handleFileUpload(); // 使用统一的文件上传处理函数
                      }}
                      style={{
                        background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                        borderColor: '#8b5cf6',
                        color: 'white',
                        borderRadius: '8px',
                        padding: '8px 20px',
                        fontWeight: 500,
                        transition: 'all 0.2s ease',
                        boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
                          borderColor: '#7c3aed',
                          boxShadow: '0 6px 16px rgba(139, 92, 246, 0.4)'
                        }
                      }}
                    >
                      选择文件
                    </Button>
                    <Button 
                      icon={<FolderOutlined />} 
                      className="report-action-button"
                      onClick={(e) => {
                        e.stopPropagation(); // 阻止事件冒泡
                        message.info('暂不支持文件夹上传');
                      }}
                      style={{
                        backgroundColor: MEDICAL_THEME.background,
                        borderColor: MEDICAL_THEME.border,
                        color: MEDICAL_THEME.text,
                        borderRadius: '8px',
                        padding: '8px 20px',
                        fontWeight: 500,
                        transition: 'all 0.2s ease'
                      }}
                    >
                      上传文件夹
                    </Button>
                  </div>
                </div>
              ) : (
                <div style={{ width: '100%', height: '100%', overflowY: 'auto', padding: '10px' }}>
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', 
                    gap: '16px',
                    marginBottom: '16px'
                  }}>
                    {uploadedFiles.map(file => (
                      <div 
                        key={file.uid} 
                        style={{
                          borderRadius: '12px',
                          overflow: 'hidden',
                          border: `1px solid ${MEDICAL_THEME.border}`,
                          backgroundColor: MEDICAL_THEME.background,
                          position: 'relative',
                          transition: 'all 0.2s ease',
                          boxShadow: MEDICAL_THEME.boxShadowSmall
                        }}
                        className="uploaded-file-item"
                      >
                        <img 
                          src={file.url || file.thumbUrl} 
                          alt={file.name} 
                          style={{
                            width: '100%',
                            height: '100px',
                            objectFit: 'cover'
                          }}
                        />
                        <div className="report-image-actions" style={{
                          position: 'absolute',
                          top: '8px',
                          right: '8px',
                          display: 'flex',
                          gap: '6px'
                        }}>
                          <Button 
                            size="small" 
                            icon={<EyeOutlined />}
                            onClick={() => handlePreview(file)}
                            className="report-preview-button"
                            style={{ 
                              backgroundColor: 'rgba(255, 255, 255, 0.9)', 
                              border: 'none',
                              width: '28px',
                              height: '28px',
                              borderRadius: '4px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              padding: 0
                            }}
                          />
                          <Button 
                            size="small" 
                            icon={<DeleteOutlined />}
                            onClick={() => handleRemove(file)}
                            danger
                            style={{ 
                              backgroundColor: 'rgba(255, 77, 79, 0.9)', 
                              border: 'none',
                              color: 'white',
                              width: '28px',
                              height: '28px',
                              borderRadius: '4px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              padding: 0
                            }}
                          />
                        </div>
                        <div style={{
                          padding: '8px',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}>
                          <p className="report-file-name" style={{
                            fontSize: 12,
                            color: MEDICAL_THEME.text,
                            margin: 0,
                            fontWeight: 500
                          }}>
                            {file.name}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Upload.Dragger>
            
            {/* 文件提示 */}
            <div className="report-file-tip" style={{
              fontSize: '13px',
              color: '#e9d5ff',
              marginTop: '16px',
              textAlign: 'center',
              padding: '12px',
              backgroundColor: 'rgba(49, 46, 129, 0.6)',
              borderRadius: '8px',
              border: '1px solid rgba(139, 92, 246, 0.3)'
            }}>
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <FileTextOutlined style={{ fontSize: 14 }} />
            
              </span>
            </div>
            
           
          </div>
        </div>
        
        {/* 上传方式选择弹窗 */}
        <Modal
          title="选择上传方式"
          open={uploadModalVisible}
          onCancel={closeUploadModal}
          footer={null}
          width={420}
          centered
          style={{ borderRadius: '16px' }}
          modalStyle={{ borderRadius: '16px' }}
        >
          <div className="report-upload-modal-content" style={{ padding: '24px' }}>
            <Button 
              type="primary" 
              size="large"
              icon={<FileTextOutlined />}
              onClick={handleFileUpload}
              className="report-upload-modal-button"
              style={{ 
                width: '100%', 
                marginBottom: 20,
                background: MEDICAL_THEME.gradientPrimary,
                borderColor: MEDICAL_THEME.primary,
                color: '#ffffff',
                borderRadius: '10px',
                padding: '12px',
                fontWeight: 500,
                fontSize: 16
              }}
            >
              上传病理WSI格式文件
            </Button>
            <p className="report-upload-modal-tip" style={{
              fontSize: 14,
              color: MEDICAL_THEME.textSecondary,
              textAlign: 'center',
              marginBottom: 24
            }}>
              支持 .jpg, .jpeg, .png, .tiff 格式图片，单文件最大50MB
            </p>
            
            <Button 
              size="large"
              icon={<FolderOutlined />}
              onClick={handleFolderUpload}
              className="report-upload-modal-button"
              style={{ 
                width: '100%',
                backgroundColor: MEDICAL_THEME.background,
                borderColor: MEDICAL_THEME.border,
                color: MEDICAL_THEME.text,
                borderRadius: '10px',
                padding: '12px',
                fontWeight: 500,
                fontSize: 16
              }}
            >
              上传整个文件夹
            </Button>
            <p className="report-upload-modal-tip" style={{
              fontSize: 14,
              color: MEDICAL_THEME.textSecondary,
              textAlign: 'center',
              marginTop: 12
            }}>
              自动识别文件夹中的所有病理WSI格式文件（功能开发中）
            </p>
          </div>
        </Modal>
        
        {/* 示例病理图弹窗 */}
        <Modal
          title="示例病理图"
          open={exampleModalVisible}
          onCancel={handleCloseExampleModal}
          footer={null}
          width={860}
          centered
        >
          <div style={{ maxHeight: '70vh', overflowY: 'auto', padding: '10px' }}>
            <p style={{ 
              fontSize: 14, 
              color: MEDICAL_THEME.textSecondary, 
              margin: '0 0 20px 0',
              padding: '12px',
              backgroundColor: MEDICAL_THEME.backgroundTertiary,
              borderRadius: '8px'
            }}>
              点击下方病理图查看大图，可作为参考样例上传分析
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
              {exampleImages.map((example) => (
                <div 
                  key={example.id} 
                  style={{
                    padding: '16px',
                    border: `1px solid ${MEDICAL_THEME.borderLight}`,
                    borderRadius: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    backgroundColor: MEDICAL_THEME.background,
                    boxShadow: MEDICAL_THEME.boxShadowSmall
                  }}
                  onClick={() => handleExampleImageClick(example)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = MEDICAL_THEME.boxShadowMedium;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = MEDICAL_THEME.boxShadowSmall;
                  }}
                >
                  <div style={{ position: 'relative', marginBottom: '12px', borderRadius: '8px', overflow: 'hidden' }}>
                    <img 
                      src={example.src} 
                      alt={example.name} 
                      style={{ 
                        width: '100%', 
                        height: '180px', 
                        borderRadius: '8px', 
                        objectFit: 'cover',
                        border: `1px solid ${MEDICAL_THEME.borderLight}`
                      }}
                    />
                    <div style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      backgroundColor: 'rgba(0, 0, 0, 0.7)',
                      color: 'white',
                      padding: '8px 12px',
                      fontSize: 13,
                      borderRadius: '0 0 8px 8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <EyeOutlined /> 点击查看大图
                    </div>
                  </div>
                  <h4 style={{ 
                    margin: '0 0 8px 0', 
                    fontSize: 16, 
                    color: MEDICAL_THEME.text, 
                    fontWeight: 600 
                  }}>
                    {example.name}
                  </h4>
                  <p style={{ 
                    margin: 0, 
                    fontSize: 14, 
                    color: MEDICAL_THEME.textSecondary, 
                    lineHeight: 1.6 
                  }}>
                    {example.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Modal>
        
        {/* 图片预览弹窗 */}
        <Modal
          open={previewVisible}
          title="病理图片预览"
          footer={null}
          onCancel={() => setPreviewVisible(false)}
          width="80%"
          centered
        >
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            padding: '10px',
            backgroundColor: 'rgba(0, 0, 0, 0.05)'
          }}>
            <img 
              src={previewImage} 
              alt="病理图片预览" 
              style={{ 
                maxWidth: '100%', 
                maxHeight: '80vh', 
                borderRadius: '8px',
                boxShadow: MEDICAL_THEME.boxShadowLarge
              }} 
            />
          </div>
        </Modal>
        
        {/* 右侧：报告展示区域 */}
        <div ref={reportRef} className="report-right-column" style={{
          flex: '0 0 62%',
          display: 'flex',
          flexDirection: 'column',
          background: 'linear-gradient(135deg, rgba(14, 58, 74, 0.8), rgba(8, 145, 178, 0.7))',
          borderRadius: '20px',
          padding: '28px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), 0 0 10px rgba(14, 165, 233, 0.2)',
          border: '1px solid rgba(14, 165, 233, 0.3)',
          transition: 'all 0.3s ease-in-out',
          overflow: 'hidden',
          backdropFilter: 'blur(10px)'
        }}>
          <Card style={cardStyle} styles={{ body: { padding: 0, margin: 0 } }}>
            <div className="report-card-header" style={{
              padding: '24px',
              borderBottom: '1px solid rgba(6, 182, 212, 0.3)',
              background: 'linear-gradient(135deg, rgba(14, 58, 74, 0.95), rgba(8, 145, 178, 0.9))',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px',
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <h2 style={{
                fontSize: 20,
                fontWeight: 600,
                color: '#ffffff',
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <FileSearchOutlined style={{ color: '#06b6d4', fontSize: 22 }} /> 
                AI 肾病分析报告区
              </h2>
              
              {reportData.generated && (
                <div className="report-action-buttons" style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '12px',
                  flexWrap: 'wrap'
                }}>
                  <Button 
                    size="middle" 
                    type="primary" 
                    icon={<FilePdfOutlined />}
                    onClick={handleExportPDF}
                    className="report-export-button"
                    style={{
                      background: 'linear-gradient(135deg, #06b6d4, #0e7490)',
                      borderColor: '#06b6d4',
                      borderRadius: '8px',
                      fontWeight: 600,
                      boxShadow: '0 4px 12px rgba(6, 182, 212, 0.3)'
                    }}
                  >
                    导出 PDF
                  </Button>
                  <Button 
                    size="middle" 
                    icon={<CopyOutlined />}
                    onClick={handleCopyConclusion}
                    style={{
                      color: '#06b6d4',
                      borderColor: '#06b6d4',
                      borderRadius: '8px',
                      fontWeight: 600
                    }}
                  >
                    复制结论
                  </Button>
                  <div className="report-generated-time" style={{
                    fontSize: 12,
                    color: '#5eead4',
                    padding: '8px 12px',
                    backgroundColor: 'rgba(8, 145, 178, 0.2)',
                    borderRadius: '6px',
                    whiteSpace: 'nowrap',
                    border: '1px solid rgba(6, 182, 212, 0.3)'
                  }}>
                    生成时间: {reportData.generatedTime}
                  </div>
                </div>
              )}
            </div>
            
            <div className="report-card-content" style={{
              padding: '24px',
              flex: 1,
              overflowY: 'auto',
              background: 'linear-gradient(180deg, rgba(14, 58, 74, 0.85), rgba(8, 145, 178, 0.8))',
              color: '#ffffff',
              backgroundImage: 'linear-gradient(rgba(6, 182, 212, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(6, 182, 212, 0.1) 1px, transparent 1px)',
              backgroundSize: '20px 20px',
              border: '1px solid rgba(6, 182, 212, 0.2)'
            }}>
              {/* 空状态 */}
              {!reportData.generated && !reportData.generating ? (
                <div className="report-empty-state" style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  textAlign: 'center',
                  color: '#22d3ee',
                  padding: '40px 20px',
                  backgroundColor: 'rgba(8, 145, 178, 0.2)',
                  borderRadius: '16px',
                  border: '1px dashed rgba(6, 182, 212, 0.5)',
                  textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
                }}>
                  <div style={{
                    width: '120px',
                    height: '120px',
                    borderRadius: '50%',
                    background: 'rgba(6, 182, 212, 0.2)',
                    display: 'flex',
                    boxShadow: '0 0 20px rgba(6, 182, 212, 0.3)',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 24px',
                    position: 'relative',
                    border: '2px solid rgba(6, 182, 212, 0.3)'
                  }}>
                    <FileSearchOutlined style={{ color: '#06b6d4', fontSize: 48 }} />
                    <div style={{
                      position: 'absolute',
                      bottom: '10px',
                      right: '10px',
                      width: '30px',
                      height: '30px',
                      borderRadius: '50%',
                      background: '#06b6d4',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 14
                    }}>
                      AI
                    </div>
                  </div>
                  
                  <p style={{ 
                    marginBottom: '16px', 
                    fontSize: 18, 
                    fontWeight: 600, 
                    color: '#22d3ee',
                    letterSpacing: 0.3,
                    textShadow: '0 1px 3px rgba(0, 0, 0, 0.4)'
                  }}>请先上传病理WSI格式文件生成报告</p>
                  
                  <p style={{ 
                    marginBottom: '32px', 
                    fontSize: 14, 
                    color: '#5eead4',
                    opacity: 0.9,
                    maxWidth: '500px'
                  }}>
                    上传病理WSI格式文件，AI将自动分析并生成专业的肾病诊断报告，包含病理特征描述和核心结论
                  </p>
                  
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '24px',
                    padding: '24px',
                    backgroundColor: 'rgba(15, 23, 42, 0.7)',
                    borderRadius: '12px',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), 0 0 10px rgba(14, 165, 233, 0.2)',
                    marginBottom: '16px',
                    border: '1px solid rgba(14, 165, 233, 0.3)'
                  }}>
                    {/* 上传步骤 */}
                    <div style={{ textAlign: 'center' }}>
                      <div style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(14, 165, 233, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 12px',
                        border: '2px solid #0ea5e9',
                        boxShadow: '0 0 15px rgba(14, 165, 233, 0.5)',
                        transition: 'all 0.3s ease'
                      }} className="workflow-step-icon">
                        <FileTextOutlined style={{ color: MEDICAL_THEME.primary, fontSize: 24 }} />
                      </div>
                      <p style={{ 
                        fontSize: 14, 
                        color: '#ffffff', 
                        fontWeight: 500,
                        margin: 0
                      }}>上传图片</p>
                    </div>
                    
                    <ArrowRightOutlined style={{ 
                      color: '#0ea5e9', 
                      fontSize: 20,
                      fontWeight: 600,
                      opacity: 0.8
                    }} />
                    
                    {/* 分析步骤 */}
                    <div style={{ textAlign: 'center' }}>
                      <div style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(14, 165, 233, 0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 12px',
                        border: '2px solid rgba(14, 165, 233, 0.5)',
                        boxShadow: '0 0 10px rgba(14, 165, 233, 0.3)',
                        transition: 'all 0.3s ease'
                      }} className="workflow-step-icon">
                        <LoadingOutlined style={{ color: '#0ea5e9', fontSize: 24 }} />
                      </div>
                      <p style={{ 
                        fontSize: 14, 
                        color: '#ffffff', 
                        fontWeight: 500,
                        margin: 0
                      }}>AI分析</p>
                    </div>
                    
                    <ArrowRightOutlined style={{ 
                      color: '#0ea5e9', 
                      fontSize: 20,
                      fontWeight: 600,
                      opacity: 0.8
                    }} />
                    
                    {/* 查看步骤 */}
                    <div style={{ textAlign: 'center' }}>
                      <div style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(14, 165, 233, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 12px',
                        border: '2px solid rgba(14, 165, 233, 0.4)',
                        boxShadow: '0 0 8px rgba(14, 165, 233, 0.2)',
                        transition: 'all 0.3s ease'
                      }} className="workflow-step-icon">
                        <FileSearchOutlined style={{ color: '#0ea5e9', fontSize: 24 }} />
                      </div>
                      <p style={{ 
                        fontSize: 14, 
                        color: '#ffffff', 
                        fontWeight: 500,
                        margin: 0
                      }}>查看报告</p>
                    </div>
                  </div>
                </div>
              ) : 
              
              /* 生成中状态 */
              reportData.generating ? (
                <div className="report-generating-state" style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '400px',
                  padding: '20px'
                }}>
                  <div style={{ 
                    width: '100px', 
                    height: '100px',
                    marginBottom: '24px',
                    position: 'relative'
                  }}>
                    <Spin 
                      size="large" 
                      spinning={true} 
                      indicator={
                        <LoadingOutlined 
                          className="report-generating-icon" 
                          spin 
                          style={{ fontSize: 56, color: MEDICAL_THEME.primary }}
                        />
                      }
                    />
                  </div>
                  <p className="report-generating-text" style={{
                    fontSize: 16,
                    color: MEDICAL_THEME.text,
                    marginBottom: '16px',
                    fontWeight: 500
                  }}>
                    正在分析病理图片特征
                  </p>
                  <p className="report-generating-subtext" style={{
                    fontSize: 14,
                    color: MEDICAL_THEME.textSecondary,
                    marginBottom: '24px'
                  }}>
                    AI正在识别肾小球结构、系膜细胞增生等关键特征
                  </p>
                  
                  <div style={{ width: '100%', maxWidth: '400px' }}>
                    <Progress 
                      percent={generateProgress} 
                      status="active" 
                      strokeColor={MEDICAL_THEME.primary}
                      strokeWidth={8}
                      borderRadius={4}
                    />
                    <p style={{ 
                      fontSize: 12, 
                      color: MEDICAL_THEME.textSecondary, 
                      textAlign: 'center', 
                      marginTop: '8px' 
                    }}>
                      预计剩余时间: {Math.floor((100 - generateProgress) * 0.04)} 秒
                    </p>
                  </div>
                </div>
              ) : 
              
              /* 生成完成状态 */
              (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {/* 病理图像信息 */}
                  <div className="report-module" style={{
                    borderRadius: '12px',
                    border: `1px solid ${MEDICAL_THEME.borderLight}`,
                    overflow: 'hidden',
                    backgroundColor: MEDICAL_THEME.background,
                    boxShadow: MEDICAL_THEME.boxShadowSmall,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      boxShadow: MEDICAL_THEME.boxShadowMedium
                    }
                  }}>
                    <div className="report-module-header" style={{
                      backgroundColor: MEDICAL_THEME.backgroundTertiary,
                      padding: '16px 20px',
                      borderBottom: `1px solid ${MEDICAL_THEME.borderLight}`,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px'
                    }}>
                      <FileTextOutlined style={{ color: MEDICAL_THEME.primary, fontSize: 18 }} />
                      <h3 className="report-module-title" style={{
                        fontSize: '16px',
                        fontWeight: '600',
                        color: MEDICAL_THEME.text,
                        margin: 0
                      }}>病理图像信息</h3>
                    </div>
                    <div className="report-module-content" style={{
                      padding: '20px',
                      backgroundColor: MEDICAL_THEME.background
                    }}>
                      <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
                        gap: '16px' 
                      }}>
                        {reportData.imageInfo.map((image, index) => (
                          <div key={index} style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '12px',
                            padding: '12px',
                            borderRadius: '8px',
                            backgroundColor: MEDICAL_THEME.backgroundTertiary
                          }}>
                            <img 
                              src={image.url} 
                              alt={`病理图片 ${index + 1}`} 
                              style={{
                                width: '60px',
                                height: '60px',
                                objectFit: 'cover',
                                borderRadius: '6px',
                                border: `1px solid ${MEDICAL_THEME.borderLight}`,
                                boxShadow: MEDICAL_THEME.boxShadowSmall
                              }}
                            />
                            <div className="report-image-info">
                              <p className="report-image-name" style={{
                                margin: 0,
                                fontSize: 14,
                                fontWeight: 500,
                                color: MEDICAL_THEME.text,
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                              }}>{image.name}</p>
                              <p className="report-image-upload-time" style={{
                                margin: '4px 0 0 0',
                                fontSize: 12,
                                color: MEDICAL_THEME.textSecondary
                              }}>
                                上传时间: {image.uploadTime}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  {/* 最终诊断 */}
                  <div className="report-module" style={{
                    borderRadius: '12px',
                    border: `1px solid ${MEDICAL_THEME.borderLight}`,
                    overflow: 'hidden',
                    backgroundColor: MEDICAL_THEME.background,
                    boxShadow: MEDICAL_THEME.boxShadowSmall,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      boxShadow: MEDICAL_THEME.boxShadowMedium
                    }
                  }}>
                    <div className="report-module-header" style={{
                      backgroundColor: MEDICAL_THEME.backgroundTertiary,
                      padding: '16px 20px',
                      borderBottom: `1px solid ${MEDICAL_THEME.borderLight}`,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px'
                    }}>
                      <FileSearchOutlined style={{ color: MEDICAL_THEME.primary, fontSize: 18 }} />
                      <h3 className="report-module-title" style={{
                        fontSize: '16px',
                        fontWeight: '600',
                        color: MEDICAL_THEME.text,
                        margin: 0
                      }}>最终诊断</h3>
                    </div>
                    <div className="report-module-content" style={{
                      padding: '20px',
                      backgroundColor: MEDICAL_THEME.background
                    }}>
                      <p className="report-analysis-text" style={{
                        lineHeight: 1.8,
                        color: MEDICAL_THEME.text,
                        margin: 0,
                        fontSize: 14,
                        textAlign: 'justify'
                      }}>
                        {reportData.finalDiagnosis}
                      </p>
                    </div>
                  </div>
                  
                  {/* 显微镜检查结果 */}
                  <div className="report-module" style={{
                    borderRadius: '12px',
                    border: `1px solid ${MEDICAL_THEME.borderLight}`,
                    overflow: 'hidden',
                    backgroundColor: MEDICAL_THEME.background,
                    boxShadow: MEDICAL_THEME.boxShadowSmall,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      boxShadow: MEDICAL_THEME.boxShadowMedium
                    }
                  }}>
                    <div className="report-module-header" style={{
                      backgroundColor: MEDICAL_THEME.backgroundTertiary,
                      padding: '16px 20px',
                      borderBottom: `1px solid ${MEDICAL_THEME.borderLight}`,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px'
                    }}>
                      <FileSearchOutlined style={{ color: MEDICAL_THEME.primary, fontSize: 18 }} />
                      <h3 className="report-module-title" style={{
                        fontSize: '16px',
                        fontWeight: '600',
                        color: MEDICAL_THEME.text,
                        margin: 0
                      }}>显微镜检查结果</h3>
                    </div>
                    <div className="report-module-content" style={{
                      padding: '20px',
                      backgroundColor: MEDICAL_THEME.background
                    }}>
                      <p className="report-analysis-text" style={{
                        lineHeight: 1.8,
                        color: MEDICAL_THEME.text,
                        margin: 0,
                        fontSize: 14,
                        textAlign: 'justify'
                      }}>
                        {reportData.microscopicFindings}
                      </p>
                    </div>
                  </div>
                  
                  {/* 关键发现 */}
                  <div className="report-module" style={{
                    borderRadius: '12px',
                    border: `1px solid ${showHighlight ? MEDICAL_THEME.primary : MEDICAL_THEME.borderLight}`,
                    overflow: 'hidden',
                    backgroundColor: MEDICAL_THEME.background,
                    boxShadow: showHighlight ? `0 0 15px ${MEDICAL_THEME.primary}20` : MEDICAL_THEME.boxShadowSmall,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: MEDICAL_THEME.boxShadowMedium
                    }
                  }}>
                    <div className="report-module-header" style={{
                      background: MEDICAL_THEME.gradientPrimary,
                      padding: '16px 20px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px'
                    }}>
                      <FilePdfOutlined style={{ color: 'white', fontSize: 18 }} />
                      <h3 className="report-module-title" style={{
                        fontSize: '16px',
                        fontWeight: '600',
                        color: 'white',
                        margin: 0
                      }}>关键发现</h3>
                    </div>
                    <div className="report-module-content" style={{
                      padding: '20px',
                      backgroundColor: MEDICAL_THEME.background
                    }}>
                      <p className="report-analysis-text" style={{
                        lineHeight: 1.8,
                        color: MEDICAL_THEME.text,
                        margin: 0,
                        fontSize: 14,
                        textAlign: 'justify'
                      }}>
                        {reportData.criticalFindings}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="report-card-footer" style={{
              padding: '16px 24px',
              borderTop: '1px solid rgba(14, 165, 233, 0.3)',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px',
              background: 'rgba(15, 23, 42, 0.9)'
            }}>
              {reportData.generated && (
                <Button 
                  onClick={resetReport}
                  className="report-reset-button"
                  style={{
                    borderRadius: '8px',
                    fontWeight: 500,
                    background: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
                    border: 'none',
                    color: '#ffffff',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #0284c7, #0369a1)',
                      boxShadow: '0 4px 12px rgba(14, 165, 233, 0.4)'
                    }
                  }}
                >
                  重新生成报告
                </Button>
              )}
            </div>
          </Card>
        </div>
      </div>
      
      {/* 进度提示 */}
      {showProgressTip && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          backgroundColor: 'rgba(22, 93, 255, 0.95)',
          color: 'white',
          padding: '12px 20px',
          borderRadius: '8px',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          boxShadow: MEDICAL_THEME.boxShadowLarge
        }}>
          <LoadingOutlined spin style={{ fontSize: 16 }} />
          <span style={{ fontWeight: 500 }}>正在生成报告，请稍候...</span>
        </div>
      )}
    </div>
  );
};

export default ReportComponent;
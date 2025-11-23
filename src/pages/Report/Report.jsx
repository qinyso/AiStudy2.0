import './Report.css';
import React, { useState } from 'react';
import { FileTextOutlined, FolderOutlined, LoadingOutlined, DownloadOutlined, SaveOutlined, PrinterOutlined } from '@ant-design/icons';
import { message, Upload, Button, Modal, Card, Divider, Table, Empty } from 'antd';
const { Dragger } = Upload;
import { themeColors } from '../../theme';

// 从localStorage获取token
const getToken = () => {
  return localStorage.getItem('token');
};

// 自定义上传函数
const customUpload = async (files, setIsProcessing) => {
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
    uploadFormData.append('folder_name', 'report');
    
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
    
    // 显示加载动画 - 更新状态
    if (setIsProcessing) setIsProcessing(true);
    message.loading('正在生成报告...', 0);
    
    // Step 2: 生成报告
    const reportResponse = await fetch('/generate-report', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!reportResponse.ok) {
      throw new Error(`报告生成失败: ${reportResponse.status}`);
    }
    
    const reportResult = await reportResponse.json();
    message.destroy();
    
    return { 
      success: true, 
      data: {
        upload: uploadResult,
        report: reportResult
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
const handleFileSelect = async (files, handleReportUpdate, setIsProcessing) => {
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
      // 更新报告结果
      handleReportUpdate(uploadResult.data, imageFiles);
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
  withCredentials: false,
  onDrop(e) {
    console.log('Dropped files', e.dataTransfer.files);
  },
};

const ReportComponent = () => {
  // 状态管理
  const [reportData, setReportData] = useState({
    generated: false,
    patientInfo: {
      name: '',
      age: '',
      gender: '',
      hospital: '',
      department: '',
      doctor: ''
    },
    analysisSummary: {
      normalPercent: 0,
      abnormalPercent: 0,
      mainFindings: '',
      confidenceScore: 0
    },
    detailedFindings: [],
    recommendations: [],
    conclusion: '',
    generatedTime: '',
    uploadedFiles: []
  });
  
  // 上传方式选择弹窗状态
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  
  // 处理状态 - 控制加载动画
  const [isProcessing, setIsProcessing] = useState(false);
  
  // 模拟生成报告数据（用于演示）
  const mockGenerateReport = (files) => {
    const now = new Date();
    const mockReport = {
      generated: true,
      patientInfo: {
        name: '患者A',
        age: '45',
        gender: '男',
        hospital: '示例医院',
        department: '肾病科',
        doctor: '李医生'
      },
      analysisSummary: {
        normalPercent: 65,
        abnormalPercent: 35,
        mainFindings: '左肾下极见一大小约2.5cm×2.0cm的低回声区，边界欠清晰，内部回声不均匀，考虑为肾占位性病变。右肾实质回声均匀，肾盂未见明显扩张。',
        confidenceScore: 0.89
      },
      detailedFindings: files.map((file, index) => ({
        imageName: file.name,
        findings: index === 0 ? '左肾下极低回声区，考虑肿瘤可能性大' : '肾实质回声均匀，未见明显异常',
        confidence: index === 0 ? 0.89 : 0.95,
        regionDetails: index === 0 ? [
          { region: '左肾下极', type: '低回声区', size: '2.5cm×2.0cm', confidence: 0.92 }
        ] : []
      })),
      recommendations: [
        '建议进一步行CT增强扫描明确病变性质',
        '结合临床症状及肿瘤标志物检查',
        '必要时考虑穿刺活检以明确病理诊断',
        '定期随访，评估病变变化情况'
      ],
      conclusion: '根据AI辅助诊断分析，左肾占位性病变考虑为恶性肿瘤可能性大，建议临床进一步检查明确诊断并制定治疗方案。',
      generatedTime: now.toLocaleString('zh-CN'),
      uploadedFiles: files
    };
    return mockReport;
  };
  
  // 处理报告更新
  const handleReportUpdate = (results, files) => {
    // 由于是模拟环境，我们使用模拟数据
    const mockReport = mockGenerateReport(files);
    setReportData(mockReport);
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
      handleFileSelect(e.target.files, handleReportUpdate, setIsProcessing);
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
      handleFileSelect(e.target.files, handleReportUpdate, setIsProcessing);
    };
    input.click();
  };
  
  // 下载报告
  const downloadReport = () => {
    message.success('报告已下载');
    // 实际实现需要与后端交互生成PDF或其他格式的报告
  };
  
  // 保存报告
  const saveReport = () => {
    message.success('报告已保存');
    // 实际实现需要将报告数据保存到数据库
  };
  
  // 打印报告
  const printReport = () => {
    window.print();
  };
  
  // 重置页面
  const resetReport = () => {
    setReportData({
      generated: false,
      patientInfo: {},
      analysisSummary: {},
      detailedFindings: [],
      recommendations: [],
      conclusion: '',
      generatedTime: '',
      uploadedFiles: []
    });
  };
  
  // 表格列定义
  const findingsColumns = [
    {
      title: '图片名称',
      dataIndex: 'imageName',
      key: 'imageName',
      ellipsis: true,
      width: '25%'
    },
    {
      title: '主要发现',
      dataIndex: 'findings',
      key: 'findings',
      ellipsis: true
    },
    {
      title: '置信度',
      dataIndex: 'confidence',
      key: 'confidence',
      width: '15%',
      render: (confidence) => `${(confidence * 100).toFixed(1)}%`
    }
  ];
  
  // 样式定义
  const containerStyle = {
    marginTop: 40,
    padding: '0 20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    minHeight: '80vh',
    width: '100%',
  };
  
  const mainContentStyle = {
    display: 'flex',
    width: '100%',
    maxWidth: 1600,
    gap: 20,
    alignItems: 'flex-start',
    justifyContent: 'center',
    flexWrap: 'wrap'
  };
  
  const columnStyle = {
    width: '48%',
    maxWidth: 800,
    minWidth: 400,
    display: 'flex',
    flexDirection: 'column'
  };

  const draggerStyle = {
    width: '100%',
    borderRadius: 12,
    border: `2px dashed ${themeColors.colorBorder}`,
    background: 'rgba(15, 23, 42, 0.7)',
    minHeight: '350px',
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

  const cardStyle = {
    width: '100%',
    borderRadius: 12,
    border: `1px solid ${themeColors.colorBorder}`,
    background: 'rgba(15, 23, 42, 0.7)',
    boxShadow: themeColors.boxShadow.medium,
    minHeight: '350px',
    display: 'flex',
    flexDirection: 'column',
    margin: 0,
    padding: 0
  };

  const titleStyle = {
    fontSize: 24,
    fontWeight: 600,
    color: themeColors.colorPrimary,
    marginBottom: 20,
    textAlign: 'center',
  };

  const sectionTitleStyle = {
    fontSize: 18,
    fontWeight: 600,
    color: themeColors.colorPrimary,
    marginBottom: 15,
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  };
  
  const reportHeaderStyle = {
    padding: '20px',
    borderBottom: `1px solid ${themeColors.colorBorder}`,
    background: 'rgba(15, 23, 42, 0.9)'
  };
  
  const reportContentStyle = {
    padding: '20px',
    flex: 1,
    overflowY: 'auto'
  };
  
  const reportFooterStyle = {
    padding: '15px 20px',
    borderTop: `1px solid ${themeColors.colorBorder}`,
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 10,
    background: 'rgba(15, 23, 42, 0.9)'
  };
  
  const patientInfoItemStyle = {
    display: 'flex',
    marginBottom: '10px',
    alignItems: 'center'
  };
  
  const patientInfoLabelStyle = {
    width: '120px',
    fontWeight: 'bold',
    color: themeColors.colorTextSecondary
  };
  
  const patientInfoValueStyle = {
    color: themeColors.colorTextBase,
    flex: 1
  };
  
  return (
    <div style={containerStyle}>
      <h1 style={titleStyle}>AI肾病报告生成</h1>
      
      <div style={mainContentStyle}>
        {/* 左侧：上传区域 */}
        <div style={columnStyle}>
          <Dragger {...props} style={draggerStyle} onClick={openUploadModal} disabled={isProcessing}>
            <p className="ant-upload-drag-icon" style={{ fontSize: '48px', color: isProcessing ? themeColors.colorTextTertiary : themeColors.colorPrimary }}>
              {isProcessing ? <LoadingOutlined spin /> : <FileTextOutlined />}
            </p>
            <p className="ant-upload-text" style={{ color: themeColors.colorTextBase, fontSize: 18 }}>
              {isProcessing ? '正在生成报告...' : '点击选择上传方式'}
            </p>
            <p className="ant-upload-hint" style={{ color: themeColors.colorTextTertiary }}>
              {isProcessing ? '正在处理图片并生成报告，请稍候...' : '支持单个文件、多个文件或整个文件夹上传病理图片。'}
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
        
        {/* 右侧：报告展示区域 */}
        <div style={columnStyle}>
          <Card style={cardStyle} bodyStyle={{ padding: 0, margin: 0 }}>
            <div style={reportHeaderStyle}>
              <h2 style={sectionTitleStyle}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={themeColors.colorPrimary} strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                  <polyline points="10 9 9 9 8 9"/>
                </svg>
                肾病分析报告
              </h2>
              {reportData.generated && (
                <div style={{ fontSize: 14, color: themeColors.colorTextTertiary, marginTop: 5 }}>
                  生成时间: {reportData.generatedTime}
                </div>
              )}
            </div>
            
            <div style={reportContentStyle}>
              {!reportData.generated ? (
                <Empty 
                  description="请上传病理图片以生成报告"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  style={{ color: themeColors.colorTextSecondary }}
                />
              ) : (
                <div>
                  {/* 患者信息 */}
                  <div style={{ marginBottom: 20 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 600, color: themeColors.colorTextSecondary, marginBottom: 10 }}>
                      患者信息
                    </h3>
                    {Object.entries(reportData.patientInfo).map(([key, value]) => (
                      <div key={key} style={patientInfoItemStyle}>
                        <span style={patientInfoLabelStyle}>
                          {key === 'name' && '姓名'}
                          {key === 'age' && '年龄'}
                          {key === 'gender' && '性别'}
                          {key === 'hospital' && '就诊医院'}
                          {key === 'department' && '科室'}
                          {key === 'doctor' && '主治医生'}
                        </span>
                        <span style={patientInfoValueStyle}>{value}</span>
                      </div>
                    ))}
                  </div>
                  
                  <Divider style={{ backgroundColor: themeColors.colorBorder, margin: '20px 0' }} />
                  
                  {/* 分析摘要 */}
                  <div style={{ marginBottom: 20 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 600, color: themeColors.colorTextSecondary, marginBottom: 15 }}>
                      分析摘要
                    </h3>
                    
                    <div style={{ marginBottom: 15, padding: '15px', backgroundColor: 'rgba(15, 23, 42, 0.5)', borderRadius: 8 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ color: themeColors.colorSuccess, fontWeight: 'bold' }}>正常区域</span>
                          <span style={{ padding: '2px 8px', borderRadius: '12px', backgroundColor: themeColors.colorSuccess, color: 'white', fontSize: 12 }}>
                            {reportData.analysisSummary.normalPercent}%
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ color: themeColors.colorError, fontWeight: 'bold' }}>异常区域</span>
                          <span style={{ padding: '2px 8px', borderRadius: '12px', backgroundColor: themeColors.colorError, color: 'white', fontSize: 12 }}>
                            {reportData.analysisSummary.abnormalPercent}%
                          </span>
                        </div>
                      </div>
                      
                      <div style={{ marginBottom: 10 }}>
                        <span style={{ color: themeColors.colorTextTertiary, fontSize: 14, marginBottom: 5, display: 'block' }}>
                          <strong>置信度评分：</strong>
                        </span>
                        <div style={{ width: '100%', height: '8px', backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                          <div 
                            style={{
                              width: `${reportData.analysisSummary.confidenceScore * 100}%`,
                              height: '100%',
                              backgroundColor: themeColors.colorPrimary,
                              transition: 'width 0.5s ease'
                            }}
                          />
                        </div>
                        <span style={{ color: themeColors.colorTextTertiary, fontSize: 12, marginTop: 5, display: 'block', textAlign: 'right' }}>
                          {(reportData.analysisSummary.confidenceScore * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    
                    <div style={{ marginBottom: 15, padding: '15px', backgroundColor: 'rgba(5, 150, 105, 0.1)', borderRadius: 8, borderLeft: `4px solid ${themeColors.colorPrimary}` }}>
                      <p style={{ color: themeColors.colorTextSecondary, fontSize: 14, margin: 0 }}>
                        <strong>主要发现：</strong>
                        {reportData.analysisSummary.mainFindings}
                      </p>
                    </div>
                  </div>
                  
                  <Divider style={{ backgroundColor: themeColors.colorBorder, margin: '20px 0' }} />
                  
                  {/* 详细发现 */}
                  <div style={{ marginBottom: 20 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 600, color: themeColors.colorTextSecondary, marginBottom: 15 }}>
                      详细发现
                    </h3>
                    <Table 
                      columns={findingsColumns}
                      dataSource={reportData.detailedFindings}
                      pagination={false}
                      rowKey={(record, index) => index}
                      size="small"
                      style={{
                        backgroundColor: 'transparent',
                        '& .ant-table-thead > tr > th': {
                          backgroundColor: 'rgba(15, 23, 42, 0.8)',
                          color: themeColors.colorTextSecondary,
                          borderBottom: `1px solid ${themeColors.colorBorder}`
                        },
                        '& .ant-table-tbody > tr > td': {
                          backgroundColor: 'rgba(15, 23, 42, 0.5)',
                          color: themeColors.colorTextTertiary,
                          borderBottom: `1px solid ${themeColors.colorBorder}`
                        }
                      }}
                    />
                  </div>
                  
                  <Divider style={{ backgroundColor: themeColors.colorBorder, margin: '20px 0' }} />
                  
                  {/* 建议 */}
                  <div style={{ marginBottom: 20 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 600, color: themeColors.colorTextSecondary, marginBottom: 15 }}>
                      临床建议
                    </h3>
                    <div style={{ padding: '15px', backgroundColor: 'rgba(217, 119, 6, 0.1)', borderRadius: 8, borderLeft: `4px solid ${themeColors.colorWarning}` }}>
                      <ul style={{ margin: 0, paddingLeft: 20, color: themeColors.colorTextTertiary }}>
                        {reportData.recommendations.map((rec, index) => (
                          <li key={index} style={{ marginBottom: 8 }}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  <Divider style={{ backgroundColor: themeColors.colorBorder, margin: '20px 0' }} />
                  
                  {/* 结论 */}
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 600, color: themeColors.colorTextSecondary, marginBottom: 15 }}>
                      结论
                    </h3>
                    <div style={{ padding: '15px', backgroundColor: 'rgba(59, 130, 246, 0.1)', borderRadius: 8, borderLeft: `4px solid ${themeColors.colorPrimary}` }}>
                      <p style={{ color: themeColors.colorTextSecondary, fontSize: 14, margin: 0 }}>
                        {reportData.conclusion}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div style={reportFooterStyle}>
              {reportData.generated && (
                <>
                  <Button 
                    icon={<DownloadOutlined />}
                    onClick={downloadReport}
                    style={{ color: themeColors.colorTextSecondary }}
                  >
                    下载报告
                  </Button>
                  <Button 
                    icon={<SaveOutlined />}
                    onClick={saveReport}
                    style={{ color: themeColors.colorTextSecondary }}
                  >
                    保存报告
                  </Button>
                  <Button 
                    type="primary"
                    icon={<PrinterOutlined />}
                    onClick={printReport}
                  >
                    打印报告
                  </Button>
                </>
              )}
              {reportData.generated && (
                <Button 
                  danger
                  onClick={resetReport}
                  style={{ marginLeft: 'auto' }}
                >
                  重新生成
                </Button>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ReportComponent;
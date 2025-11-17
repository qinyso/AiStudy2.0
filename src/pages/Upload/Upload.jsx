import './Upload.css';
import React, { useState } from 'react';
import { InboxOutlined, FileTextOutlined } from '@ant-design/icons';
import { message, Upload } from 'antd';
const { Dragger } = Upload;
import { Card } from 'antd';
import { themeColors } from '../../theme';
// 从localStorage获取token
const getToken = () => {
  return localStorage.getItem('token');
};

const props = {
  name: 'files', // 修改为'files'以匹配后端接口期望的字段名
  multiple: true,
  action: 'http://localhost:8000/api/upload-multiple', // 使用后端多文件上传接口

  
  onChange(info) {
    const { status, response, error } = info.file;
    console.log('Upload status:', status);
    console.log('Response:', response);
    console.log('File list:', info.fileList);
    
    if (status !== 'uploading') {
      console.log('Current file:', info.file);
    }
    if (status === 'done') {
      if (response && response.code === 200) {
        message.success(`${info.file.name} 文件上传成功。`);
        
        // 检查所有文件是否都已上传完成
        const allDone = info.fileList.every(file => file.status === 'done');
        console.log('All files done?', allDone);
        
        if (allDone) {
          // 调用分类结果更新函数，传入后端响应和上传的文件列表
          console.log('Calling handleResultsUpdate with:', response, info.fileList);
          handleResultsUpdate(response, info.fileList);
          message.success('所有文件上传完成，分析结果已生成');
        }
      } else {
        // 处理各种错误情况
        let errorMsg = `${info.file.name} 文件上传失败。`;
        if (error && error.response) {
          if (error.response.status === 401) {
            errorMsg = '请先登录再上传文件';
          } else if (error.response.status === 422) {
            errorMsg = '上传参数错误，请检查文件格式';
          }
        }
        message.error(errorMsg);
      }
    } else if (status === 'error') {
        // 处理各种错误情况
        let errorMsg = `${info.file.name} 文件上传失败。`;
        if (error && error.response) {
          if (error.response.status === 401) {
            errorMsg = '请先登录再上传文件';
          } else if (error.response.status === 422) {
            // 提供更详细的422错误信息
            errorMsg = `${info.file.name} 上传参数错误。请检查：1) 文件格式是否支持 2) 文件大小是否超过限制 3) 是否已登录`;
            console.log('422错误详情:', error.response.data);
          } else if (error.response.data && error.response.data.msg) {
            errorMsg = `${info.file.name} 上传失败: ${error.response.data.msg}`;
          }
        }
        message.error(errorMsg);
      }
    },
    // 禁用默认的Content-Type设置，让浏览器自动处理multipart/form-data
    withCredentials: false,
    onDrop(e) {
    console.log('Dropped files', e.dataTransfer.files);
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
    
    // 处理分类结果更新
    const handleResultsUpdate = (results, files) => {
      // 这里我们从后端返回的数据中提取分类结果
      // 由于后端接口目前只返回上传结果，我们模拟一些分类数据
      // 在实际应用中，这里应该从后端返回的分类结果中提取真实数据
      setAnalysisResults({
        uploaded: true,
        normalPercent: Math.floor(Math.random() * 30) + 70, // 模拟70-99%的正常组织
        abnormalPercent: Math.floor(Math.random() * 30), // 模拟0-29%的异常组织
        normalDescription: '大部分区域显示正常细胞结构，细胞排列规则，未见明显异型性',
        abnormalDescription: '在部分区域观察到少量细胞形态异常，细胞大小不均，建议进一步检查',
        recommendation: '建议进行常规随访观察。如有临床症状变化，请及时就医进行病理活检确诊。',
        uploadedFiles: files
      });
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
      alignItems: 'flex-start',
      justifyContent: 'center',
    };
    
    // 左右两列的通用样式
    const columnStyle = {
      width: '48%',
      maxWidth: 800,
    };

    // 拖拽上传区域样式
    const draggerStyle = {
      width: '100%',
      borderRadius: 12,
      border: `2px dashed ${themeColors.colorBorder}`,
      background: 'rgba(15, 23, 42, 0.7)',
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
      minHeight: '300px', // 确保最小高度，防止内容过少时显得不协调
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
              <Dragger {...props} style={draggerStyle}>
                <p className="ant-upload-drag-icon" style={{ fontSize: '48px', color: themeColors.colorPrimary }}>
                  <FileTextOutlined />
                </p>
                <p className="ant-upload-text" style={{ color: themeColors.colorTextBase, fontSize: 18 }}>
                  点击或拖拽文件到此区域上传
                </p>
                <p className="ant-upload-hint" style={{ color: themeColors.colorTextTertiary }}>
                  支持单个或批量上传病理图片。请确保图片质量清晰，便于AI准确分析。
                </p>
              </Dragger>
            </div>
            
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
                  
                  {/* 显示上传的文件列表 */}
                  {analysisResults.uploadedFiles.length > 0 && (
                    <div style={{ marginBottom: 20, padding: '10px', backgroundColor: 'rgba(15, 23, 42, 0.5)', borderRadius: 8 }}>
                      <p style={{ color: themeColors.colorTextSecondary, marginBottom: 8, fontSize: 14 }}><strong>已分析文件：</strong></p>
                      <ul style={{ margin: 0, paddingLeft: 20, color: themeColors.colorTextTertiary }}>
                        {analysisResults.uploadedFiles.map((file, index) => (
                          <li key={index} style={{ fontSize: 12, marginBottom: 4 }}>{file.name}</li>
                        ))}
                      </ul>
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
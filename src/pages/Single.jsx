import { Card, Typography, Tag, Button } from 'antd';
import { useState } from 'react';
import { themeColors } from '../theme';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Paragraph, Text } = Typography;

const Single = () => {


  return (
    <div style={{
      minHeight: '100vh',
      // 黑色为主的渐变蓝色科技感背景
      background: 'linear-gradient(135deg, #05070a 0%, #0a1128 50%, #0f172a 100%)',
      // 添加科技感光效
      backgroundImage: 'radial-gradient(circle at 20% 30%, rgba(11, 88, 252, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(11, 88, 252, 0.1) 0%, transparent 60%)',
      color: '#e2e8f0',
      padding: '24px',
      position: 'relative',
      overflow: 'hidden'
    }}></div>
  );
};

export default Single;
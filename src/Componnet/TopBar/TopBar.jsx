import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { themeColors } from '../../theme';
import { 
  Layout, 
  theme, 
  Menu, 
  Input, 
  Avatar, 
  Badge, 
  Dropdown, 
  Button,
  Space,
  Tooltip
} from 'antd';
import {
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  SearchOutlined,
  BellOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
  HomeOutlined,
  MessageOutlined,
  FileTextOutlined,
  TrophyOutlined,
  TeamOutlined,
  LoginOutlined,
  UserAddOutlined,
  MonitorOutlined,
  FileImageOutlined,
} from '@ant-design/icons';
import './TopBar.css';

const { Header } = Layout;

// 导航菜单项配置 - 与首页保持一致
  const menuItems = [
     {
    key:'1',
    label:'首页',
    path:'/',
    icon: <HomeOutlined />,
  },
    
  {
    key:'2',
    label:'智慧助理',
    path:'/AIchat',
    icon: <TrophyOutlined />,
  },
  {
    key:'3',
    label:'病灶分类',
    path:'/upload',
    icon: <FileTextOutlined />,
  },
 {
    key:'4',
    label:'报告生成',
    path:'/report',
    icon: <MonitorOutlined />,
  },
  {
    key:'5',
    label:'细胞分割与计数',
    path:'/divide',
    icon: <FileImageOutlined />,
  },

];

// 用户下拉菜单
const userMenuItems = [
  {
    key: 'setting',
    label: <span><SettingOutlined /> 个人设置</span>,
  },
  {
    key: 'logout',
    label: <span><LogoutOutlined /> 退出登录</span>,
  },
];

const TopBar = ({ collapsed = false, onToggle = () => {} }) => {
  // 获取Ant Design主题令牌
  const {
    token: { colorBgContainer, colorText, borderRadius },
  } = theme.useToken();
  
  // 从主题配置中获取主色调
  const { colorPrimary } = themeColors;
  
  // 状态管理
  const [current, setCurrent] = useState('1');
  const navigate = useNavigate();
  
  // 处理菜单点击
  const handleMenuClick = (e) => {
    setCurrent(e.key);
    const selectedItem = menuItems.find(item => item.key === e.key);
    if (selectedItem && selectedItem.path) {
      navigate(selectedItem.path);
    }
  };

  // 与首页完全一致的头部背景样式
  const headerStyle = {
    background: 'linear-gradient(135deg, #0f172a 0%, #0c4a6e 50%, #0f172a 100%)',
    backgroundImage: 'radial-gradient(circle at 20% 30%, rgba(14, 165, 233, 0.2) 0%, transparent 40%), radial-gradient(circle at 80% 70%, rgba(2, 132, 199, 0.2) 0%, transparent 40%)',
    display: 'flex',
    alignItems: 'center',
    padding: '0 24px',
    height: 54,        
    zIndex: 1000, // 提高z-index值确保导航栏始终在顶部
    position: 'sticky',
    top: 0,
  };
  
  // 品牌标识样式
  const logoStyle = {
    display: 'flex',
    alignItems: 'center',
    color: '#fff',
    fontWeight: 600,
    fontSize: 20,
    letterSpacing: 0.5,
  };
  
  // 搜索框样式
  const searchStyle = {
    width: 200,
    background: 'rgba(255, 255, 255, 0.15)',
    borderColor: 'rgba(14, 165, 233, 0.5)',
    color: '#fff',
    '&::placeholder': {
      color: 'rgba(255, 255, 255, 0.7)',
    },
  };
  
  // 菜单样式 - 确保完整显示菜单项并居中
  const menuStyle = {
    background: 'transparent',
    border: 'none',
    flex: 1, // 让菜单占满可用空间
    minWidth: 0, // 允许菜单缩小
    justifyContent: 'center', // 菜单居中显示
  };
  
  // 简化的菜单项样式 - 与首页融为一体
  const menuItemStyle = {
    color: '#ffffff',
    fontSize: '14px',
    fontWeight: 500,
    '&:hover': {
      color: '#0ea5e9',
      background: 'rgba(255, 255, 255, 0.1)',
    },
    '&.ant-menu-item-selected': {
      color: '#ffffff',
      background: 'linear-gradient(90deg, #0ea5e9, #0284c7)',
    },
  };

  return (
    <Header style={headerStyle}>
   
      
  
      <div style={logoStyle}>
        <span style={{ 
          background: 'transparent',
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          color: '#0ea5e9',
          textShadow: '0 0 10px rgba(14, 165, 233, 0.6)',
        }}>
         AI肾病智能研究
        </span>
      </div>
      
      {/* 主导航菜单 */}
      <Menu
        mode="horizontal"
        selectedKeys={[current]}
        onClick={handleMenuClick}
        items={menuItems}
        style={menuStyle}
        overflowedIndicator={null} 
        ellipsis="false"
      />
      
      {/* 右侧功能区 */}
      <Space size="middle" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
       
        
       
        {/* 用户区域 - 增强医疗主题风格 */}
        <Dropdown 
          menu={{ items: userMenuItems }}
          placement="bottomRight"
        >
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            cursor: 'pointer',
            padding: '5px 10px',
            borderRadius: '6px',
            '&:hover': {
              background: 'rgba(255, 255, 255, 0.1)',
            }
          }}>
            <Avatar 
              icon={<UserOutlined />} 
              style={{ 
                backgroundColor: '#0ea5e9'
              }} 
            />
            <span style={{ marginLeft: 8, color: '#ffffff', fontWeight: 500 }}>用户</span>
          </div>
        </Dropdown>
        
        {/* 登录/注册按钮 */}
        <Link to="/enter">
          <Button 
            type="text" 
            icon={<LoginOutlined />}
            style={{ 
              color: '#ffffff',
              fontSize: '14px',
              fontWeight: 500,
              '&:hover': {
                color: '#0ea5e9',
                background: 'rgba(14, 165, 233, 0.1)',
              }
            }}
          >
            登录
          </Button>
        </Link>
        
        <Link to="/register">
          <Button 
            type="primary" 
            icon={<UserAddOutlined />}
            style={{ 
              background: 'linear-gradient(90deg, #0ea5e9, #0284c7)',
              border: 'none',
              fontSize: '14px',
              fontWeight: 500,
              '&:hover': {
                background: 'linear-gradient(90deg, #0284c7, #0c4a6e)',
              },
              transition: 'all 0.3s ease'
            }}
          >
            注册
          </Button>
        </Link>
      </Space>
    </Header>
  );
};

export default TopBar;
    
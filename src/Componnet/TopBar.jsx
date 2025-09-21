import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { themeColors } from '../theme';
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
  UserAddOutlined
} from '@ant-design/icons';


const { Header } = Layout;

// 导航菜单项配置
  const menuItems = [
    {
      key: '1',
      label: '首页',
      path:'/home',
    icon: <HomeOutlined />,
  },
  {
    key: '2',
    label: '消息',
    path:'/Message',
    icon: <MessageOutlined />,
  },
  {
    key: '3',
    label: '案例',
    path:'/Case',
    icon: <FileTextOutlined />,
  },
  {
    key: '4',
    label: '成就',
    path:'/Achievement',  
    icon: <TrophyOutlined />,
  },
  {
    key: '5',
    label: '团队',
  
    path:'/Team', 
    icon: <TeamOutlined />,
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

  // 头部样式 - 科技感深色主题
  const headerStyle = {
    background: 'linear-gradient(90deg, #0f172a, #1e293b)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 24px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.3)',
    zIndex: 1,
  };
  
  // 品牌标识样式
  const logoStyle = {
    display: 'flex',
    alignItems: 'center',
    color: '#fff',
    fontWeight: 600,
    fontSize: 18,
    letterSpacing: 0.5,
  };
  
  // 搜索框样式
  const searchStyle = {
    width: 200,
    background: 'rgba(255, 255, 255, 0.1)',
    borderColor: 'rgba(255, 255, 255, 0.2)',
    color: '#fff',
    '&::placeholder': {
      color: 'rgba(255, 255, 255, 0.5)',
    },
  };
  
  // 菜单样式
  const menuStyle = {
    background: 'transparent',
    border: 'none',
  };
  
  // 菜单项样式
  const menuItemStyle = {
    color: 'rgba(255, 255, 255, 0.8)',
    '&:hover': {
      color: colorPrimary,
      background: 'rgba(255, 255, 255, 0.1)',
    },
    '&.ant-menu-item-selected': {
      color: colorPrimary,
      background: 'rgba(255, 255, 255, 0.1)',
    },
  };

  return (
    <Header style={headerStyle}>
   
      
      {/* 品牌标识 */}
      <div style={logoStyle}>
        <span style={{ 
          background: 'transparent',
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          color: colorPrimary, 
        }}>
         智慧医疗
        </span>
      </div>
      
      {/* 主导航菜单 */}
      <Menu
        mode="horizontal"
        selectedKeys={[current]}
        onClick={handleMenuClick}
        items={menuItems}
        style={menuStyle}
        itemStyle={menuItemStyle}
      />
      
      {/* 右侧功能区 */}
      <Space size="middle" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
       
        
       
        {/* 用户区域 */}
        <Dropdown 
          menu={{ items: userMenuItems }}
          placement="bottomRight"
        >
          <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
            <Avatar icon={<UserOutlined />} style={{ backgroundColor: colorPrimary }} />
            <span style={{ marginLeft: 8 }}>用户</span>
          </div>
        </Dropdown>
        
        {/* 登录/注册按钮 */}
        <Link to="/pages/Login">
          <Button 
            type="text" 
            icon={<LoginOutlined />}
            style={{ color: 'rgba(255, 255, 255, 0.8)' }}
          >
            登录
          </Button>
        </Link>
        
        <Link to="/pages/Register">
          <Button 
            type="primary" 
            icon={<UserAddOutlined />}
            style={{ 
              background: `linear-gradient(90deg, ${colorPrimary}, #60a5fa)`,
              border: 'none'
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
    
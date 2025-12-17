import React from 'react';
import TopBar from './TopBar/TopBar.jsx';
import AppRoutes from '../router/index.jsx';
import { Layout } from 'antd';
import VantaBackground from './VantaBackground';
import { useLocation } from 'react-router-dom';
const { Header, Content, Footer ,Sider} = Layout;

const MainLayout = () => {
  const location = useLocation();
  const pathname = location.pathname;
  
  // 只有首页和登录界面保持鼠标交互效果
  const isHomeOrEnter = pathname === '/' || pathname === '/enter';
  
  return (
    
    <Layout style={{
      
        minHeight: '100vh',
        height: 'auto',
      background: 'linear-gradient(135deg, #0f172a 0%, #0c4a6e 50%, #0f172a 100%)',
      backgroundImage: 'radial-gradient(circle at 20% 30%, rgba(14, 165, 233, 0.2) 0%, transparent 40%), radial-gradient(circle at 80% 70%, rgba(2, 132, 199, 0.2) 0%, transparent 40%)',
      position: 'relative',
  }}>
      {/* Vanta.js动态背景 - 根据页面控制鼠标交互效果 */}
      <VantaBackground 
        effect="net" 
        options={{ 
          backgroundColor: 0x0f172a, 
          color: 0x0ea5e9,
          points: 15.00,
          maxDistance: 22.00,
          spacing: 15.00,
          mouseControls: isHomeOrEnter,
          touchControls: isHomeOrEnter
        }} 
      />
      <TopBar />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <AppRoutes />
      </div>
    
  </Layout>
);
};
export default MainLayout;
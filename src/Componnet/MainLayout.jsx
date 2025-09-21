import React from 'react';
import TopBar from './TopBar.jsx';
import AppRoutes from '../router/index.jsx';
import { Layout } from 'antd';
const { Header, Content, Footer ,Sider} = Layout;

const MainLayout = () => {
  return (
    
    <Layout style={{
        minHeight: '100%',
      backgroundColor: ' rgb(30, 41, 59)',
  }}>
      <TopBar />
      <AppRoutes />
    
  </Layout>
);
};
export default MainLayout;
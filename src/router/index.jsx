import React from 'react';

import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Get from '../pages/Get/Get';
import Enter from '../pages/Enter/Enter';
import Field from '../pages/Field';
import Single from '../pages/Single';
import Home from '../pages/Home';
import AIchat from '../pages/AIchat/AIchat';
import Register from '../pages/Register';
import Upload from '../pages/Upload/Upload';
import Report from '../pages/Report/Report';
import Divide from '../pages/Divide/Divide';
import Number from '../pages/Number/Number';
// 私有路由组件：检查用户是否已登录
const PrivateRoute = () => {
  // 检查 localStorage 中是否有 token
  const token = localStorage.getItem('token');
  return token ? <Outlet /> : <Navigate to="/enter" replace />;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* 公开路由 */}
      <Route path="/" element={<Home />} />
      <Route path="/register" element={<Register />} />
      <Route path="/enter" element={<Enter />} />
      
      {/* 需要登录的私有路由 */}
      <Route element={<PrivateRoute/>}>
        <Route path="/get" element={<Get />} />
        <Route path="/field" element={<Field />} />
        <Route path="/single" element={<Single />} />
        <Route path="/AIchat" element={<AIchat />} />
        <Route path="/upload" element={<Upload />} />
      <Route path="/report" element={<Report />} />
      <Route path="/divide" element={<Divide />} />
      <Route path="/number" element={<Number />} />
      </Route>
      
      {/* 404 页面 - 重定向到首页 */}                     
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};     
export default AppRoutes;

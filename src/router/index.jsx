import React from 'react';

import { Routes, Route } from 'react-router-dom';
import Get from '../pages/Get/Get';
import Enter from '../pages/Enter/Enter';
import Field from '../pages/Field';
import Single from '../pages/Single';
import Home from '../pages/Home';
import AIchat from '../pages/AIchat/AIchat';
import Register from '../pages/Register';
const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/get" element={<Get />} />
      <Route path="/enter" element={<Enter />} />
      <Route path="/field" element={<Field />} />
      <Route path="/single" element={<Single />} />
      <Route path="/AIchat" element={<AIchat />} />
      <Route path="/register" element={<Register />} />
    </Routes>
  );
};
export default AppRoutes;

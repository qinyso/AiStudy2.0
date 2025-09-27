import React from 'react';

import { Routes, Route } from 'react-router-dom';
import Get from '../pages/Get/Get';
import Enter from '../pages/Enter';
import Field from '../pages/Field';
import Single from '../pages/Single';
 
const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Get />} />
      <Route path="/get" element={<Get />} />
      <Route path="/enter" element={<Enter />} />
      <Route path="/field" element={<Field />} />
      <Route path="/single" element={<Single />} />
    </Routes>
  );
};
export default AppRoutes;

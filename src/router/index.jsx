import React from 'react';

import { Routes, Route } from 'react-router-dom';
import Home from '../pages/Home';
import Enter from '../pages/Enter';
import Case from '../pages/Case';
import Achivement from '../pages/Achivement';
import Team from '../pages/Team';
 
const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/home" element={<Home />} />
      <Route path="/enter" element={<Enter />} />
      <Route path="/case" element={<Case />} />
      <Route path="/achivement" element={<Achivement />} />
      <Route path="/team" element={<Team />} />
    </Routes>
  );
};
export default AppRoutes;

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd-mobile';
import zhCN from 'antd-mobile/es/locales/zh-CN';
import Home from './pages/home/Home';
import LotteryTest from './pages/lottery/LotteryTest';
import IchibanPage from './pages/ichiban/IchibanPage';
import TowerPage from './pages/tower/TowerPage';
import GashaponPage from './pages/gashapon/GashaponPage';
import ProfilePage from './pages/profile/ProfilePage';
import './App.css';

function App() {
  return (
    <ConfigProvider locale={zhCN}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/lottery/test" element={<LotteryTest />} />
          <Route path="/ichiban" element={<IchibanPage />} />
          <Route path="/tower" element={<TowerPage />} />
          <Route path="/gashapon" element={<GashaponPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
}

export default App;

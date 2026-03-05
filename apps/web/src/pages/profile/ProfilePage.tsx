import { useState, useEffect } from 'react';
import { NavBar, Card, List, Button, Badge, ProgressBar, Tag } from 'antd-mobile';
import { UserOutline, GiftOutline, StarFill, FireFill, LeftOutline } from 'antd-mobile-icons';
import './ProfilePage.css';

interface UserData {
  id: string;
  username: string;
  nickname: string;
  avatar: string;
  balance: number;
  luckyCoin: number;
  points: number;
}

const mockUser: UserData = {
  id: 'user-1',
  username: 'testuser',
  nickname: '测试用户',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop',
  balance: 1000,
  luckyCoin: 50,
  points: 500,
};

export default function ProfilePage() {
  const [user, setUser] = useState<UserData>(mockUser);
  const [stats, setStats] = useState({
    totalDraws: 0,
    totalWins: 0,
    ssRCount: 0,
    currentStreak: 0,
  });

  // 从localStorage读取数据
  useEffect(() => {
    const savedBalance = localStorage.getItem('user_balance');
    const savedStats = localStorage.getItem('user_stats');
    
    if (savedBalance) {
      setUser(prev => ({ ...prev, balance: Number(savedBalance) }));
    }
    if (savedStats) {
      setStats(JSON.parse(savedStats));
    }
  }, []);

  const handleRecharge = () => {
    const amount = 100;
    setUser(prev => {
      const updated = { ...prev, balance: prev.balance + amount };
      localStorage.setItem('user_balance', String(updated.balance));
      return updated;
    });
  };

  const levelProgress = Math.min((user.points / 1000) * 100, 100);
  const currentLevel = Math.floor(user.points / 100) + 1;

  return (
    <div className="profile-page">
      <NavBar
        back={<LeftOutline onClick={() => window.location.href = '/'} />}
        onBack={() => window.location.href = '/'}
      >
        个人中心
      </NavBar>

      {/* 用户信息卡片 */}
      <Card className="user-card">
        <div className="user-header">
          <img src={user.avatar} alt="avatar" className="user-avatar" />
          <div className="user-info">
            <h3 className="user-name">{user.nickname}</h3>
            <p className="user-id">ID: {user.username}</p>
            <div className="user-level">
              <Tag color="primary" fill="outline">LV.{currentLevel}</Tag>
              <span className="level-name">探险家</span>
            </div>
          </div>
        </div>
        
        <div className="level-progress">
          <div className="progress-label">
            <span>等级进度</span>
            <span>{user.points}/1000</span>
          </div>
          <ProgressBar percent={levelProgress} />
        </div>
      </Card>

      {/* 资产卡片 */}
      <Card className="assets-card">
        <div className="assets-grid">
          <div className="asset-item">
            <div className="asset-icon">💰</div>
            <div className="asset-value">¥{user.balance}</div>
            <div className="asset-label">余额</div>
          </div>
          <div className="asset-item">
            <div className="asset-icon">🪙</div>
            <div className="asset-value">{user.luckyCoin}</div>
            <div className="asset-label">幸运币</div>
          </div>
          <div className="asset-item">
            <div className="asset-icon">⭐</div>
            <div className="asset-value">{user.points}</div>
            <div className="asset-label">积分</div>
          </div>
        </div>
        <Button
          color="primary"
          size="large"
          block
          style={{ marginTop: 16 }}
          onClick={handleRecharge}
        >
          充值 +100
        </Button>
      </Card>

      {/* 统计卡片 */}
      <Card title="抽奖统计" className="stats-card">
        <div className="stats-grid">
          <div className="stat-box">
            <div className="stat-number">{stats.totalDraws}</div>
            <div className="stat-label">总抽奖次数</div>
          </div>
          <div className="stat-box">
            <div className="stat-number">{stats.totalWins}</div>
            <div className="stat-label">中奖次数</div>
          </div>
          <div className="stat-box">
            <div className="stat-number highlight">{stats.ssRCount}</div>
            <div className="stat-label">SSR获得</div>
          </div>
          <div className="stat-box">
            <div className="stat-number">{stats.currentStreak}</div>
            <div className="stat-label">连续签到</div>
          </div>
        </div>
      </Card>

      {/* 功能菜单 */}
      <Card className="menu-card">
        <List>
          <List.Item
            prefix={<GiftOutline />}
            onClick={() => window.location.href = '/ichiban'}
          >
            一番赏
          </List.Item>
          <List.Item
            prefix={<FireFill />}
            onClick={() => window.location.href = '/tower'}
          >
            爬塔挑战
          </List.Item>
          <List.Item
            prefix={<StarFill />}
            onClick={() => window.location.href = '/gashapon'}
          >
            扭蛋机
          </List.Item>
          <List.Item
            prefix={<UserOutline />}
            onClick={() => {}}
          >
            收货地址
          </List.Item>
        </List>
      </Card>

      {/* 说明卡片 */}
      <Card title="功能说明" className="info-card">
        <div className="info-content">
          <p><Badge content="✓" style={{ '--color': '#52c41a' }} /> 一番赏界面 + 模拟抽奖</p>
          <p><Badge content="✓" style={{ '--color': '#52c41a' }} /> 爬塔界面 + 模拟闯关</p>
          <p><Badge content="✓" style={{ '--color': '#52c41a' }} /> 扭蛋机界面 + 模拟抽蛋</p>
          <p><Badge content="✓" style={{ '--color': '#52c41a' }} /> 用户积分（本地存储）</p>
          <p><Badge content="✗" style={{ '--color': '#999' }} /> 真实支付（开发中）</p>
          <p><Badge content="✗" style={{ '--color': '#999' }} /> 后台管理（开发中）</p>
        </div>
      </Card>
    </div>
  );
}

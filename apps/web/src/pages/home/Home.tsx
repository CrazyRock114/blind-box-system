import { useEffect, useState } from 'react';
import { Swiper, List, NavBar, Badge, Button } from 'antd-mobile';
import { FireFill, GiftOutline, StarFill, UserOutline } from 'antd-mobile-icons';
import './Home.css';

interface BoxPool {
  id: string;
  name: string;
  description: string;
  cover: string;
  type: 'ichiban' | 'tower' | 'gashapon';
  price: number;
  status: string;
  totalTickets?: number;
  soldTickets?: number;
  maxFloors?: number;
}

const banners = [
  { id: 1, image: 'https://images.unsplash.com/photo-1618336753974-aae8e04506aa?w=800&h=400&fit=crop', title: '一番赏新品上市' },
  { id: 2, image: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=800&h=400&fit=crop', title: '爬塔挑战赢大奖' },
  { id: 3, image: 'https://images.unsplash.com/photo-1551103782-8ab07afd45c1?w=800&h=400&fit=crop', title: '扭蛋机限时优惠' },
];

const mockPools: BoxPool[] = [
  {
    id: 'ichiban-1',
    name: '海贼王一番赏',
    description: 'A赏：路飞手办，B赏：索隆手办',
    cover: 'https://images.unsplash.com/photo-1618336753974-aae8e04506aa?w=400&h=400&fit=crop',
    type: 'ichiban',
    price: 58,
    status: 'active',
    totalTickets: 80,
    soldTickets: 23,
  },
  {
    id: 'tower-1',
    name: '无尽爬塔',
    description: '挑战100层，赢取终极大奖',
    cover: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=400&h=400&fit=crop',
    type: 'tower',
    price: 10,
    status: 'active',
    maxFloors: 100,
  },
  {
    id: 'gashapon-1',
    name: '动漫扭蛋',
    description: 'SSR概率UP！',
    cover: 'https://images.unsplash.com/photo-1551103782-8ab07afd45c1?w=400&h=400&fit=crop',
    type: 'gashapon',
    price: 15,
    status: 'active',
  },
];

export default function Home() {
  const [boxPools] = useState<BoxPool[]>(mockPools);
  const [userBalance, setUserBalance] = useState(1000);

  useEffect(() => {
    const savedBalance = localStorage.getItem('user_balance');
    if (savedBalance) {
      setUserBalance(Number(savedBalance));
    }
  }, []);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'ichiban': return <FireFill style={{ color: '#ff4d4f' }} />;
      case 'tower': return <StarFill style={{ color: '#722ed1' }} />;
      case 'gashapon': return <GiftOutline style={{ color: '#52c41a' }} />;
      default: return <GiftOutline />;
    }
  };

  const getTypeName = (type: string) => {
    switch (type) {
      case 'ichiban': return '一番赏';
      case 'tower': return '爬塔';
      case 'gashapon': return '扭蛋';
      default: return '盲盒';
    }
  };

  const getTypeRoute = (type: string) => {
    switch (type) {
      case 'ichiban': return '/ichiban';
      case 'tower': return '/tower';
      case 'gashapon': return '/gashapon';
      default: return '/';
    }
  };

  return (
    <div className="home-page">
      <NavBar
        right={<UserOutline onClick={() => window.location.href = '/profile'} />}
      >
        盲盒商城
      </NavBar>
      
      {/* 余额展示 */}
      <div className="home-balance">
        <div className="balance-item">
          <span className="balance-label">余额</span>
          <span className="balance-value">¥{userBalance}</span>
        </div>
        <div className="balance-item">
          <span className="balance-label">积分</span>
          <span className="balance-value">{Math.floor(userBalance / 10)}</span>
        </div>
      </div>
      
      <Swiper autoplay loop>
        {banners.map(banner => (
          <Swiper.Item key={banner.id}>
            <div className="banner-item">
              <img src={banner.image} alt={banner.title} />
              <div className="banner-title">{banner.title}</div>
            </div>
          </Swiper.Item>
        ))}
      </Swiper>

      {/* 快捷入口 */}
      <div className="quick-entry">
        <div className="quick-entry-grid">
          <div className="entry-item" onClick={() => window.location.href = '/ichiban'}>
            <div className="entry-icon" style={{ background: 'linear-gradient(135deg, #ff6b6b 0%, #ff8e8e 100%)' }}>
              <FireFill />
            </div>
            <span className="entry-name">一番赏</span>
          </div>
          <div className="entry-item" onClick={() => window.location.href = '/tower'}>
            <div className="entry-icon" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
              <StarFill />
            </div>
            <span className="entry-name">爬塔</span>
          </div>
          <div className="entry-item" onClick={() => window.location.href = '/gashapon'}>
            <div className="entry-icon" style={{ background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)' }}>
              <GiftOutline />
            </div>
            <span className="entry-name">扭蛋</span>
          </div>
          <div className="entry-item" onClick={() => window.location.href = '/profile'}>
            <div className="entry-icon" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
              <UserOutline />
            </div>
            <span className="entry-name">我的</span>
          </div>
        </div>
      </div>

      <div className="box-list">
        <h3 className="section-title">热门盲盒</h3>
        {boxPools.map(box => (
          <List.Item
            key={box.id}
            prefix={<img src={box.cover} alt={box.name} style={{ width: 80, height: 80, borderRadius: 8 }} />}
            title={
              <div className="box-title">
                <Badge content={getTypeName(box.type)} style={{ '--color': '#1677ff' }}>
                  {getTypeIcon(box.type)}
                </Badge>
                <span style={{ marginLeft: 8 }}>{box.name}</span>
              </div>
            }
            description={
              <div className="box-desc">
                <div>{box.description}</div>
                {box.type === 'ichiban' && box.totalTickets !== undefined && box.soldTickets !== undefined && (
                  <div className="ticket-info">
                    剩余: {box.totalTickets - box.soldTickets}/{box.totalTickets} 张
                  </div>
                )}
              </div>
            }
            extra={<span className="box-price">¥{box.price}</span>}
            onClick={() => window.location.href = getTypeRoute(box.type)}
          />
        ))}
      </div>

      {/* 测试入口 */}
      <div style={{ padding: '16px', textAlign: 'center' }}>
        <Button
          color="primary"
          fill="outline"
          size="small"
          onClick={() => { window.location.href = '/lottery/test'; }}
        >
          概率引擎测试
        </Button>
      </div>
    </div>
  );
}

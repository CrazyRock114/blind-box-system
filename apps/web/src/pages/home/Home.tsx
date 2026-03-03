import { useEffect, useState } from 'react';
import { Swiper, List, NavBar, Badge, Button } from 'antd-mobile';
import { FireFill, GiftOutline, StarFill } from 'antd-mobile-icons';
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
  { id: 1, image: 'https://picsum.photos/400/200?random=1', title: '一番赏新品上市' },
  { id: 2, image: 'https://picsum.photos/400/200?random=2', title: '爬塔挑战赢大奖' },
  { id: 3, image: 'https://picsum.photos/400/200?random=3', title: '扭蛋机限时优惠' },
];

export default function Home() {
  const [boxPools, setBoxPools] = useState<BoxPool[]>([]);

  useEffect(() => {
    // 模拟数据
    setBoxPools([
      {
        id: '1',
        name: '海贼王一番赏',
        description: 'A赏：路飞手办，B赏：索隆手办',
        cover: 'https://picsum.photos/200/200?random=10',
        type: 'ichiban',
        price: 58,
        status: 'active',
        totalTickets: 80,
        soldTickets: 23,
      },
      {
        id: '2',
        name: '无尽爬塔',
        description: '挑战100层，赢取终极大奖',
        cover: 'https://picsum.photos/200/200?random=11',
        type: 'tower',
        price: 10,
        status: 'active',
        maxFloors: 100,
      },
      {
        id: '3',
        name: '动漫扭蛋',
        description: 'SSR概率UP！',
        cover: 'https://picsum.photos/200/200?random=12',
        type: 'gashapon',
        price: 15,
        status: 'active',
      },
    ]);
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

  return (
    <div className="home-page">
      <NavBar>盲盒商城</NavBar>
      
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

      <div className="category-tabs">
        <div className="category-item active"><FireFill /> 全部</div>
        <div className="category-item"><GiftOutline /> 一番赏</div>
        <div className="category-item"><StarFill /> 爬塔</div>
        <div className="category-item"><GiftOutline /> 扭蛋</div>
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
            onClick={() => window.location.href = `/box/${box.id}`}
          />
        ))}
      </div>

      {/* 测试入口 */}
      <div style={{ padding: '16px', textAlign: 'center' }}>
        <Button
          color="primary"
          size="large"
          onClick={() => { window.location.href = '/lottery/test'; }}
          style={{ width: '100%' }}
        >
          <FireFill /> 概率引擎测试（新）
        </Button>
      </div>
    </div>
  );
}

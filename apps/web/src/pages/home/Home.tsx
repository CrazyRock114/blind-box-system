import { useEffect, useState } from 'react';
import { Swiper, List, NavBar, Badge } from 'antd-mobile';
import { FireFill, GiftFill, StarFill } from 'antd-mobile-icons';
import api from '../api';
import { BoxPool } from '../types';
import './Home.css';

const banners = [
  { id: 1, image: 'https://picsum.photos/400/200?random=1', title: '一番赏新品上市' },
  { id: 2, image: 'https://picsum.photos/400/200?random=2', title: '爬塔挑战赢大奖' },
  { id: 3, image: 'https://picsum.photos/400/200?random=3', title: '扭蛋机限时优惠' },
];

export default function Home() {
  const [boxPools, setBoxPools] = useState<BoxPool[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchBoxPools();
  }, []);

  const fetchBoxPools = async () => {
    setLoading(true);
    try {
      // 这里后续对接真实API
      // const res = await api.get('/box-pools');
      // setBoxPools(res.data);
      
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
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'ichiban':
        return <FireFill style={{ color: '#ff4d4f' }} />;
      case 'tower':
        return <StarFill style={{ color: '#722ed1' }} />;
      case 'gashapon':
        return <GiftFill style={{ color: '#52c41a' }} />;
      default:
        return <GiftFill />;
    }
  };

  const getTypeName = (type: string) => {
    switch (type) {
      case 'ichiban':
        return '一番赏';
      case 'tower':
        return '爬塔';
      case 'gashapon':
        return '扭蛋';
      default:
        return '盲盒';
    }
  };

  return (
    <div className="home-page">
      <NavBar>盲盒商城</NavBar>
      
      {/* Banner轮播 */}
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

      {/* 分类标签 */}
      <div className="category-tabs">
        <div className="category-item active">
          <FireFill /> 全部
        </div>
        <div className="category-item">
          <GiftFill /> 一番赏
        </div>
        <div className="category-item">
          <StarFill /> 爬塔
        </div>
        <div className="category-item">
          <GiftFill /> 扭蛋
        </div>
      </div>

      {/* 盲盒列表 */}
      <div className="box-list">
        <h3 className="section-title">热门盲盒</h3>
        <List loading={loading}>
          {boxPools.map(box => (
            <List.Item
              key={box.id}
              prefix={
                <img
                  src={box.cover}
                  alt={box.name}
                  style={{ width: 80, height: 80, borderRadius: 8 }}
                />
              }
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
                  {box.type === 'ichiban' && (
                    <div className="ticket-info">
                      剩余: {box.totalTickets! - box.soldTickets!}/{box.totalTickets} 张
                    </div>
                  )}
                </div>
              }
              extra={<span className="box-price">¥{box.price}</span>}
              onClick={() => window.location.href = `/box/${box.id}`}
            />
          ))}
        </List>
      </div>
    </div>
  );
}

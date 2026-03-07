import { useEffect, useState } from 'react';
import { Swiper, List, NavBar, Badge } from 'antd-mobile';
import { FireFill, GiftOutline, StarFill } from 'antd-mobile-icons';
import api from '../../api';
import type { BoxPool } from '../../types';
import './Home.css';

const banners = [
  { id: 1, image: 'https://picsum.photos/400/200?random=1', title: '一番赏新品上市' },
  { id: 2, image: 'https://picsum.photos/400/200?random=2', title: '爬塔挑战赢大奖' },
  { id: 3, image: 'https://picsum.photos/400/200?random=3', title: '扭蛋机限时优惠' },
];

export default function Home() {
  const [boxPools, setBoxPools] = useState<BoxPool[]>([]);

  useEffect(() => {
    fetchBoxPools();
  }, []);

  const fetchBoxPools = async () => {
    try {
      // 调用真实API
      const res: any = await api.get('/boxes');
      if (res.code === 200) {
        setBoxPools(res.data.map((box: any) => ({
          ...box,
          cover: box.image || `https://picsum.photos/200/200?random=${box.id}`
        })));
      }
    } catch (error) {
      console.error('获取盲盒列表失败:', error);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'ichiban':
        return <FireFill style={{ color: '#ff4d4f' }} />;
      case 'tower':
        return <StarFill style={{ color: '#722ed1' }} />;
      case 'gashapon':
        return <GiftOutline style={{ color: '#52c41a' }} />;
      default:
        return <GiftOutline />;
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
          <GiftOutline /> 一番赏
        </div>
        <div className="category-item">
          <StarFill /> 爬塔
        </div>
        <div className="category-item">
          <GiftOutline /> 扭蛋
        </div>
      </div>

      {/* 盲盒列表 */}
      <div className="box-list">
        <h3 className="section-title">热门盲盒</h3>
        <List>
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

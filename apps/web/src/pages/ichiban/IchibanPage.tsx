import { useState, useEffect } from 'react';
import { NavBar, Card, Button, Toast, List, Badge, Tag, Modal, Space } from 'antd-mobile';
import { FireFill, GiftOutline, LeftOutline } from 'antd-mobile-icons';
import './IchibanPage.css';

interface Prize {
  id: string;
  name: string;
  level: string;
  weight: number;
  image: string;
  stock: number;
}

interface IchibanPool {
  id: string;
  name: string;
  description: string;
  cover: string;
  price: number;
  totalTickets: number;
  soldTickets: number;
  prizes: Prize[];
}

const mockPools: IchibanPool[] = [
  {
    id: 'ichiban-1',
    name: '海贼王一番赏',
    description: 'A赏：路飞手办，B赏：索隆手办，C赏：娜美手办',
    cover: 'https://images.unsplash.com/photo-1618336753974-aae8e04506aa?w=400&h=400&fit=crop',
    price: 58,
    totalTickets: 80,
    soldTickets: 23,
    prizes: [
      { id: 'p1-1', name: '路飞手办', level: 'A', weight: 2, image: 'https://images.unsplash.com/photo-1618336753974-aae8e04506aa?w=200', stock: 2 },
      { id: 'p1-2', name: '索隆手办', level: 'B', weight: 4, image: 'https://images.unsplash.com/photo-1618336753974-aae8e04506aa?w=200', stock: 4 },
      { id: 'p1-3', name: '娜美手办', level: 'C', weight: 8, image: 'https://images.unsplash.com/photo-1618336753974-aae8e04506aa?w=200', stock: 8 },
      { id: 'p1-4', name: '乔巴手办', level: 'D', weight: 12, image: 'https://images.unsplash.com/photo-1618336753974-aae8e04506aa?w=200', stock: 12 },
      { id: 'p1-5', name: '文件夹套装', level: 'E', weight: 20, image: 'https://images.unsplash.com/photo-1618336753974-aae8e04506aa?w=200', stock: 20 },
      { id: 'p1-6', name: '徽章盲盒', level: 'F', weight: 34, image: 'https://images.unsplash.com/photo-1618336753974-aae8e04506aa?w=200', stock: 34 },
    ],
  },
  {
    id: 'ichiban-2',
    name: '鬼灭之刃一番赏',
    description: 'A赏：炭治郎手办，B赏：祢豆子手办，Last赏：特别版',
    cover: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400&h=400&fit=crop',
    price: 68,
    totalTickets: 100,
    soldTickets: 45,
    prizes: [
      { id: 'p2-1', name: '炭治郎手办', level: 'A', weight: 2, image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=200', stock: 2 },
      { id: 'p2-2', name: '祢豆子手办', level: 'B', weight: 3, image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=200', stock: 3 },
      { id: 'p2-3', name: '善逸手办', level: 'C', weight: 5, image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=200', stock: 5 },
      { id: 'p2-4', name: '伊之助手办', level: 'D', weight: 8, image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=200', stock: 8 },
      { id: 'p2-5', name: '钥匙扣套装', level: 'E', weight: 25, image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=200', stock: 25 },
      { id: 'p2-6', name: '贴纸套装', level: 'F', weight: 57, image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=200', stock: 57 },
    ],
  },
];

export default function IchibanPage() {
  const [pools, setPools] = useState<IchibanPool[]>(mockPools);
  const [selectedPool, setSelectedPool] = useState<IchibanPool | null>(null);
  const [loading, setLoading] = useState(false);
  const [userBalance, setUserBalance] = useState(1000);

  // 从localStorage读取用户数据
  useEffect(() => {
    const savedBalance = localStorage.getItem('user_balance');
    if (savedBalance) {
      setUserBalance(Number(savedBalance));
    }
  }, []);

  // 保存余额到localStorage
  useEffect(() => {
    localStorage.setItem('user_balance', String(userBalance));
  }, [userBalance]);

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'A': return '#ff4d4f';
      case 'B': return '#ff7a45';
      case 'C': return '#ffa940';
      case 'D': return '#ffc53d';
      case 'E': return '#73d13d';
      case 'F': return '#40a9ff';
      default: return '#999';
    }
  };

  const handleDraw = async (pool: IchibanPool, times: number) => {
    if (userBalance < pool.price * times) {
      Toast.show({ icon: 'fail', content: '余额不足，请充值' });
      return;
    }

    setLoading(true);
    
    // 模拟API延迟
    await new Promise(resolve => setTimeout(resolve, 800));

    const results: { id: number; prize: Prize; ticketNumber: number }[] = [];
    const updatedPool = { ...pool };
    
    for (let i = 0; i < times; i++) {
      const availablePrizes = updatedPool.prizes.filter(p => p.stock > 0);
      if (availablePrizes.length === 0) break;

      const totalWeight = availablePrizes.reduce((sum, p) => sum + p.weight, 0);
      let random = Math.random() * totalWeight;
      let selected = availablePrizes[availablePrizes.length - 1];

      for (const prize of availablePrizes) {
        if (random < prize.weight) {
          selected = prize;
          break;
        }
        random -= prize.weight;
      }

      selected.stock--;
      updatedPool.soldTickets++;

      results.push({
        id: Date.now() + i,
        prize: selected,
        ticketNumber: updatedPool.soldTickets,
      });
    }

    // 更新状态
    setPools(pools.map(p => p.id === pool.id ? updatedPool : p));
    setSelectedPool(updatedPool);
    setUserBalance(prev => prev - pool.price * times);

    Modal.alert({
      title: times === 1 ? '🎉 恭喜中奖' : '🎉 五连抽结果',
      content: (
        <div style={{ textAlign: 'center' }}>
          {results.map((r, idx) => (
            <div key={idx} style={{ margin: '8px 0', padding: '8px', background: '#f5f5f5', borderRadius: 8 }}>
              <Tag color={getLevelColor(r.prize.level)}>{r.prize.level}赏</Tag>
              <div style={{ marginTop: 4, fontWeight: 'bold' }}>{r.prize.name}</div>
              <div style={{ fontSize: 12, color: '#999' }}>券号: {r.ticketNumber}</div>
            </div>
          ))}
        </div>
      ),
      confirmText: '收下奖品',
    });

    setLoading(false);
  };

  return (
    <div className="ichiban-page">
      <NavBar
        back={<LeftOutline onClick={() => window.location.href = '/'} />}
        onBack={() => window.location.href = '/'}
      >
        一番赏
      </NavBar>

      <div className="balance-bar">
        <span>余额: ¥{userBalance}</span>
        <Button size="small" color="primary" onClick={() => setUserBalance(prev => prev + 100)}>
          +充值
        </Button>
      </div>

      {!selectedPool ? (
        <div className="pool-list">
          {pools.map(pool => (
            <Card
              key={pool.id}
              className="pool-card"
              onClick={() => setSelectedPool(pool)}
            >
              <div className="pool-header">
                <img src={pool.cover} alt={pool.name} className="pool-cover" />
                <div className="pool-info">
                  <h3>{pool.name}</h3>
                  <p className="pool-desc">{pool.description}</p>
                  <div className="pool-stats">
                    <Tag color="primary">¥{pool.price}</Tag>
                    <span className="ticket-stats">
                      剩余: {pool.totalTickets - pool.soldTickets}/{pool.totalTickets}
                    </span>
                  </div>
                </div>
              </div>
              <div className="prize-preview">
                {pool.prizes.slice(0, 4).map(prize => (
                  <div key={prize.id} className="prize-item">
                    <Badge content={prize.level} style={{ '--color': getLevelColor(prize.level) }}>
                      <img src={prize.image} alt={prize.name} />
                    </Badge>
                    <span className="prize-name">{prize.name}</span>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="pool-detail">
          <Card className="detail-header">
            <img src={selectedPool.cover} alt={selectedPool.name} className="detail-cover" />
            <h2>{selectedPool.name}</h2>
            <p>{selectedPool.description}</p>
            <div className="detail-stats">
              <Tag color="primary" fill="outline">¥{selectedPool.price}/抽</Tag>
              <span>剩余: {selectedPool.totalTickets - selectedPool.soldTickets}张</span>
            </div>
          </Card>

          <Card title="奖池内容" className="prize-list">
            <List>
              {selectedPool.prizes.map(prize => (
                <List.Item
                  key={prize.id}
                  prefix={
                    <Badge content={prize.level} style={{ '--color': getLevelColor(prize.level) }}>
                      <img src={prize.image} alt={prize.name} style={{ width: 60, height: 60, borderRadius: 8 }} />
                    </Badge>
                  }
                  extra={
                    <Tag color={prize.stock > 0 ? 'success' : 'default'}>
                      {prize.stock > 0 ? `剩${prize.stock}` : '已售罄'}
                    </Tag>
                  }
                >
                  {prize.name}
                </List.Item>
              ))}
            </List>
          </Card>

          <div className="action-buttons">
            <Space direction="vertical" block>
              <Button
                color="primary"
                size="large"
                block
                loading={loading}
                onClick={() => handleDraw(selectedPool, 1)}
                disabled={userBalance < selectedPool.price}
              >
                <FireFill /> 单抽 ¥{selectedPool.price}
              </Button>
              <Button
                color="danger"
                size="large"
                block
                loading={loading}
                onClick={() => handleDraw(selectedPool, 5)}
                disabled={userBalance < selectedPool.price * 5}
              >
                <GiftOutline /> 五连抽 ¥{selectedPool.price * 5}
              </Button>
              <Button block onClick={() => setSelectedPool(null)}>
                返回列表
              </Button>
            </Space>
          </div>
        </div>
      )}
    </div>
  );
}

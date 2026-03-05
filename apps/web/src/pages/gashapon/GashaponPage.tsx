import { useState, useEffect } from 'react';
import { NavBar, Card, Button, Toast, Tag, Modal, Space } from 'antd-mobile';
import { GiftOutline, LeftOutline } from 'antd-mobile-icons';
import './GashaponPage.css';

interface SeriesItem {
  id: string;
  name: string;
  level: string;
  weight: number;
  probability: number;
}

interface GashaponPool {
  id: string;
  name: string;
  description: string;
  cover: string;
  price: number;
  series: SeriesItem[];
}

const mockPools: GashaponPool[] = [
  {
    id: 'gashapon-1',
    name: '动漫扭蛋系列',
    description: 'SSR概率UP！包含多种热门动漫角色',
    cover: 'https://images.unsplash.com/photo-1551103782-8ab07afd45c1?w=400&h=400&fit=crop',
    price: 15,
    series: [
      { id: 's1-1', name: '传说角色', level: 'SSR', weight: 3, probability: 0.03 },
      { id: 's1-2', name: '稀有角色', level: 'SR', weight: 15, probability: 0.15 },
      { id: 's1-3', name: '普通角色', level: 'R', weight: 82, probability: 0.82 },
    ],
  },
  {
    id: 'gashapon-2',
    name: '限定扭蛋',
    description: '限时限定，UR概率翻倍！',
    cover: 'https://images.unsplash.com/photo-1608889475120-ea3e9c7b223f?w=400&h=400&fit=crop',
    price: 30,
    series: [
      { id: 's2-1', name: '超稀有', level: 'UR', weight: 2, probability: 0.02 },
      { id: 's2-2', name: '传说', level: 'SSR', weight: 8, probability: 0.08 },
      { id: 's2-3', name: '稀有', level: 'SR', weight: 30, probability: 0.30 },
      { id: 's2-4', name: '普通', level: 'R', weight: 60, probability: 0.60 },
    ],
  },
  {
    id: 'gashapon-3',
    name: '超值扭蛋',
    description: '高性价比，必得SR以上！',
    cover: 'https://images.unsplash.com/photo-1560167016-022b78a0258e?w=400&h=400&fit=crop',
    price: 50,
    series: [
      { id: 's3-1', name: '超稀有', level: 'UR', weight: 5, probability: 0.05 },
      { id: 's3-2', name: '传说', level: 'SSR', weight: 25, probability: 0.25 },
      { id: 's3-3', name: '稀有', level: 'SR', weight: 70, probability: 0.70 },
    ],
  },
];

const levelColors: Record<string, string> = {
  UR: '#ff0000',
  SSR: '#ff6b00',
  SR: '#ffb800',
  R: '#00b4d8',
  N: '#999',
};

const levelBgColors: Record<string, string> = {
  UR: 'linear-gradient(135deg, #ff0000 0%, #ff6b6b 100%)',
  SSR: 'linear-gradient(135deg, #ff6b00 0%, #ffb800 100%)',
  SR: 'linear-gradient(135deg, #ffb800 0%, #ffd700 100%)',
  R: 'linear-gradient(135deg, #00b4d8 0%, #90e0ef 100%)',
  N: 'linear-gradient(135deg, #999 0%, #ccc 100%)',
};

export default function GashaponPage() {
  const [selectedPool, setSelectedPool] = useState<GashaponPool | null>(null);
  const [loading, setLoading] = useState(false);
  const [userBalance, setUserBalance] = useState(1000);
  const [drawHistory, setDrawHistory] = useState<any[]>([]);
  const [showMachine, setShowMachine] = useState(false);

  // 从localStorage读取数据
  useEffect(() => {
    const savedBalance = localStorage.getItem('user_balance');
    const savedHistory = localStorage.getItem('gashapon_history');
    
    if (savedBalance) setUserBalance(Number(savedBalance));
    if (savedHistory) setDrawHistory(JSON.parse(savedHistory));
  }, []);

  // 保存数据
  useEffect(() => {
    localStorage.setItem('user_balance', String(userBalance));
    localStorage.setItem('gashapon_history', JSON.stringify(drawHistory));
  }, [userBalance, drawHistory]);

  const handleDraw = async (pool: GashaponPool, times: number) => {
    if (userBalance < pool.price * times) {
      Toast.show({ icon: 'fail', content: '余额不足' });
      return;
    }

    setLoading(true);
    setSelectedPool(pool);
    setShowMachine(true);

    // 模拟扭蛋机动画
    await new Promise(resolve => setTimeout(resolve, 2000));

    const results: { id: number; prize: SeriesItem; timestamp: number }[] = [];
    
    for (let i = 0; i < times; i++) {
      const totalWeight = pool.series.reduce((sum, s) => sum + s.weight, 0);
      let random = Math.random() * totalWeight;
      let selected = pool.series[pool.series.length - 1];

      for (const series of pool.series) {
        if (random < series.weight) {
          selected = series;
          break;
        }
        random -= series.weight;
      }

      results.push({
        id: Date.now() + i,
        prize: selected,
        timestamp: Date.now(),
      });
    }

    setShowMachine(false);
    setUserBalance(prev => prev - pool.price * times);
    setDrawHistory(prev => [...results, ...prev].slice(0, 50));

    // 显示结果
    Modal.alert({
      title: times === 1 ? '🎰 扭蛋结果' : '🎰 十连抽结果',
      content: (
        <div className="gashapon-results">
          {results.map((r, idx) => (
            <div
              key={idx}
              className="gashapon-result-item"
              style={{ background: levelBgColors[r.prize.level] || levelBgColors.R }}
            >
              <div className="result-level">{r.prize.level}</div>
              <div className="result-name">{r.prize.name}</div>
            </div>
          ))}
        </div>
      ),
      confirmText: '收下',
    });

    setLoading(false);
  };

  return (
    <div className="gashapon-page">
      <NavBar
        back={<LeftOutline onClick={() => window.location.href = '/'} />}
        onBack={() => window.location.href = '/'}
      >
        扭蛋机
      </NavBar>

      <div className="balance-bar">
        <span>余额: ¥{userBalance}</span>
        <Button size="small" color="primary" onClick={() => setUserBalance(prev => prev + 100)}>
          +充值
        </Button>
      </div>

      {/* 扭蛋机动画覆盖层 */}
      {showMachine && (
        <div className="machine-overlay">
          <div className="gashapon-machine">
            <div className="machine-body">
              <div className="machine-window">
                <div className="spinning-ball">🎱</div>
              </div>
              <div className="machine-handle">
                <div className={`handle ${loading ? 'spinning' : ''}`}>🎰</div>
              </div>
            </div>
            <div className="machine-text">扭蛋中...</div>
          </div>
        </div>
      )}

      {/* 奖池列表 */}
      <div className="pool-list">
        {mockPools.map(pool => (
          <Card key={pool.id} className="gashapon-pool-card">
            <div className="pool-header">
              <img src={pool.cover} alt={pool.name} className="pool-cover" />
              <div className="pool-info">
                <h3>{pool.name}</h3>
                <p className="pool-desc">{pool.description}</p>
                <Tag color="primary" fill="outline">¥{pool.price}/抽</Tag>
              </div>
            </div>

            <div className="probability-table">
              <div className="table-header">
                <span>稀有度</span>
                <span>概率</span>
              </div>
              {pool.series.map(s => (
                <div key={s.id} className="table-row">
                  <Tag
                    color={levelColors[s.level] || '#999'}
                    style={{ padding: '2px 8px' }}
                  >
                    {s.level}
                  </Tag>
                  <span className="probability">{(s.probability * 100).toFixed(0)}%</span>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 12 }}>
              <Space direction="vertical" block>
                <Button
                  color="primary"
                  size="large"
                  block
                  loading={loading && selectedPool?.id === pool.id}
                  onClick={() => handleDraw(pool, 1)}
                  disabled={userBalance < pool.price}
                >
                  <GiftOutline /> 单抽 ¥{pool.price}
                </Button>
                <Button
                  color="danger"
                  size="large"
                  block
                  loading={loading && selectedPool?.id === pool.id}
                  onClick={() => handleDraw(pool, 10)}
                  disabled={userBalance < pool.price * 10}
                >
                  十连抽 ¥{pool.price * 10}
                </Button>
              </Space>
            </div>
          </Card>
        ))}
      </div>

      {/* 抽取历史 */}
      {drawHistory.length > 0 && (
        <Card title="抽取记录" className="history-card">
          <div className="history-grid">
            {drawHistory.slice(0, 20).map((item, idx) => (
              <div
                key={idx}
                className="history-badge"
                style={{ background: levelBgColors[item.prize.level] || levelBgColors.R }}
              >
                {item.prize.level}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import { NavBar, Card, Button, Toast, ProgressBar, Tag, Modal, Grid } from 'antd-mobile';
import { FireFill, GiftOutline, LeftOutline } from 'antd-mobile-icons';
import './TowerPage.css';

interface Floor {
  floor: number;
  prize: string;
  difficulty: number;
}

interface TowerPool {
  id: string;
  name: string;
  description: string;
  cover: string;
  price: number;
  maxFloors: number;
  floors: Floor[];
}

const mockTower: TowerPool = {
  id: 'tower-1',
  name: '无尽爬塔挑战',
  description: '挑战100层，赢取终极大奖！每10层有大奖，爬得越高奖励越好',
  cover: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=400&h=400&fit=crop',
  price: 10,
  maxFloors: 100,
  floors: Array.from({ length: 100 }, (_, i) => ({
    floor: i + 1,
    prize: i % 10 === 0 ? `第${i + 1}层大奖` : `第${i + 1}层奖励`,
    difficulty: Math.min(Math.floor(i / 10) + 1, 10),
  })),
};

export default function TowerPage() {
  const [currentFloor, setCurrentFloor] = useState(1);
  const [climbing, setClimbing] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [userBalance, setUserBalance] = useState(1000);
  const [showAnimation, setShowAnimation] = useState(false);

  // 从localStorage读取数据
  useEffect(() => {
    const savedBalance = localStorage.getItem('user_balance');
    const savedFloor = localStorage.getItem('tower_current_floor');
    const savedHistory = localStorage.getItem('tower_history');
    
    if (savedBalance) setUserBalance(Number(savedBalance));
    if (savedFloor) setCurrentFloor(Number(savedFloor));
    if (savedHistory) setHistory(JSON.parse(savedHistory));
  }, []);

  // 保存数据到localStorage
  useEffect(() => {
    localStorage.setItem('user_balance', String(userBalance));
    localStorage.setItem('tower_current_floor', String(currentFloor));
    localStorage.setItem('tower_history', JSON.stringify(history));
  }, [userBalance, currentFloor, history]);

  const handleClimb = async () => {
    if (userBalance < mockTower.price) {
      Toast.show({ icon: 'fail', content: '余额不足' });
      return;
    }

    setClimbing(true);
    setShowAnimation(true);

    // 模拟攀爬动画
    await new Promise(resolve => setTimeout(resolve, 1500));

    // 60%成功率
    const isSuccess = Math.random() > 0.4;
    const floorData = mockTower.floors[currentFloor - 1];
    
    const result = {
      success: isSuccess,
      floor: currentFloor,
      prize: isSuccess ? floorData.prize : null,
      isGrandPrize: currentFloor % 10 === 0 && isSuccess,
      timestamp: Date.now(),
    };

    setShowAnimation(false);

    if (isSuccess) {
      setHistory(prev => [result, ...prev].slice(0, 20));
      if (currentFloor < mockTower.maxFloors) {
        setCurrentFloor(prev => prev + 1);
      }
      
      Modal.alert({
        title: result.isGrandPrize ? '🏆 大奖获得！' : '🎉 挑战成功！',
        content: (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>
              {result.isGrandPrize ? '🏆' : '⭐'}
            </div>
            <p>成功攀登第{result.floor}层</p>
            <Tag color={result.isGrandPrize ? 'warning' : 'success'}>
              获得: {result.prize}
            </Tag>
            {currentFloor < mockTower.maxFloors && (
              <p style={{ marginTop: 12, color: '#666' }}>
                下一层难度: {'⭐'.repeat(Math.min(floorData.difficulty + 1, 5))}
              </p>
            )}
          </div>
        ),
        confirmText: '继续挑战',
      });
    } else {
      Modal.alert({
        title: '💔 挑战失败',
        content: (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>😢</div>
            <p>第{currentFloor}层挑战失败</p>
            <p style={{ color: '#999', fontSize: 14 }}>别灰心，再试一次！</p>
          </div>
        ),
        confirmText: '再次挑战',
      });
    }

    setUserBalance(prev => prev - mockTower.price);
    setClimbing(false);
  };

  const getDifficultyStars = (difficulty: number) => {
    return '⭐'.repeat(Math.min(difficulty, 5));
  };

  const getFloorColor = (floor: number) => {
    if (floor % 10 === 0) return '#ff4d4f'; // 大奖层
    if (floor % 5 === 0) return '#ffa940';  // 特殊层
    return '#1677ff';
  };

  return (
    <div className="tower-page">
      <NavBar
        back={<LeftOutline onClick={() => window.location.href = '/'} />}
        onBack={() => window.location.href = '/'}
      >
        爬塔挑战
      </NavBar>

      <div className="balance-bar">
        <span>余额: ¥{userBalance}</span>
        <Button size="small" color="primary" onClick={() => setUserBalance(prev => prev + 100)}>
          +充值
        </Button>
      </div>

      {/* 当前楼层展示 */}
      <Card className="current-floor-card">
        <div className="floor-display">
          <div className="floor-number">{currentFloor}</div>
          <div className="floor-label">当前楼层</div>
        </div>
        <div className="floor-progress">
          <ProgressBar
            percent={(currentFloor / mockTower.maxFloors) * 100}
            text={`${currentFloor}/${mockTower.maxFloors}`}
          />
        </div>
        <div className="next-prize">
          <GiftOutline /> 下一层奖励: {mockTower.floors[currentFloor - 1]?.prize}
        </div>
      </Card>

      {/* 爬塔动画 */}
      {showAnimation && (
        <div className="climb-animation">
          <div className="climbing-icon">🧗</div>
          <div className="climbing-text">正在攀登...</div>
        </div>
      )}

      {/* 操作按钮 */}
      <div className="action-section">
        <Card>
          <div className="difficulty-info">
            <span>当前难度:</span>
            <span className="stars">
              {getDifficultyStars(mockTower.floors[currentFloor - 1]?.difficulty || 1)}
            </span>
          </div>
          <div style={{ marginTop: 12 }}>
            <Button
              color="primary"
              size="large"
              block
              loading={climbing}
              onClick={handleClimb}
              disabled={userBalance < mockTower.price || currentFloor > mockTower.maxFloors}
            >
              <FireFill /> 挑战第{currentFloor}层 (¥{mockTower.price})
            </Button>
            {currentFloor > 1 && (
              <Button block style={{ marginTop: 8 }} onClick={() => setCurrentFloor(1)}>
                重新开始
              </Button>
            )}
          </div>
        </Card>
      </div>

      {/* 楼层预览 */}
      <Card title="楼层预览" className="floor-preview">
        <Grid columns={5} gap={8}>
          {mockTower.floors.slice(Math.max(0, currentFloor - 3), Math.min(mockTower.maxFloors, currentFloor + 12)).map(floor => (
            <div
              key={floor.floor}
              className={`floor-item ${floor.floor === currentFloor ? 'current' : ''} ${floor.floor < currentFloor ? 'passed' : ''}`}
              style={{ '--floor-color': getFloorColor(floor.floor) } as any}
            >
              <div className="floor-item-number">{floor.floor}</div>
              {floor.floor % 10 === 0 && <div className="floor-badge">奖</div>}
            </div>
          ))}
        </Grid>
      </Card>

      {/* 挑战历史 */}
      {history.length > 0 && (
        <Card title="挑战记录" className="history-card">
          <div className="history-list">
            {history.slice(0, 10).map((item, idx) => (
              <div key={idx} className={`history-item ${item.success ? 'success' : 'fail'}`}>
                <span className="history-floor">第{item.floor}层</span>
                <span className="history-result">
                  {item.success ? (item.isGrandPrize ? '🏆 大奖' : '✅ 成功') : '❌ 失败'}
                </span>
                {item.prize && <span className="history-prize">{item.prize}</span>}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

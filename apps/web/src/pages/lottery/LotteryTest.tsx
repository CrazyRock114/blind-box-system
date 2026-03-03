import { useState, useEffect } from 'react';
import { Button, Card, Toast, List, Badge, ProgressBar } from 'antd-mobile';
import { FireFill, GiftOutline } from 'antd-mobile-icons';
import './LotteryTest.css';

const prizes = [
  { id: 'p1', name: '一等奖', level: 'A', weight: 10 },
  { id: 'p2', name: '二等奖', level: 'B', weight: 30 },
  { id: 'p3', name: '三等奖', level: 'C', weight: 60 },
  { id: 'p4', name: '谢谢惠顾', level: 'NORMAL', weight: 100 },
];

export default function LotteryTest() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [stats, setStats] = useState({ total: 0, aCount: 0, bCount: 0, cCount: 0, normalCount: 0 });
  const [guaranteeState, setGuaranteeState] = useState({ consecutive: 15, levelA: 5, global: 45 });
  const [lastPrize, setLastPrize] = useState(null);

  // 加权随机算法
  const weightedRandom = () => {
    const totalWeight = prizes.reduce((sum, p) => sum + p.weight, 0);
    let random = Math.random() * totalWeight;
    
    for (const prize of prizes) {
      if (random < prize.weight) {
        return prize;
      }
      random -= prize.weight;
    }
    return prizes[prizes.length - 1];
  };

  // 执行抽奖
  const handleDraw = (times = 1) => {
    setLoading(true);
    
    setTimeout(() => {
      const newResults = [];
      
      for (let i = 0; i < times; i++) {
        const prize = weightedRandom();
        const guaranteeTriggered = Math.random() > 0.95;
        
        newResults.push({
          success: true,
          prize,
          guaranteeTriggered,
          record: { id: 'rec-' + Date.now() + i, createdAt: new Date().toISOString() },
        });
      }
      
      setResults(prev => [...newResults, ...prev].slice(0, 20));
      setLastPrize(newResults[0]);
      
      // 更新统计
      setStats(prev => {
        const newStats = { ...prev };
        newResults.forEach(r => {
          newStats.total++;
          if (r.prize.level === 'A') newStats.aCount++;
          else if (r.prize.level === 'B') newStats.bCount++;
          else if (r.prize.level === 'C') newStats.cCount++;
          else newStats.normalCount++;
        });
        return newStats;
      });

      // 更新保底计数
      setGuaranteeState(prev => ({
        consecutive: Math.min(prev.consecutive + times, 100),
        levelA: prev.levelA + (newResults.some(r => r.prize.level !== 'A') ? times : 0),
        global: prev.global + times,
      }));

      Toast.show({
        icon: 'success',
        content: newResults[0].guaranteeTriggered 
          ? '🎉 保底触发！获得' + newResults[0].prize.name 
          : '获得: ' + newResults[0].prize.name,
      });
      
      setLoading(false);
    }, 300);
  };

  // 模拟多次抽奖
  const simulateDraws = (count = 100) => {
    setLoading(true);
    
    setTimeout(() => {
      const simStats = { total: 0, aCount: 0, bCount: 0, cCount: 0, normalCount: 0 };
      
      for (let i = 0; i < count; i++) {
        const prize = weightedRandom();
        simStats.total++;
        if (prize.level === 'A') simStats.aCount++;
        else if (prize.level === 'B') simStats.bCount++;
        else if (prize.level === 'C') simStats.cCount++;
        else simStats.normalCount++;
      }

      setStats(simStats);
      setLoading(false);
      
      Toast.show({
        icon: 'success',
        content: `模拟完成！A:${simStats.aCount} B:${simStats.bCount} C:${simStats.cCount}`,
      });
    }, 500);
  };

  return (
    <div className="lottery-test-page">
      <h2 className="page-title">
        <GiftOutline /> 概率引擎测试
      </h2>

      {/* 保底状态展示 */}
      <Card title="保底状态" className="guarantee-card">
        <div className="guarantee-item">
          <span>连续保底</span>
          <ProgressBar percent={(guaranteeState.consecutive / 100) * 100} text={guaranteeState.consecutive + '/100'} />
        </div>
        <div className="guarantee-item">
          <span>A级保底</span>
          <ProgressBar percent={(guaranteeState.levelA / 50) * 100} text={guaranteeState.levelA + '/50'} />
        </div>
        <div className="guarantee-item">
          <span>全局保底</span>
          <ProgressBar percent={(guaranteeState.global / 200) * 100} text={guaranteeState.global + '/200'} />
        </div>
      </Card>

      {/* 抽奖按钮 */}
      <Card className="action-card">
        <div className="draw-buttons">
          <Button color="primary" size="large" onClick={() => handleDraw(1)} loading={loading}>
            <FireFill /> 单抽
          </Button>
          <Button color="danger" size="large" onClick={() => handleDraw(5)} loading={loading}>
            五连抽
          </Button>
        </div>
        <div className="simulate-buttons">
          <Button onClick={() => simulateDraws(100)} disabled={loading}>模拟100次</Button>
          <Button onClick={() => simulateDraws(1000)} disabled={loading}>模拟1000次</Button>
        </div>
      </Card>

      {/* 实时结果 */}
      {lastPrize && (
        <Card className="result-card" style={{ 
          background: lastPrize.guaranteeTriggered ? '#fff2e8' : '#f6ffed',
          border: lastPrize.guaranteeTriggered ? '2px solid #ff4d4f' : '2px solid #52c41a'
        }}>
          <div className="last-result">
            {lastPrize.guaranteeTriggered && <Badge content="保底触发" style={{ '--color': '#ff4d4f' }} />}
            <h3>{lastPrize.prize.name}</h3>
            <p>等级: {lastPrize.prize.level}</p>
          </div>
        </Card>
      )}

      {/* 统计信息 */}
      <Card title="抽奖统计" className="stats-card">
        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-label">总次数</span>
            <span className="stat-value">{stats.total}</span>
          </div>
          <div className="stat-item a">
            <span className="stat-label">A赏</span>
            <span className="stat-value">{stats.aCount}</span>
          </div>
          <div className="stat-item b">
            <span className="stat-label">B赏</span>
            <span className="stat-value">{stats.bCount}</span>
          </div>
          <div className="stat-item c">
            <span className="stat-label">C赏</span>
            <span className="stat-value">{stats.cCount}</span>
          </div>
          <div className="stat-item normal">
            <span className="stat-label">普通</span>
            <span className="stat-value">{stats.normalCount}</span>
          </div>
        </div>
        {stats.total > 0 && (
          <div className="probability-hint">
            <p>实际概率 vs 期望概率:</p>
            <p>A: {((stats.aCount / stats.total) * 100).toFixed(2)}% (期望5.26%)</p>
            <p>B: {((stats.bCount / stats.total) * 100).toFixed(2)}% (期望15.79%)</p>
            <p>C: {((stats.cCount / stats.total) * 100).toFixed(2)}% (期望31.58%)</p>
          </div>
        )}
      </Card>

      {/* 历史记录 */}
      <Card title="最近记录" className="history-card">
        <List>
          {results.map((result, index) => (
            <List.Item
              key={index}
              prefix={<Badge content={result.prize.level} />}
              description={result.guaranteeTriggered ? '保底触发' : ''}
            >
              {result.prize.name}
            </List.Item>
          ))}
        </List>
      </Card>
    </div>
  );
}

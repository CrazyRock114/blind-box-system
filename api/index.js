// Vercel Serverless API - 盲盒系统概率引擎
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// ===== 内存数据存储 (Mock数据) =====
const mockData = {
  // 用户数据
  users: [
    { id: 'user_001', username: 'test_user', balance: 1000, luckyCoins: 50, createdAt: new Date() }
  ],
  
  // 盲盒池
  boxPools: [
    {
      id: 'box_001',
      name: '新手盲盒',
      description: '新手入门首选，高性价比',
      price: 10,
      type: 'normal',
      status: 'active',
      useLuckyCoin: false,
      image: 'https://via.placeholder.com/300x200/4CAF50/ffffff?text=新手盲盒'
    },
    {
      id: 'box_002', 
      name: '高级盲盒',
      description: '稀有物品掉落率更高',
      price: 50,
      type: 'normal',
      status: 'active',
      useLuckyCoin: true,
      image: 'https://via.placeholder.com/300x200/9C27B0/ffffff?text=高级盲盒'
    },
    {
      id: 'box_003',
      name: '一番赏-海贼王',
      description: 'Last赏特别版手办',
      price: 68,
      type: 'ichiban',
      status: 'active',
      totalTickets: 100,
      soldTickets: 23,
      lastPrizeId: 'prize_last_001',
      image: 'https://via.placeholder.com/300x200/FF5722/ffffff?text=一番赏'
    },
    {
      id: 'box_004',
      name: '爬塔挑战',
      description: '越高层奖励越丰厚',
      price: 30,
      type: 'tower',
      status: 'active',
      maxFloors: 10,
      image: 'https://via.placeholder.com/300x200/2196F3/ffffff?text=爬塔'
    }
  ],
  
  // 奖品数据
  prizes: {
    'box_001': [
      { id: 'p_001_1', name: '普通徽章', level: 'N', weight: 50, stock: 1000, image: '🏷️', value: 5 },
      { id: 'p_001_2', name: '精美贴纸', level: 'N', weight: 30, stock: 800, image: '🎨', value: 10 },
      { id: 'p_001_3', name: '钥匙扣', level: 'R', weight: 15, stock: 500, image: '🔑', value: 25 },
      { id: 'p_001_4', name: '手办小模型', level: 'SR', weight: 4, stock: 100, image: '🎎', value: 50 },
      { id: 'p_001_5', name: '限定手办', level: 'SSR', weight: 1, stock: 20, image: '👑', value: 200 }
    ],
    'box_002': [
      { id: 'p_002_1', name: '徽章套装', level: 'R', weight: 40, stock: 500, image: '🎁', value: 30 },
      { id: 'p_002_2', name: '限量钥匙扣', level: 'SR', weight: 35, stock: 300, image: '💎', value: 60 },
      { id: 'p_002_3', name: '精美手办', level: 'SSR', weight: 20, stock: 80, image: '🏆', value: 150 },
      { id: 'p_002_4', name: '超级隐藏款', level: 'UR', weight: 5, stock: 10, image: '👑', value: 500 }
    ],
    'box_003': [
      { id: 'p_003_1', name: 'G赏-徽章', level: 'G', weight: 1, stock: 30, image: '🥉', value: 25 },
      { id: 'p_003_2', name: 'F赏-钥匙扣', level: 'F', weight: 1, stock: 25, image: '🥈', value: 35 },
      { id: 'p_003_3', name: 'E赏-杯子', level: 'E', weight: 1, stock: 20, image: '🏅', value: 50 },
      { id: 'p_003_4', name: 'D赏-毛巾', level: 'D', weight: 1, stock: 15, image: '🎖️', value: 80 },
      { id: 'p_003_5', name: 'C赏-手办', level: 'C', weight: 1, stock: 6, image: '🏆', value: 200 },
      { id: 'p_003_6', name: 'B赏-大手办', level: 'B', weight: 1, stock: 3, image: '👑', value: 400 },
      { id: 'p_003_7', name: 'A赏-限定手办', level: 'A', weight: 1, stock: 1, image: '🌟', value: 800 },
      { id: 'prize_last_001', name: 'Last赏-终极版', level: 'LAST', weight: 0, stock: 1, image: '💎', value: 1000 }
    ],
    'box_004': [
      { id: 'p_004_1', name: '1层奖励', level: '1F', weight: 50, stock: 999, image: '1️⃣', value: 10, floor: 1 },
      { id: 'p_004_2', name: '2层奖励', level: '2F', weight: 40, stock: 500, image: '2️⃣', value: 20, floor: 2 },
      { id: 'p_004_3', name: '3层奖励', level: '3F', weight: 30, stock: 300, image: '3️⃣', value: 35, floor: 3 },
      { id: 'p_004_4', name: '5层奖励', level: '5F', weight: 20, stock: 150, image: '5️⃣', value: 60, floor: 5 },
      { id: 'p_004_5', name: '8层奖励', level: '8F', weight: 10, stock: 50, image: '8️⃣', value: 120, floor: 8 },
      { id: 'p_004_6', name: '10层大奖', level: '10F', weight: 5, stock: 10, image: '🔟', value: 300, floor: 10 }
    ]
  },
  
  // 抽奖记录
  lotteryRecords: [],
  
  // 用户爬塔进度
  userTowerProgress: {}
};

// ===== 抽奖引擎 =====

/**
 * 权重抽奖算法
 */
function weightedLottery(prizes) {
  const availablePrizes = prizes.filter(p => p.stock > 0);
  if (availablePrizes.length === 0) return null;
  
  const totalWeight = availablePrizes.reduce((sum, p) => sum + p.weight, 0);
  let random = Math.random() * totalWeight;
  
  for (const prize of availablePrizes) {
    if (random < prize.weight) {
      return prize;
    }
    random -= prize.weight;
  }
  
  return availablePrizes[availablePrizes.length - 1];
}

/**
 * 一番赏抽奖
 */
function ichibanLottery(boxPool, prizes) {
  const availablePrizes = prizes.filter(p => p.stock > 0 && p.level !== 'LAST');
  if (availablePrizes.length === 0) return null;
  
  // 判断是否Last赏
  const isLastTicket = boxPool.soldTickets + 1 >= boxPool.totalTickets - 1;
  
  if (isLastTicket) {
    const lastPrize = prizes.find(p => p.level === 'LAST');
    if (lastPrize && lastPrize.stock > 0) return lastPrize;
  }
  
  // 随机抽取
  const randomIndex = Math.floor(Math.random() * availablePrizes.length);
  return availablePrizes[randomIndex];
}

/**
 * 爬塔抽奖
 */
function towerLottery(boxPool, prizes, currentFloor) {
  const availablePrizes = prizes.filter(p => p.stock > 0);
  if (availablePrizes.length === 0) return { prize: null, isClimbSuccess: false };
  
  // 根据层数计算成功率
  const successRate = Math.max(0.1, 1 - (currentFloor / boxPool.maxFloors) * 0.8);
  const isClimbSuccess = Math.random() < successRate;
  
  if (!isClimbSuccess) {
    return { prize: null, isClimbSuccess: false, newFloor: 1 };
  }
  
  // 爬塔成功，抽取奖品
  const prize = weightedLottery(availablePrizes);
  const newFloor = Math.min(currentFloor + 1, boxPool.maxFloors);
  
  return { prize, isClimbSuccess: true, newFloor };
}

// ===== API路由 =====

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ code: 200, data: { status: 'ok', version: '1.0.0', env: 'vercel' } });
});

// 获取盲盒列表
app.get('/api/boxes', (req, res) => {
  const boxes = mockData.boxPools.map(box => ({
    ...box,
    prizes: undefined
  }));
  res.json({ code: 200, data: boxes });
});

// 获取盲盒详情
app.get('/api/boxes/:id', (req, res) => {
  const box = mockData.boxPools.find(b => b.id === req.params.id);
  if (!box) {
    return res.status(404).json({ code: 404, message: '盲盒不存在' });
  }
  
  const prizes = mockData.prizes[box.id] || [];
  res.json({ 
    code: 200, 
    data: { 
      ...box, 
      prizes: prizes.map(p => ({ ...p, stock: p.stock > 0 ? '有库存' : '售罄' }))
    } 
  });
});

// 抽奖接口
app.post('/api/lottery/draw', (req, res) => {
  const { boxPoolId, times = 1, userId = 'user_001' } = req.body;
  
  const boxPool = mockData.boxPools.find(b => b.id === boxPoolId);
  if (!boxPool) {
    return res.status(404).json({ code: 404, message: '盲盒不存在' });
  }
  
  if (boxPool.status !== 'active') {
    return res.status(400).json({ code: 400, message: '盲盒未上架' });
  }
  
  const prizes = mockData.prizes[boxPoolId] || [];
  const results = [];
  
  for (let i = 0; i < times; i++) {
    let result;
    
    switch (boxPool.type) {
      case 'ichiban':
        result = ichibanLottery(boxPool, prizes);
        if (result) {
          result.stock--;
          boxPool.soldTickets++;
        }
        break;
        
      case 'tower':
        const currentFloor = mockData.userTowerProgress[userId] || 1;
        const towerResult = towerLottery(boxPool, prizes, currentFloor);
        result = towerResult.prize;
        mockData.userTowerProgress[userId] = towerResult.newFloor;
        if (result) result.stock--;
        break;
        
      default: // normal
        result = weightedLottery(prizes);
        if (result) result.stock--;
    }
    
    if (result) {
      // 创建记录
      const record = {
        id: `rec_${Date.now()}_${i}`,
        userId,
        boxPoolId,
        prizeId: result.id,
        prizeName: result.name,
        prizeLevel: result.level,
        prizeImage: result.image,
        costAmount: boxPool.price,
        createdAt: new Date()
      };
      mockData.lotteryRecords.unshift(record);
      
      results.push({
        prizeId: result.id,
        name: result.name,
        level: result.level,
        image: result.image,
        value: result.value
      });
    } else {
      results.push({ error: '奖品已售罄' });
    }
  }
  
  res.json({
    code: 200,
    data: {
      results,
      times,
      totalCost: boxPool.price * times,
      currentFloor: mockData.userTowerProgress[userId]
    },
    message: '抽奖成功'
  });
});

// 获取抽奖历史
app.get('/api/lottery/history', (req, res) => {
  const { userId = 'user_001', page = 1, limit = 20 } = req.query;
  
  const userRecords = mockData.lotteryRecords.filter(r => r.userId === userId);
  const start = (page - 1) * limit;
  const end = start + parseInt(limit);
  
  res.json({
    code: 200,
    data: userRecords.slice(start, end),
    meta: {
      total: userRecords.length,
      page: parseInt(page),
      limit: parseInt(limit)
    }
  });
});

// 获取概率公示
app.get('/api/lottery/probability/:boxId', (req, res) => {
  const prizes = mockData.prizes[req.params.boxId] || [];
  const totalWeight = prizes.reduce((sum, p) => sum + p.weight, 0);
  
  const probabilities = prizes.map(p => ({
    name: p.name,
    level: p.level,
    probability: ((p.weight / totalWeight) * 100).toFixed(2) + '%',
    stock: p.stock
  }));
  
  res.json({ code: 200, data: probabilities });
});

// 用户钱包
app.get('/api/wallet', (req, res) => {
  const { userId = 'user_001' } = req.query;
  const user = mockData.users.find(u => u.id === userId);
  
  if (!user) {
    return res.status(404).json({ code: 404, message: '用户不存在' });
  }
  
  res.json({
    code: 200,
    data: {
      balance: user.balance,
      luckyCoins: user.luckyCoins
    }
  });
});

// Vercel Serverless export
module.exports = app;

// 本地开发启动
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`🚀 API Server running on http://localhost:${PORT}`);
  });
}

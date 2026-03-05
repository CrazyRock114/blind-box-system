import type { MockMethod } from 'vite-plugin-mock';

// 一番赏奖池数据
const ichibanPools = [
  {
    id: 'ichiban-1',
    name: '海贼王一番赏',
    description: 'A赏：路飞手办，B赏：索隆手办，C赏：娜美手办，D赏：乔巴手办',
    cover: 'https://images.unsplash.com/photo-1618336753974-aae8e04506aa?w=400&h=400&fit=crop',
    type: 'ichiban',
    price: 58,
    status: 'active',
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
    description: 'A赏：炭治郎手办，B赏：祢豆子手办，Last赏：特别版手办',
    cover: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400&h=400&fit=crop',
    type: 'ichiban',
    price: 68,
    status: 'active',
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

// 爬塔关卡数据
const towerPools = [
  {
    id: 'tower-1',
    name: '无尽爬塔挑战',
    description: '挑战100层，赢取终极大奖！每10层有大奖，爬得越高奖励越好',
    cover: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=400&h=400&fit=crop',
    type: 'tower',
    price: 10,
    status: 'active',
    maxFloors: 100,
    currentFloor: 1,
    floors: Array.from({ length: 100 }, (_, i) => ({
      floor: i + 1,
      prize: i % 10 === 0 ? `第${i + 1}层大奖` : `第${i + 1}层奖励`,
      difficulty: Math.min(Math.floor(i / 10) + 1, 10),
    })),
  },
];

// 扭蛋机数据
const gashaponPools = [
  {
    id: 'gashapon-1',
    name: '动漫扭蛋系列',
    description: 'SSR概率UP！包含多种热门动漫角色',
    cover: 'https://images.unsplash.com/photo-1551103782-8ab07afd45c1?w=400&h=400&fit=crop',
    type: 'gashapon',
    price: 15,
    status: 'active',
    series: [
      { id: 's1-1', name: 'SSR-传说角色', level: 'SSR', weight: 3, probability: 0.03 },
      { id: 's1-2', name: 'SR-稀有角色', level: 'SR', weight: 15, probability: 0.15 },
      { id: 's1-3', name: 'R-普通角色', level: 'R', weight: 82, probability: 0.82 },
    ],
  },
  {
    id: 'gashapon-2',
    name: '限定扭蛋',
    description: '限时限定，UR概率翻倍！',
    cover: 'https://images.unsplash.com/photo-1608889475120-ea3e9c7b223f?w=400&h=400&fit=crop',
    type: 'gashapon',
    price: 30,
    status: 'active',
    series: [
      { id: 's2-1', name: 'UR-超稀有', level: 'UR', weight: 2, probability: 0.02 },
      { id: 's2-2', name: 'SSR-传说', level: 'SSR', weight: 8, probability: 0.08 },
      { id: 's2-3', name: 'SR-稀有', level: 'SR', weight: 30, probability: 0.30 },
      { id: 's2-4', name: 'R-普通', level: 'R', weight: 60, probability: 0.60 },
    ],
  },
];

// 用户数据（模拟）
let userData = {
  id: 'user-1',
  username: 'testuser',
  nickname: '测试用户',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop',
  balance: 1000,
  luckyCoin: 50,
  points: 500,
};

// 抽奖历史
let lotteryHistory: any[] = [];

export default [
  // 获取盲盒列表
  {
    url: '/api/box-pools',
    method: 'get',
    response: () => {
      return {
        code: 200,
        data: [...ichibanPools, ...towerPools, ...gashaponPools],
      };
    },
  },
  
  // 获取单个盲盒详情
  {
    url: '/api/box-pools/:id',
    method: 'get',
    response: ({ query }: any) => {
      const id = query.id;
      const allPools = [...ichibanPools, ...towerPools, ...gashaponPools];
      const pool = allPools.find(p => p.id === id);
      return {
        code: 200,
        data: pool || null,
      };
    },
  },
  
  // 获取用户信息
  {
    url: '/api/user/profile',
    method: 'get',
    response: () => {
      return {
        code: 200,
        data: userData,
      };
    },
  },
  
  // 更新用户积分（模拟）
  {
    url: '/api/user/update-balance',
    method: 'post',
    response: ({ body }: any) => {
      if (body.balance !== undefined) {
        userData.balance = body.balance;
      }
      if (body.points !== undefined) {
        userData.points = body.points;
      }
      if (body.luckyCoin !== undefined) {
        userData.luckyCoin = body.luckyCoin;
      }
      return {
        code: 200,
        data: userData,
      };
    },
  },
  
  // 一番赏抽奖API
  {
    url: '/api/lottery/ichiban/:poolId/draw',
    method: 'post',
    response: ({ body, query }: any) => {
      const poolId = query.poolId;
      const pool = ichibanPools.find(p => p.id === poolId);
      
      if (!pool) {
        return { code: 404, message: '奖池不存在' };
      }
      
      const times = body.times || 1;
      const results = [];
      
      for (let i = 0; i < times; i++) {
        // 加权随机
        const availablePrizes = pool.prizes.filter((p: any) => p.stock > 0);
        if (availablePrizes.length === 0) break;
        
        const totalWeight = availablePrizes.reduce((sum: number, p: any) => sum + p.weight, 0);
        let random = Math.random() * totalWeight;
        let selected = availablePrizes[availablePrizes.length - 1];
        
        for (const prize of availablePrizes) {
          if (random < prize.weight) {
            selected = prize;
            break;
          }
          random -= prize.weight;
        }
        
        // 减少库存
        selected.stock--;
        pool.soldTickets++;
        
        const result = {
          id: 'rec-' + Date.now() + '-' + i,
          prize: selected,
          ticketNumber: pool.soldTickets,
          createdAt: new Date().toISOString(),
        };
        
        results.push(result);
        lotteryHistory.unshift(result);
      }
      
      // 扣除余额
      userData.balance -= pool.price * times;
      userData.points += 10 * times;
      
      return {
        code: 200,
        data: results,
        message: '抽奖成功',
      };
    },
  },
  
  // 爬塔挑战API
  {
    url: '/api/lottery/tower/:poolId/climb',
    method: 'post',
    response: ({ body, query }: any) => {
      const poolId = query.poolId;
      const pool = towerPools.find(p => p.id === poolId);
      
      if (!pool) {
        return { code: 404, message: '奖池不存在' };
      }
      
      const currentFloor = body.currentFloor || 1;
      const isClimbSuccess = Math.random() > 0.4; // 60%成功率
      
      let prize = null;
      if (isClimbSuccess) {
        const floorData = pool.floors[currentFloor - 1];
        prize = {
          name: floorData.prize,
          floor: currentFloor,
          isGrandPrize: currentFloor % 10 === 0,
        };
        
        lotteryHistory.unshift({
          id: 'tower-' + Date.now(),
          prize,
          type: 'tower',
          createdAt: new Date().toISOString(),
        });
      }
      
      // 扣除余额
      userData.balance -= pool.price;
      userData.points += 5;
      
      return {
        code: 200,
        data: {
          success: isClimbSuccess,
          prize,
          nextFloor: isClimbSuccess ? currentFloor + 1 : currentFloor,
          currentFloor: isClimbSuccess ? currentFloor + 1 : currentFloor,
        },
        message: isClimbSuccess ? '挑战成功！' : '挑战失败，再试一次',
      };
    },
  },
  
  // 扭蛋抽奖API
  {
    url: '/api/lottery/gashapon/:poolId/draw',
    method: 'post',
    response: ({ body, query }: any) => {
      const poolId = query.poolId;
      const pool = gashaponPools.find(p => p.id === poolId);
      
      if (!pool) {
        return { code: 404, message: '奖池不存在' };
      }
      
      const times = body.times || 1;
      const results = [];
      
      for (let i = 0; i < times; i++) {
        // 加权随机
        const totalWeight = pool.series.reduce((sum: number, s: any) => sum + s.weight, 0);
        let random = Math.random() * totalWeight;
        let selected = pool.series[pool.series.length - 1];
        
        for (const series of pool.series) {
          if (random < series.weight) {
            selected = series;
            break;
          }
          random -= series.weight;
        }
        
        const result = {
          id: 'gashapon-' + Date.now() + '-' + i,
          prize: selected,
          createdAt: new Date().toISOString(),
        };
        
        results.push(result);
        lotteryHistory.unshift(result);
      }
      
      // 扣除余额
      userData.balance -= pool.price * times;
      userData.points += 8 * times;
      
      return {
        code: 200,
        data: results,
        message: '扭蛋成功',
      };
    },
  },
  
  // 获取保底状态
  {
    url: '/api/lottery/guarantee/:userId/:boxPoolId',
    method: 'get',
    response: () => {
      return {
        code: 200,
        data: {
          consecutive: { consecutiveCount: 15, triggered: false },
          level: { levelCounts: { A: 5, B: 3, C: 0 }, triggered: false },
          global: { consecutiveCount: 45, triggered: false },
        },
      };
    },
  },
  
  // 抽奖历史
  {
    url: '/api/lottery/history',
    method: 'get',
    response: () => {
      return {
        code: 200,
        data: lotteryHistory.slice(0, 50),
        meta: { total: lotteryHistory.length, page: 1 },
      };
    },
  },
] as MockMethod[];

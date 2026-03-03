import type { MockMethod } from 'vite-plugin-mock';

export default [
  // 获取盲盒列表
  {
    url: '/api/box-pools',
    method: 'get',
    response: () => {
      return {
        code: 200,
        data: [
          {
            id: '1',
            name: '测试一番赏',
            description: 'A赏大奖等你拿',
            cover: 'https://picsum.photos/200/200?random=1',
            type: 'ichiban',
            price: 58,
            status: 'active',
            totalTickets: 100,
            soldTickets: 23,
          },
          {
            id: '2',
            name: '概率测试盲盒',
            description: '测试加权随机算法',
            cover: 'https://picsum.photos/200/200?random=2',
            type: 'normal',
            price: 10,
            status: 'active',
          },
        ],
      };
    },
  },
  
  // 抽奖API
  {
    url: '/api/lottery/draw',
    method: 'post',
    response: () => {
      const prizes = [
        { id: 'p1', name: '一等奖', level: 'A', weight: 10 },
        { id: 'p2', name: '二等奖', level: 'B', weight: 30 },
        { id: 'p3', name: '三等奖', level: 'C', weight: 60 },
        { id: 'p4', name: '谢谢惠顾', level: 'NORMAL', weight: 100 },
      ];
      
      // 加权随机
      const totalWeight = prizes.reduce((sum, p) => sum + p.weight, 0);
      let random = Math.random() * totalWeight;
      let selected = prizes[prizes.length - 1];
      
      for (const prize of prizes) {
        if (random < prize.weight) {
          selected = prize;
          break;
        }
        random -= prize.weight;
      }
      
      return {
        code: 200,
        data: [{
          success: true,
          prize: selected,
          guaranteeTriggered: Math.random() > 0.9,
          record: {
            id: 'rec-' + Date.now(),
            createdAt: new Date().toISOString(),
          },
        }],
        message: '抽奖成功',
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
        data: [
          { id: '1', prizeName: '三等奖', createdAt: '2026-03-03 10:00:00' },
          { id: '2', prizeName: '谢谢惠顾', createdAt: '2026-03-03 09:30:00' },
        ],
        meta: { total: 2, page: 1 },
      };
    },
  },
] as MockMethod[];

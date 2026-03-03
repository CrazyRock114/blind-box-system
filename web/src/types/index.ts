export interface User {
  id: string;
  username: string;
  nickname?: string;
  avatar?: string;
  balance: number;
  luckyCoin: number;
  points: number;
}

export interface BoxPool {
  id: string;
  name: string;
  description?: string;
  cover?: string;
  type: 'normal' | 'ichiban' | 'tower' | 'gashapon';
  price: number;
  status: string;
  totalTickets?: number;
  soldTickets?: number;
  maxFloors?: number;
}

export interface Prize {
  id: string;
  name: string;
  image: string;
  level: string;
  type: string;
  price: number;
  weight: number;
  probability: number;
  stock: number;
  isFragment: boolean;
}

export interface LotteryRecord {
  id: string;
  prize?: Prize;
  boxPool?: BoxPool;
  type: string;
  costAmount: number;
  costType: string;
  status: string;
  createdAt: string;
  ticketNumber?: number;
  floorNumber?: number;
  isClimbSuccess?: boolean;
}

export interface Transaction {
  id: string;
  type: string;
  currencyType: string;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  description?: string;
  createdAt: string;
}

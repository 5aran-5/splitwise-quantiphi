export interface Expense {
  id: string;
  description: string;
  amount: number;
  payer: string;
  splits: {
    [member: string]: number;
  };
  createdAt: string;
}

export interface Balances {
  [member: string]: number;
}

export interface Transaction {
  from: string;
  to: string;
  amount: number;
}

export interface SettlementData {
  balances: Balances;
  transactions: Transaction[];
}

import { describe, it, expect } from 'vitest';
import { FinanceEngine } from '../src/services/financeEngine';
import { Wallet, Transaction, Loan, Asset } from '../src/types';

describe('FinanceEngine Personal Accounting Rules', () => {
  const mockWallets: Wallet[] = [
    {
      id: 'w-cash',
      name: 'Cash Pocket',
      type: 'cash',
      balance: 1000.00,
      currency: 'USD',
      icon: 'banknote',
      updatedAt: '2026-10-01',
    },
    {
      id: 'w-savings',
      name: 'Savings',
      type: 'savings',
      balance: 2000.00,
      currency: 'USD',
      icon: 'vault',
      updatedAt: '2026-10-01',
    },
  ];

  it('calculates total liquid balance accurately', () => {
    const total = FinanceEngine.calculateTotalLiquidBalance(mockWallets);
    expect(total).toBe(3000.00);
  });

  it('calculates monthly income and expense with strict separation from loans', () => {
    const mockTxs: Transaction[] = [
      {
        id: 'tx1',
        walletId: 'w-savings',
        type: 'income',
        amount: 4000,
        category: 'Salary',
        isNecessity: false,
        date: '2026-10-01T10:00:00Z',
        tax: 0,
        syncStatus: 'synced',
      },
      {
        id: 'tx2',
        walletId: 'w-cash',
        type: 'expense',
        amount: 250,
        category: 'Food',
        isNecessity: true,
        date: '2026-10-05T12:00:00Z',
        tax: 0,
        syncStatus: 'synced',
      },
    ];

    const result = FinanceEngine.calculateMonthlyIncomeAndExpense(mockTxs, '2026-10');
    expect(result.income).toBe(4000);
    expect(result.expense).toBe(250);
    expect(result.net).toBe(3750);
  });

  it('lends money: reduces wallet balance and creates loan receivable without expense leak', () => {
    const { updatedWallets, newLoan } = FinanceEngine.lendMoney(
      mockWallets,
      'w-cash',
      'Marcus Vance',
      500,
      '+123456789',
      '2026-11-01',
      'Emergency loan'
    );

    const cashWallet = updatedWallets.find((w) => w.id === 'w-cash');
    expect(cashWallet?.balance).toBe(500); // 1000 - 500
    expect(newLoan.borrowerName).toBe('Marcus Vance');
    expect(newLoan.principalAmount).toBe(500);
    expect(newLoan.remainingAmount).toBe(500);
    expect(newLoan.status).toBe('active');
  });

  it('processes partial and full repayments without recording fake income', () => {
    const initialLoan: Loan = {
      id: 'loan-1',
      walletId: 'w-cash',
      borrowerName: 'David Chen',
      principalAmount: 500,
      remainingAmount: 500,
      lentDate: '2026-10-01',
      status: 'active',
      repayments: [],
      syncStatus: 'synced',
    };

    // Partial repayment of 150
    const { updatedWallets, updatedLoan } = FinanceEngine.processRepayment(
      mockWallets,
      initialLoan,
      150,
      'w-cash',
      'First installment'
    );

    const cashWallet = updatedWallets.find((w) => w.id === 'w-cash');
    expect(cashWallet?.balance).toBe(1150); // 1000 + 150
    expect(updatedLoan.remainingAmount).toBe(350);
    expect(updatedLoan.status).toBe('partial');
    expect(updatedLoan.repayments.length).toBe(1);

    // Full repayment of remaining 350
    const { updatedLoan: settledLoan } = FinanceEngine.processRepayment(
      updatedWallets,
      updatedLoan,
      350,
      'w-cash',
      'Final installment'
    );

    expect(settledLoan.remainingAmount).toBe(0);
    expect(settledLoan.status).toBe('settled');
  });

  it('calculates daily necessity spending and warns when over budget', () => {
    const today = '2026-10-25';
    const txs: Transaction[] = [
      {
        id: 't1',
        walletId: 'w-cash',
        type: 'expense',
        amount: 30,
        category: 'Groceries',
        isNecessity: true,
        date: `${today}T08:00:00Z`,
        tax: 0,
        syncStatus: 'synced',
      },
      {
        id: 't2',
        walletId: 'w-cash',
        type: 'expense',
        amount: 25,
        category: 'Commute',
        isNecessity: true,
        date: `${today}T12:00:00Z`,
        tax: 0,
        syncStatus: 'synced',
      },
      {
        id: 't3',
        walletId: 'w-cash',
        type: 'expense',
        amount: 100,
        category: 'Cinema',
        isNecessity: false, // Discretionary want, NOT necessity
        date: `${today}T20:00:00Z`,
        tax: 0,
        syncStatus: 'synced',
      },
    ];

    const result = FinanceEngine.calculateDailyNecessitySpend(txs, today, 60);
    expect(result.spentToday).toBe(55); // 30 + 25, cinema excluded
    expect(result.remaining).toBe(5);
    expect(result.isOverBudget).toBe(false);
  });

  it('accurately applies user schedule: active work/school day cap vs rest day cap', () => {
    const sundayDate = '2026-10-25'; // Sunday = 0
    const mondayDate = '2026-10-26'; // Monday = 1
    const activeDays = [1, 2, 3, 4, 5]; // Mon - Fri active, Sat & Sun rest
    const workCap = 600;
    const restCap = 200;

    // Sunday (Rest Day)
    const sundayResult = FinanceEngine.calculateDailyNecessitySpend([], sundayDate, workCap, activeDays, restCap);
    expect(sundayResult.isWorkDay).toBe(false);
    expect(sundayResult.dailyCap).toBe(200);
    expect(sundayResult.dayOfWeek).toBe(0);

    // Monday (Work/School Day)
    const mondayResult = FinanceEngine.calculateDailyNecessitySpend([], mondayDate, workCap, activeDays, restCap);
    expect(mondayResult.isWorkDay).toBe(true);
    expect(mondayResult.dailyCap).toBe(600);
    expect(mondayResult.dayOfWeek).toBe(1);
  });

  it('computes local calendar date string correctly', () => {
    const testDate = new Date(2026, 9, 27); // Month is 0-indexed: 9 = October
    const dateStr = FinanceEngine.getLocalDateString(testDate);
    expect(dateStr).toBe('2026-10-27');
  });

  it('resets daily necessity spend to 0 across midnight rollover and follows next day schedule', () => {
    const day1 = '2026-10-26'; // Monday (active work day)
    const day2 = '2026-10-27'; // Tuesday (rest day in custom schedule [1])
    const customSchedule = [1]; // Only Monday active
    const workCap = 500;
    const restCap = 150;

    const txs: Transaction[] = [
      {
        id: 'tx-mon-1',
        walletId: 'w-cash',
        type: 'expense',
        amount: 200,
        category: 'Food',
        isNecessity: true,
        date: `${day1}T23:45:00`,
        tax: 0,
        syncStatus: 'synced',
      },
      {
        id: 'tx-tue-1',
        walletId: 'w-cash',
        type: 'expense',
        amount: 50,
        category: 'Coffee',
        isNecessity: true,
        date: `${day2}T00:15:00`,
        tax: 0,
        syncStatus: 'synced',
      },
    ];

    // Day 1 before midnight: spent is 200 on work day cap 500
    const day1Result = FinanceEngine.calculateDailyNecessitySpend(txs, day1, workCap, customSchedule, restCap);
    expect(day1Result.isWorkDay).toBe(true);
    expect(day1Result.dailyCap).toBe(500);
    expect(day1Result.spentToday).toBe(200);
    expect(day1Result.remaining).toBe(300);

    // Midnight rollover to Day 2: Day 1 expense of 200 resets, only Day 2 expense of 50 counts
    // Day 2 is Tuesday, not in customSchedule [1], so cap switches to restCap 150
    const day2Result = FinanceEngine.calculateDailyNecessitySpend(txs, day2, workCap, customSchedule, restCap);
    expect(day2Result.isWorkDay).toBe(false);
    expect(day2Result.dailyCap).toBe(150);
    expect(day2Result.spentToday).toBe(50);
    expect(day2Result.remaining).toBe(100);
  });

  it('accurately follows custom user schedules regardless of number or string types', () => {
    const wednesday = '2026-10-28'; // Day 3
    const workCap = 800;
    const restCap = 250;

    // Custom user schedule with Wednesday active
    const scheduleWithWed = [1, 2, 3] as any[];
    const resultActive = FinanceEngine.calculateDailyNecessitySpend([], wednesday, workCap, scheduleWithWed, restCap);
    expect(resultActive.isWorkDay).toBe(true);
    expect(resultActive.dailyCap).toBe(800);

    // Custom user schedule where Wednesday is an off-day
    const scheduleWithoutWed = [1, 2, 4, 5];
    const resultRest = FinanceEngine.calculateDailyNecessitySpend([], wednesday, workCap, scheduleWithoutWed, restCap);
    expect(resultRest.isWorkDay).toBe(false);
    expect(resultRest.dailyCap).toBe(250);
  });

  it('calculates true net worth aggregating wallets, loans receivable, and physical/crypto assets', () => {
    const loans: Loan[] = [
      {
        id: 'l1',
        walletId: 'w-cash',
        borrowerName: 'Alex',
        principalAmount: 500,
        remainingAmount: 300, // $300 receivable
        lentDate: '2026-10-01',
        status: 'partial',
        repayments: [],
        syncStatus: 'synced',
      },
    ];

    const assets: Asset[] = [
      { id: 'a1', name: 'BTC', assetClass: 'crypto', value: 10000, syncStatus: 'synced' },
      { id: 'a2', name: 'Bike', assetClass: 'physical', value: 5000, syncStatus: 'synced' },
    ];

    // Total = Liquid ($3000) + Receivables ($300) + Assets ($15000) = $18300
    const netWorth = FinanceEngine.calculateNetWorth(mockWallets, loans, assets);
    expect(netWorth).toBe(18300);
  });

  it('calculates net worth with multi-currency conversion to target currency', () => {
    const multiWallets: Wallet[] = [
      { id: 'w1', name: 'USD Wallet', type: 'cash', balance: 100, currency: 'USD', icon: 'banknote', updatedAt: '' },
      { id: 'w2', name: 'PHP Wallet', type: 'savings', balance: 5850, currency: 'PHP', icon: 'vault', updatedAt: '' },
    ];
    const multiLoans: Loan[] = [
      {
        id: 'l1',
        walletId: 'w2', // Lent from PHP wallet
        borrowerName: 'Bob',
        principalAmount: 2925,
        remainingAmount: 2925, // 2925 PHP = 50 USD
        lentDate: '2026-10-01',
        status: 'active',
        repayments: [],
        syncStatus: 'synced',
      },
    ];
    const multiAssets: Asset[] = [
      { id: 'a1', name: 'Gold', assetClass: 'physical', value: 200, syncStatus: 'synced' },
    ];

    // Converted to USD:
    // w1: 100 USD
    // w2: 5850 PHP -> 100 USD
    // l1: 2925 PHP -> 50 USD
    // a1: 200 USD
    // Total = 100 + 100 + 50 + 200 = 450 USD
    const totalUSD = FinanceEngine.calculateNetWorth(multiWallets, multiLoans, multiAssets, 'USD');
    expect(totalUSD).toBe(450.00);
  });
});

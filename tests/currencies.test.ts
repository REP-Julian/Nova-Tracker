import { describe, it, expect, vi } from 'vitest';
import {
  DEFAULT_CURRENCY,
  detectUserCountryCurrency,
  getCurrencySymbol,
  getCurrencyInfo,
  COUNTRY_TO_CURRENCY,
  WORLD_CURRENCIES,
  getExchangeRate,
  convertCurrency,
  convertFinancialDataset,
  fetchLiveExchangeRates,
  BASE_RATES_TO_USD,
} from '../src/lib/currencies';
import { INITIAL_WALLETS, INITIAL_PROFILE, storageService } from '../src/lib/storage';
import { WalletSchema, ProfileSchema } from '../src/lib/schemas';
import { FinanceEngine } from '../src/services/financeEngine';

describe('Country Currency System', () => {
  it('detects user country currency without throwing', () => {
    const detected = detectUserCountryCurrency();
    expect(typeof detected).toBe('string');
    expect(detected.length).toBe(3);
  });

  it('correctly maps country codes to accurate national currencies', () => {
    expect(COUNTRY_TO_CURRENCY['PH']).toBe('PHP');
    expect(COUNTRY_TO_CURRENCY['US']).toBe('USD');
    expect(COUNTRY_TO_CURRENCY['GB']).toBe('GBP');
    expect(COUNTRY_TO_CURRENCY['ID']).toBe('IDR');
    expect(COUNTRY_TO_CURRENCY['JP']).toBe('JPY');
    expect(COUNTRY_TO_CURRENCY['SG']).toBe('SGD');
    expect(COUNTRY_TO_CURRENCY['MY']).toBe('MYR');
    expect(COUNTRY_TO_CURRENCY['TH']).toBe('THB');
    expect(COUNTRY_TO_CURRENCY['CA']).toBe('CAD');
    expect(COUNTRY_TO_CURRENCY['AU']).toBe('AUD');
  });

  it('retrieves correct currency symbols', () => {
    expect(getCurrencySymbol('PHP')).toBe('₱');
    expect(getCurrencySymbol('USD')).toBe('$');
    expect(getCurrencySymbol('EUR')).toBe('€');
    expect(getCurrencySymbol('GBP')).toBe('£');
    expect(getCurrencySymbol('JPY')).toBe('¥');
    expect(getCurrencySymbol('IDR')).toBe('Rp');
    expect(getCurrencySymbol('THB')).toBe('฿');
    expect(getCurrencySymbol('MYR')).toBe('RM');
  });

  it('includes country flag and official name in currency info', () => {
    const php = getCurrencyInfo('PHP');
    expect(php.symbol).toBe('₱');
    expect(php.name).toBe('Philippine Peso');
    expect(php.flag).toBe('🇵🇭');

    const idr = getCurrencyInfo('IDR');
    expect(idr.symbol).toBe('Rp');
    expect(idr.name).toBe('Indonesian Rupiah');
    expect(idr.flag).toBe('🇮🇩');
  });

  it('has comprehensive world currency list', () => {
    expect(WORLD_CURRENCIES.length).toBeGreaterThanOrEqual(40);
  });

  describe('Real-Time Currency Conversions', () => {
    it('calculates correct exchange rates between currencies', () => {
      expect(getExchangeRate('USD', 'USD')).toBe(1);
      // 1 USD = 58.5 PHP => getExchangeRate('USD', 'PHP') = 58.5
      expect(getExchangeRate('USD', 'PHP')).toBeCloseTo(BASE_RATES_TO_USD.PHP, 1);
      // 1 PHP = ~0.0171 USD => getExchangeRate('PHP', 'USD') = 1 / 58.5
      expect(getExchangeRate('PHP', 'USD')).toBeCloseTo(1 / BASE_RATES_TO_USD.PHP, 3);
    });

    it('accurately converts values from PHP to USD and back', () => {
      const phpAmount = 5850;
      const usdConverted = convertCurrency(phpAmount, 'PHP', 'USD');
      expect(usdConverted).toBe(100.00);

      const roundTrip = convertCurrency(usdConverted, 'USD', 'PHP');
      expect(roundTrip).toBe(5850.00);
    });

    it('converts entire financial dataset (wallets, transactions, loans, assets, budget caps) exactly', () => {
      const initialData = {
        wallets: [
          {
            id: 'w1',
            name: 'Cash',
            type: 'cash' as const,
            balance: 5850,
            currency: 'PHP',
            icon: 'banknote',
            updatedAt: '2026-10-01',
          },
        ],
        transactions: [
          {
            id: 't1',
            walletId: 'w1',
            type: 'expense' as const,
            amount: 585,
            category: 'Food',
            isNecessity: true,
            date: '2026-10-01',
            tax: 58.5,
            syncStatus: 'synced' as const,
          },
        ],
        loans: [
          {
            id: 'l1',
            walletId: 'w1',
            borrowerName: 'Alice',
            principalAmount: 2925,
            remainingAmount: 2925,
            lentDate: '2026-10-01',
            status: 'active' as const,
            repayments: [
              {
                id: 'r1',
                loanId: 'l1',
                amount: 585,
                date: '2026-10-02',
                destinationWalletId: 'w1',
              },
            ],
            syncStatus: 'synced' as const,
          },
        ],
        assets: [
          {
            id: 'a1',
            name: 'Laptop',
            assetClass: 'physical' as const,
            value: 58500,
            syncStatus: 'synced' as const,
          },
        ],
        profile: {
          id: 'p1',
          username: 'julian',
          fullName: 'Julian',
          email: 'julian@test.com',
          contactNumber: '',
          role: 'Admin',
          theme: 'dark' as const,
          currency: 'PHP',
          dailyNecessityCap: 585,
          restDayNecessityCap: 117,
        },
      };

      const converted = convertFinancialDataset(initialData, 'PHP', 'USD');

      // Wallets converted: 5850 PHP -> 100 USD
      expect(converted.wallets[0].currency).toBe('USD');
      expect(converted.wallets[0].balance).toBe(100.00);

      // Transactions converted: 585 PHP -> 10 USD, tax 58.5 -> 1 USD
      expect(converted.transactions[0].amount).toBe(10.00);
      expect(converted.transactions[0].tax).toBe(1.00);

      // Loans converted: 2925 PHP -> 50 USD, repayment 585 -> 10 USD
      expect(converted.loans[0].principalAmount).toBe(50.00);
      expect(converted.loans[0].remainingAmount).toBe(50.00);
      expect(converted.loans[0].repayments[0].amount).toBe(10.00);

      // Assets converted: 58500 PHP -> 1000 USD
      expect(converted.assets[0].value).toBe(1000.00);

      // Profile caps converted: 585 PHP -> 10 USD, 117 PHP -> 2 USD
      expect(converted.profile.currency).toBe('USD');
      expect(converted.profile.dailyNecessityCap).toBe(10.00);
      expect(converted.profile.restDayNecessityCap).toBe(2.00);
    });

    it('preserves existing target currency wallets and converts only originating currencies', () => {
      const mixedData = {
        wallets: [
          {
            id: 'w-php',
            name: 'PHP Wallet',
            type: 'cash' as const,
            balance: 5850,
            currency: 'PHP',
            icon: 'banknote',
            updatedAt: '2026-10-01',
          },
          {
            id: 'w-usd',
            name: 'USD Wallet',
            type: 'savings' as const,
            balance: 200,
            currency: 'USD',
            icon: 'vault',
            updatedAt: '2026-10-01',
          },
        ],
        transactions: [
          {
            id: 't-php',
            walletId: 'w-php',
            type: 'expense' as const,
            amount: 585,
            category: 'Food',
            isNecessity: true,
            date: '2026-10-01',
            tax: 0,
            syncStatus: 'synced' as const,
          },
          {
            id: 't-usd',
            walletId: 'w-usd',
            type: 'expense' as const,
            amount: 50,
            category: 'Cloud',
            isNecessity: false,
            date: '2026-10-01',
            tax: 0,
            syncStatus: 'synced' as const,
          },
        ],
        loans: [],
        assets: [],
        profile: {
          id: 'p1',
          currency: 'PHP',
          dailyNecessityCap: 500,
        },
      };

      const converted = convertFinancialDataset(mixedData, 'PHP', 'USD');

      // PHP wallet converted to 100 USD
      expect(converted.wallets[0].balance).toBe(100.00);
      expect(converted.wallets[0].currency).toBe('USD');

      // USD wallet was already in USD - balance must stay 200 USD and not be divided by 58.5!
      expect(converted.wallets[1].balance).toBe(200.00);
      expect(converted.wallets[1].currency).toBe('USD');

      // PHP tx converted: 585 PHP -> 10 USD
      expect(converted.transactions[0].amount).toBe(10.00);

      // USD tx was already in USD: 50 USD stays 50 USD
      expect(converted.transactions[1].amount).toBe(50.00);
    });

    it('gracefully handles live exchange rate fetch fallback when offline', async () => {
      const res = await fetchLiveExchangeRates();
      expect(res.rates).toBeDefined();
      expect(res.rates.USD).toBe(1);
      expect(res.rates.PHP).toBeGreaterThan(0);
    });
  });

  describe('PHP Default Currency & Legacy Reconciliation', () => {
    it('sets DEFAULT_CURRENCY to PHP strictly', () => {
      expect(DEFAULT_CURRENCY).toBe('PHP');
    });

    it('getCurrencyInfo and getCurrencySymbol fallback to PHP', () => {
      const info = getCurrencyInfo();
      expect(info.code).toBe('PHP');
      expect(info.symbol).toBe('₱');
      expect(getCurrencySymbol()).toBe('₱');
    });

    it('prioritizes Asia/Manila in detectUserCountryCurrency', () => {
      const originalDateTimeFormat = Intl.DateTimeFormat;
      try {
        // Mock Intl.DateTimeFormat to return Asia/Manila
        vi.spyOn(Intl, 'DateTimeFormat').mockImplementation(() => ({
          resolvedOptions: () => ({
            timeZone: 'Asia/Manila',
            locale: 'en-US', // even if locale says en-US, timezone Asia/Manila must return PHP
          }),
        } as any));

        const detected = detectUserCountryCurrency();
        expect(detected).toBe('PHP');
      } finally {
        vi.restoreAllMocks();
      }
    });

    it('WalletSchema and ProfileSchema have PHP default currency and 500 daily cap', () => {
      const walletParsed = WalletSchema.parse({
        id: '11111111-1111-1111-1111-111111111111',
        name: 'My Wallet',
        type: 'cash',
        balance: 100,
        updatedAt: new Date().toISOString(),
      });
      expect(walletParsed.currency).toBe('PHP');

      const profileParsed = ProfileSchema.parse({
        id: 'user-1',
        fullName: 'Test User',
        email: 'test@example.com',
        contactNumber: '09123456789',
        role: 'Primary Earner',
      });
      expect(profileParsed.currency).toBe('PHP');
      expect(profileParsed.dailyNecessityCap).toBe(500);
    });

    it('INITIAL_WALLETS and INITIAL_PROFILE use PHP', () => {
      expect(INITIAL_PROFILE.currency).toBe('PHP');
      expect(INITIAL_WALLETS[0].currency).toBe('PHP');
      expect(INITIAL_WALLETS[1].currency).toBe('PHP');
    });

    it('defaults fromCurrency and toCurrency to PHP in getExchangeRate and convertCurrency', () => {
      // Empty or undefined currencies must default to PHP, not USD!
      expect(getExchangeRate('', 'PHP')).toBe(1);
      expect(getExchangeRate('PHP', '')).toBe(1);
      expect(getExchangeRate('', '')).toBe(1);

      // convertCurrency(250, '', 'PHP') must stay 250 and NEVER multiply by 58.50!
      expect(convertCurrency(250, '', 'PHP')).toBe(250);
      expect(convertCurrency(250, 'PHP', '')).toBe(250);
      expect(convertCurrency(250, '', '')).toBe(250);
    });

    it('reconciles legacy USD wallet to PHP preventing 14k balance inflation', async () => {
      const legacyWallets = [
        {
          id: 'w-legacy-1',
          name: 'Cash Pocket',
          type: 'cash' as const,
          balance: 250,
          currency: 'USD', // legacy bug: wallet marked USD when user balance was 250 PHP
          icon: 'banknote',
          updatedAt: '2026-01-01',
        },
      ];

      // Reconcile legacy wallets with profile currency PHP
      const healed = await storageService.reconcileLegacyWallets(legacyWallets, 'PHP');
      expect(healed[0].currency).toBe('PHP');
      expect(healed[0].balance).toBe(250);

      // Verify FinanceEngine calculation: 250 balance stays ₱250.00 instead of multiplying by 58.50 (~14,625)
      const totalBalance = FinanceEngine.calculateTotalLiquidBalance(healed, 'PHP');
      expect(totalBalance).toBe(250);
    });

    it('storageService.getWallets auto-reconciles legacy USD wallets to PHP when profile is PHP', async () => {
      localStorage.setItem('bt_profile', JSON.stringify({ ...INITIAL_PROFILE, currency: 'PHP' }));
      localStorage.setItem('bt_wallets', JSON.stringify([
        {
          id: 'w-legacy-auto',
          name: 'Cash Pocket',
          type: 'cash',
          balance: 250,
          currency: 'USD',
          icon: 'banknote',
          updatedAt: '2026-01-01',
        },
      ]));

      const loaded = await storageService.getWallets();
      expect(loaded[0].currency).toBe('PHP');
      expect(loaded[0].balance).toBe(250);

      const totalBalance = FinanceEngine.calculateTotalLiquidBalance(loaded, 'PHP');
      expect(totalBalance).toBe(250);
    });
  });
});

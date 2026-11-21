import { describe, it, expect } from 'vitest';
import {
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
});

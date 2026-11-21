export interface CurrencyOption {
  code: string;
  symbol: string;
  flag: string;
  name: string;
}

export const WORLD_CURRENCIES: CurrencyOption[] = [
  // Default first: Philippines
  { code: 'PHP', symbol: '₱', flag: '🇵🇭', name: 'Philippine Peso' },
  // Major & Southeast Asia
  { code: 'USD', symbol: '$', flag: '🇺🇸', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', flag: '🇪🇺', name: 'Euro' },
  { code: 'JPY', symbol: '¥', flag: '🇯🇵', name: 'Japanese Yen' },
  { code: 'GBP', symbol: '£', flag: '🇬🇧', name: 'British Pound' },
  { code: 'SGD', symbol: 'S$', flag: '🇸🇬', name: 'Singapore Dollar' },
  { code: 'MYR', symbol: 'RM', flag: '🇲🇾', name: 'Malaysian Ringgit' },
  { code: 'THB', symbol: '฿', flag: '🇹🇭', name: 'Thai Baht' },
  { code: 'IDR', symbol: 'Rp', flag: '🇮🇩', name: 'Indonesian Rupiah' },
  { code: 'VND', symbol: '₫', flag: '🇻🇳', name: 'Vietnamese Dong' },
  // Asia Pacific
  { code: 'AUD', symbol: 'A$', flag: '🇦🇺', name: 'Australian Dollar' },
  { code: 'NZD', symbol: 'NZ$', flag: '🇳🇿', name: 'New Zealand Dollar' },
  { code: 'CAD', symbol: 'CA$', flag: '🇨🇦', name: 'Canadian Dollar' },
  { code: 'CHF', symbol: 'CHF', flag: '🇨🇭', name: 'Swiss Franc' },
  { code: 'CNY', symbol: '¥', flag: '🇨🇳', name: 'Chinese Yuan' },
  { code: 'HKD', symbol: 'HK$', flag: '🇭🇰', name: 'Hong Kong Dollar' },
  { code: 'KRW', symbol: '₩', flag: '🇰🇷', name: 'South Korean Won' },
  { code: 'INR', symbol: '₹', flag: '🇮🇳', name: 'Indian Rupee' },
  { code: 'TWD', symbol: 'NT$', flag: '🇹🇼', name: 'New Taiwan Dollar' },
  // Middle East & Africa
  { code: 'AED', symbol: 'AED', flag: '🇦🇪', name: 'UAE Dirham' },
  { code: 'SAR', symbol: 'SAR', flag: '🇸🇦', name: 'Saudi Riyal' },
  { code: 'QAR', symbol: 'QAR', flag: '🇶🇦', name: 'Qatari Riyal' },
  { code: 'KWD', symbol: 'KD', flag: '🇰🇼', name: 'Kuwaiti Dinar' },
  { code: 'BHD', symbol: 'BD', flag: '🇧🇭', name: 'Bahraini Dinar' },
  { code: 'OMR', symbol: 'OMR', flag: '🇴🇲', name: 'Omani Rial' },
  { code: 'ILS', symbol: '₪', flag: '🇮🇱', name: 'Israeli New Shekel' },
  { code: 'ZAR', symbol: 'R', flag: '🇿🇦', name: 'South African Rand' },
  { code: 'NGN', symbol: '₦', flag: '🇳🇬', name: 'Nigerian Naira' },
  { code: 'EGP', symbol: 'E£', flag: '🇪🇬', name: 'Egyptian Pound' },
  { code: 'KES', symbol: 'KSh', flag: '🇰🇪', name: 'Kenyan Shilling' },
  { code: 'GHS', symbol: 'GH₵', flag: '🇬🇭', name: 'Ghanaian Cedi' },
  { code: 'PKR', symbol: '₨', flag: '🇵🇰', name: 'Pakistani Rupee' },
  { code: 'BDT', symbol: '৳', flag: '🇧🇩', name: 'Bangladeshi Taka' },
  { code: 'LKR', symbol: 'Rs', flag: '🇱🇰', name: 'Sri Lankan Rupee' },
  { code: 'RUB', symbol: '₽', flag: '🇷🇺', name: 'Russian Ruble' },
  // Europe
  { code: 'SEK', symbol: 'kr', flag: '🇸🇪', name: 'Swedish Krona' },
  { code: 'NOK', symbol: 'kr', flag: '🇳🇴', name: 'Norwegian Krone' },
  { code: 'DKK', symbol: 'kr', flag: '🇩🇰', name: 'Danish Krone' },
  { code: 'PLN', symbol: 'zł', flag: '🇵🇱', name: 'Polish Zloty' },
  { code: 'TRY', symbol: '₺', flag: '🇹🇷', name: 'Turkish Lira' },
  { code: 'CZK', symbol: 'Kč', flag: '🇨🇿', name: 'Czech Koruna' },
  { code: 'HUF', symbol: 'Ft', flag: '🇭🇺', name: 'Hungarian Forint' },
  { code: 'RON', symbol: 'lei', flag: '🇷🇴', name: 'Romanian Leu' },
  // Americas
  { code: 'MXN', symbol: 'Mex$', flag: '🇲🇽', name: 'Mexican Peso' },
  { code: 'BRL', symbol: 'R$', flag: '🇧🇷', name: 'Brazilian Real' },
  { code: 'ARS', symbol: '$', flag: '🇦🇷', name: 'Argentine Peso' },
  { code: 'CLP', symbol: '$', flag: '🇨🇱', name: 'Chilean Peso' },
  { code: 'COP', symbol: '$', flag: '🇨🇴', name: 'Colombian Peso' },
  { code: 'PEN', symbol: 'S/', flag: '🇵🇪', name: 'Peruvian Sol' },
];

export const COUNTRY_TO_CURRENCY: Record<string, string> = {
  PH: 'PHP', US: 'USD', GB: 'GBP', ID: 'IDR', JP: 'JPY',
  CA: 'CAD', AU: 'AUD', SG: 'SGD', MY: 'MYR', TH: 'THB',
  VN: 'VND', KR: 'KRW', IN: 'INR', CN: 'CNY', TW: 'TWD',
  DE: 'EUR', FR: 'EUR', IT: 'EUR', ES: 'EUR', NL: 'EUR',
  BE: 'EUR', AT: 'EUR', IE: 'EUR', FI: 'EUR', PT: 'EUR',
  GR: 'EUR', CH: 'CHF', BR: 'BRL', MX: 'MXN', SA: 'SAR',
  AE: 'AED', QA: 'QAR', KW: 'KWD', BH: 'BHD', OM: 'OMR',
  IL: 'ILS', ZA: 'ZAR', NG: 'NGN', EG: 'EGP', KE: 'KES',
  GH: 'GHS', PK: 'PKR', BD: 'BDT', LK: 'LKR', RU: 'RUB',
  NZ: 'NZD', SE: 'SEK', NO: 'NOK', DK: 'DKK', PL: 'PLN',
  TR: 'TRY', CZ: 'CZK', HU: 'HUF', RO: 'RON', AR: 'ARS',
  CL: 'CLP', CO: 'COP', PE: 'PEN',
};

/**
 * Detects the user's country currency based on system timezone and locale.
 * Prioritizes Asia/Manila and defaults strictly to PHP.
 */
export function detectUserCountryCurrency(): string {
  try {
    const resolved = Intl.DateTimeFormat().resolvedOptions();
    if (resolved.timeZone) {
      const tz = resolved.timeZone;
      if (tz === 'Asia/Manila' || tz.includes('Manila')) return 'PHP';
      if (tz.includes('Jakarta') || tz.includes('Makassar') || tz.includes('Jayapura') || tz.includes('Pontianak')) return 'IDR';
      if (tz === 'Asia/Singapore') return 'SGD';
      if (tz === 'Asia/Kuala_Lumpur') return 'MYR';
      if (tz === 'Asia/Bangkok') return 'THB';
      if (tz === 'Asia/Tokyo') return 'JPY';
      if (tz === 'Asia/Seoul') return 'KRW';
      if (tz === 'Asia/Kolkata') return 'INR';
      if (tz === 'Europe/London') return 'GBP';
      if (tz.startsWith('Europe/')) return 'EUR';
      if (tz.startsWith('America/New_York') || tz.startsWith('America/Chicago') || tz.startsWith('America/Los_Angeles') || tz.startsWith('America/Denver') || tz.startsWith('America/Phoenix')) return 'USD';
      if (tz.startsWith('Australia/')) return 'AUD';
      if (tz.startsWith('America/Toronto') || tz.startsWith('America/Vancouver') || tz.startsWith('America/Montreal') || tz.startsWith('America/Edmonton')) return 'CAD';
    }

    if (typeof navigator !== 'undefined') {
      const langs = navigator.languages || [navigator.language];
      for (const lang of langs) {
        if (!lang) continue;
        try {
          const loc = new Intl.Locale(lang);
          if (loc.region?.toUpperCase() === 'PH') return 'PHP';
          if (loc.region && COUNTRY_TO_CURRENCY[loc.region.toUpperCase()]) {
            return COUNTRY_TO_CURRENCY[loc.region.toUpperCase()];
          }
        } catch {
          // ignore
        }
      }
    }

    if (resolved.locale) {
      try {
        const loc = new Intl.Locale(resolved.locale);
        if (loc.region && COUNTRY_TO_CURRENCY[loc.region.toUpperCase()]) {
          return COUNTRY_TO_CURRENCY[loc.region.toUpperCase()];
        }
      } catch {
        // ignore
      }
    }
  } catch {
    // ignore
  }

  return 'PHP';
}

export const DEFAULT_CURRENCY = 'PHP';

export function getCurrencyInfo(code?: string): CurrencyOption {
  const targetCode = code || 'PHP';
  const found = WORLD_CURRENCIES.find(c => c.code.toUpperCase() === targetCode.toUpperCase());
  return found || { code: targetCode, symbol: targetCode, flag: '🌐', name: targetCode };
}

export function getCurrencySymbol(code?: string): string {
  return getCurrencyInfo(code).symbol;
}

/**
 * Standard baseline exchange rates against 1 USD.
 * Used for instant, reliable zero-latency conversions and full offline support.
 */
export const BASE_RATES_TO_USD: Record<string, number> = {
  USD: 1.0,
  PHP: 58.50,
  EUR: 0.92,
  JPY: 154.50,
  GBP: 0.79,
  SGD: 1.34,
  MYR: 4.45,
  THB: 34.50,
  IDR: 15900,
  VND: 25300,
  AUD: 1.52,
  NZD: 1.70,
  CAD: 1.39,
  CHF: 0.88,
  CNY: 7.24,
  HKD: 7.78,
  KRW: 1390,
  INR: 84.40,
  TWD: 32.50,
  AED: 3.67,
  SAR: 3.75,
  QAR: 3.64,
  KWD: 0.31,
  BHD: 0.38,
  OMR: 0.38,
  ILS: 3.70,
  ZAR: 18.00,
  NGN: 1680,
  EGP: 49.30,
  KES: 129.50,
  GHS: 15.50,
  PKR: 278.0,
  BDT: 119.50,
  LKR: 292.0,
  RUB: 100.0,
  SEK: 11.0,
  NOK: 11.0,
  DKK: 7.0,
  PLN: 4.10,
  TRY: 34.50,
  CZK: 23.90,
  HUF: 385.0,
  RON: 4.65,
  MXN: 20.40,
  BRL: 5.75,
  ARS: 1000.0,
  CLP: 975.0,
  COP: 4400.0,
  PEN: 3.80,
};

const CACHE_RATES_KEY = 'bt_cached_exchange_rates';
const CACHE_TIME_KEY = 'bt_cached_exchange_rates_time';

let memoryRates: Record<string, number> = { ...BASE_RATES_TO_USD };

type ExchangeRatesListener = (rates: Record<string, number>) => void;
const ratesListeners = new Set<ExchangeRatesListener>();

export function subscribeExchangeRates(listener: ExchangeRatesListener): () => void {
  ratesListeners.add(listener);
  return () => ratesListeners.delete(listener);
}

function notifyRatesListeners(rates: Record<string, number>) {
  ratesListeners.forEach((fn) => {
    try {
      fn(rates);
    } catch {
      // ignore
    }
  });
}

/**
 * Returns current exchange rates against USD from memory, cache, or base rates.
 */
export function getExchangeRates(): Record<string, number> {
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(CACHE_RATES_KEY);
      if (raw) {
        memoryRates = { ...BASE_RATES_TO_USD, ...JSON.parse(raw) };
        return memoryRates;
      }
    } catch {
      // ignore
    }
  }
  return memoryRates;
}

/**
 * Fetches live real-time exchange rates from public free APIs.
 */
export async function fetchLiveExchangeRates(): Promise<{
  success: boolean;
  rates: Record<string, number>;
  source: string;
}> {
  const urls = [
    'https://open.er-api.com/v6/latest/USD',
    'https://api.exchangerate-api.com/v4/latest/USD',
  ];

  for (const url of urls) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 4000);
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timer);
      if (res.ok) {
        const json = await res.json();
        if (json && json.rates && typeof json.rates === 'object') {
          memoryRates = { ...BASE_RATES_TO_USD, ...json.rates };
          if (typeof window !== 'undefined') {
            try {
              localStorage.setItem(CACHE_RATES_KEY, JSON.stringify(json.rates));
              localStorage.setItem(CACHE_TIME_KEY, new Date().toISOString());
            } catch {
              // ignore
            }
          }
          notifyRatesListeners(memoryRates);
          return { success: true, rates: memoryRates, source: url };
        }
      }
    } catch {
      // try next url
    }
  }

  // Fallback to existing cache or built-in rates
  const fallbackRates = getExchangeRates();
  notifyRatesListeners(fallbackRates);
  return { success: false, rates: fallbackRates, source: 'cache/fallback' };
}

/**
 * Calculates conversion multiplier from one currency to another.
 * e.g. getExchangeRate('PHP', 'USD') => ~0.0171
 */
export function getExchangeRate(fromCurrency: string, toCurrency: string): number {
  const from = (fromCurrency || 'PHP').toUpperCase();
  const to = (toCurrency || 'PHP').toUpperCase();
  if (from === to) return 1;

  const rates = getExchangeRates();
  const fromRate = rates[from] ?? BASE_RATES_TO_USD[from] ?? 1;
  const toRate = rates[to] ?? BASE_RATES_TO_USD[to] ?? 1;

  if (fromRate <= 0) return 1;
  return toRate / fromRate;
}

/**
 * Converts amount from fromCurrency to toCurrency with 2 decimal precision.
 */
export function convertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string
): number {
  if (isNaN(amount) || amount === 0) return 0;
  const from = (fromCurrency || 'PHP').toUpperCase();
  const to = (toCurrency || 'PHP').toUpperCase();
  if (from === to) return amount;

  const rate = getExchangeRate(from, to);
  return Number((amount * rate).toFixed(2));
}

/**
 * Converts an entire financial dataset (wallets, transactions, loans, assets, profile)
 * when switching the user's primary/default currency.
 * Fully multi-currency aware: only converts from each entity's source wallet currency.
 */
export function convertFinancialDataset<
  T extends {
    wallets: any[];
    transactions: any[];
    loans: any[];
    assets: any[];
    profile: any;
  }
>(
  data: T,
  fromCurrency: string,
  toCurrency: string
): {
  wallets: any[];
  transactions: any[];
  loans: any[];
  assets: any[];
  profile: any;
  rate: number;
} {
  const from = (fromCurrency || 'PHP').toUpperCase();
  const to = (toCurrency || 'PHP').toUpperCase();
  if (from === to) {
    return { ...data, rate: 1 };
  }

  const baseRate = getExchangeRate(from, to);

  // Map each wallet according to its own currency
  const walletCurrencyMap = new Map<string, string>();
  const wallets = data.wallets.map((w) => {
    const origCurr = (w.currency || from).toUpperCase();
    walletCurrencyMap.set(w.id, origCurr);
    const rate = getExchangeRate(origCurr, to);
    const convertedBalance = origCurr === to ? w.balance : Number((w.balance * rate).toFixed(2));
    return {
      ...w,
      currency: to,
      balance: convertedBalance,
      updatedAt: new Date().toISOString(),
    };
  });

  // Map transactions according to their parent wallet's currency
  const transactions = data.transactions.map((t) => {
    const txSourceCurr = walletCurrencyMap.get(t.walletId) || from;
    const rate = getExchangeRate(txSourceCurr, to);
    const convertedAmount = txSourceCurr === to ? t.amount : Number((t.amount * rate).toFixed(2));
    const convertedTax = txSourceCurr === to ? (t.tax || 0) : Number(((t.tax || 0) * rate).toFixed(2));
    return {
      ...t,
      amount: convertedAmount,
      tax: convertedTax,
    };
  });

  // Map loans and repayments according to origin & destination wallet currencies
  const loans = data.loans.map((l) => {
    const loanSourceCurr = walletCurrencyMap.get(l.walletId) || from;
    const rate = getExchangeRate(loanSourceCurr, to);
    const convertedPrincipal = loanSourceCurr === to ? l.principalAmount : Number((l.principalAmount * rate).toFixed(2));
    const convertedRemaining = loanSourceCurr === to ? l.remainingAmount : Number((l.remainingAmount * rate).toFixed(2));
    const repayments = (l.repayments || []).map((r: any) => {
      const repSourceCurr = walletCurrencyMap.get(r.destinationWalletId) || loanSourceCurr;
      const repRate = getExchangeRate(repSourceCurr, to);
      return {
        ...r,
        amount: repSourceCurr === to ? r.amount : Number((r.amount * repRate).toFixed(2)),
      };
    });
    return {
      ...l,
      principalAmount: convertedPrincipal,
      remainingAmount: convertedRemaining,
      repayments,
    };
  });

  // Map assets according to previous base currency
  const assets = data.assets.map((a) => ({
    ...a,
    value: Number((a.value * baseRate).toFixed(2)),
  }));

  // Map daily & rest day necessity caps
  const profile = {
    ...data.profile,
    currency: to,
    dailyNecessityCap: Number(((data.profile.dailyNecessityCap || 500) * baseRate).toFixed(2)),
    restDayNecessityCap:
      data.profile.restDayNecessityCap !== undefined
        ? Number((data.profile.restDayNecessityCap * baseRate).toFixed(2))
        : undefined,
  };

  return { wallets, transactions, loans, assets, profile, rate: baseRate };
}


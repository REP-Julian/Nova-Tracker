import { get, set } from 'idb-keyval';
import { Wallet, Transaction, Loan, Asset, UserProfile } from '../types';

export interface AiConfig {
  aiBaseUrl?: string;
  aiApiKey?: string;
  aiModel?: string;
}

const STORAGE_KEYS = {
  WALLETS: 'bt_wallets',
  TRANSACTIONS: 'bt_transactions',
  LOANS: 'bt_loans',
  ASSETS: 'bt_assets',
  PROFILE: 'bt_profile',
  AI_CONFIG: 'bt_ai_config',
};

async function withTimeout<T>(promise: Promise<T>, ms = 2500): Promise<T> {
  let timer: any;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error('IndexedDB operation timed out')), ms);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timer));
}

async function getItem<T>(key: string, fallbackDefault: T): Promise<T> {
  try {
    const val = await withTimeout(get<T>(key), 2500);
    if (val !== undefined && val !== null) return val;
  } catch (err) {
    if (process.env.NODE_ENV !== 'test') {
      console.warn(`IndexedDB read failed for ${key}, checking localStorage:`, err);
    }
  }

  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw) as T;
  } catch (e) {
    if (process.env.NODE_ENV !== 'test') {
      console.error(`localStorage read failed for ${key}:`, e);
    }
  }

  return fallbackDefault;
}

async function setItem<T>(key: string, value: T): Promise<void> {
  try {
    await withTimeout(set(key, value), 2500);
  } catch (err) {
    if (process.env.NODE_ENV !== 'test') {
      console.warn(`IndexedDB write failed for ${key}, falling back to localStorage:`, err);
    }
  }

  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    if (process.env.NODE_ENV !== 'test') {
      console.error(`localStorage write failed for ${key}:`, e);
    }
  }
}

// Clean Initial State (No fake demo transactions or loans)
export const INITIAL_WALLETS: Wallet[] = [
  {
    id: 'w-cash-01',
    name: 'Cash & Pocket',
    type: 'cash',
    balance: 0.00,
    currency: 'PHP',
    icon: 'banknote',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'w-savings-02',
    name: 'Savings Safe',
    type: 'savings',
    balance: 0.00,
    currency: 'PHP',
    icon: 'vault',
    updatedAt: new Date().toISOString(),
  },
];

export const INITIAL_TRANSACTIONS: Transaction[] = [];

export const INITIAL_LOANS: Loan[] = [];

export const INITIAL_ASSETS: Asset[] = [];

export const INITIAL_PROFILE: UserProfile = {
  id: 'usr-guest-01',
  username: '',
  fullName: '',
  email: '',
  contactNumber: '',
  role: 'Primary Earner',
  theme: 'dark',
  currency: 'PHP',
  dailyNecessityCap: 500.00,
  activeScheduleDays: [1, 2, 4, 5, 6], // Mon, Tue, Thu, Fri, Sat
  restDayNecessityCap: 150.00,
};

// Storage helper functions
export const storageService = {
  async getWallets(): Promise<Wallet[]> {
    const wallets = await getItem<Wallet[]>(STORAGE_KEYS.WALLETS, INITIAL_WALLETS);
    try {
      const profile = await getItem<UserProfile>(STORAGE_KEYS.PROFILE, INITIAL_PROFILE);
      return await this.reconcileLegacyWallets(wallets, profile?.currency || 'PHP');
    } catch {
      return wallets;
    }
  },
  async reconcileLegacyWallets(wallets: Wallet[], profileCurrency?: string): Promise<Wallet[]> {
    const curr = profileCurrency || 'PHP';
    if (curr === 'PHP') {
      let changed = false;
      const healed = wallets.map((w) => {
        if (w.currency === 'USD' || !w.currency) {
          changed = true;
          return {
            ...w,
            currency: 'PHP',
            updatedAt: new Date().toISOString(),
          };
        }
        return w;
      });
      if (changed) {
        await this.saveWallets(healed);
        return healed;
      }
    }
    return wallets;
  },
  async saveWallets(wallets: Wallet[]): Promise<void> {
    await setItem(STORAGE_KEYS.WALLETS, wallets);
  },
  async getTransactions(): Promise<Transaction[]> {
    return getItem<Transaction[]>(STORAGE_KEYS.TRANSACTIONS, INITIAL_TRANSACTIONS);
  },
  async saveTransactions(txs: Transaction[]): Promise<void> {
    await setItem(STORAGE_KEYS.TRANSACTIONS, txs);
  },
  async getLoans(): Promise<Loan[]> {
    return getItem<Loan[]>(STORAGE_KEYS.LOANS, INITIAL_LOANS);
  },
  async saveLoans(loans: Loan[]): Promise<void> {
    await setItem(STORAGE_KEYS.LOANS, loans);
  },
  async getAssets(): Promise<Asset[]> {
    return getItem<Asset[]>(STORAGE_KEYS.ASSETS, INITIAL_ASSETS);
  },
  async saveAssets(assets: Asset[]): Promise<void> {
    await setItem(STORAGE_KEYS.ASSETS, assets);
  },
  async getAiConfig(): Promise<AiConfig> {
    return getItem<AiConfig>(STORAGE_KEYS.AI_CONFIG, {});
  },
  async saveAiConfig(config: AiConfig): Promise<void> {
    const existing = await getItem<AiConfig>(STORAGE_KEYS.AI_CONFIG, {});
    const merged: AiConfig = {
      aiBaseUrl: config.aiBaseUrl !== undefined ? config.aiBaseUrl : existing.aiBaseUrl,
      aiApiKey: config.aiApiKey !== undefined ? config.aiApiKey : existing.aiApiKey,
      aiModel: config.aiModel !== undefined ? config.aiModel : existing.aiModel,
    };
    await setItem(STORAGE_KEYS.AI_CONFIG, merged);
  },
  async getProfile(): Promise<UserProfile> {
    const [p, ai] = await Promise.all([
      getItem<UserProfile>(STORAGE_KEYS.PROFILE, INITIAL_PROFILE),
      getItem<AiConfig>(STORAGE_KEYS.AI_CONFIG, {}),
    ]);
    return {
      ...p,
      aiBaseUrl: p.aiBaseUrl || ai.aiBaseUrl,
      aiApiKey: p.aiApiKey || ai.aiApiKey,
      aiModel: p.aiModel || ai.aiModel,
    };
  },
  async saveProfile(profile: UserProfile): Promise<void> {
    await setItem(STORAGE_KEYS.PROFILE, profile);
    if (profile.aiBaseUrl !== undefined || profile.aiApiKey !== undefined || profile.aiModel !== undefined) {
      await this.saveAiConfig({
        aiBaseUrl: profile.aiBaseUrl,
        aiApiKey: profile.aiApiKey,
        aiModel: profile.aiModel,
      });
    }
  },
  async resetProfile(): Promise<void> {
    await setItem(STORAGE_KEYS.PROFILE, INITIAL_PROFILE);
  },
  async clearAllData(): Promise<void> {
    try {
      localStorage.clear();
      await setItem(STORAGE_KEYS.PROFILE, INITIAL_PROFILE);
      await setItem(STORAGE_KEYS.WALLETS, INITIAL_WALLETS);
      await setItem(STORAGE_KEYS.TRANSACTIONS, []);
      await setItem(STORAGE_KEYS.LOANS, []);
      await setItem(STORAGE_KEYS.ASSETS, []);
    } catch {
      // ignore
    }
  },
};

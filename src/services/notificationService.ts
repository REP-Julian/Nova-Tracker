import {
  isPermissionGranted as tauriIsPermissionGranted,
  requestPermission as tauriRequestPermission,
  sendNotification as tauriSendNotification,
} from '@tauri-apps/plugin-notification';

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  type: 'transaction' | 'budget' | 'loan' | 'sync' | 'system';
  timestamp: string; // ISO string
  read: boolean;
}

const STORAGE_KEY = 'bt_notification_history';
type NotificationListener = (notifications: AppNotification[]) => void;
type ToastListener = (notification: AppNotification) => void;

class NotificationService {
  private listeners: Set<NotificationListener> = new Set();
  private toastListeners: Set<ToastListener> = new Set();
  private isTauriEnv: boolean | null = null;

  constructor() {
    this.initServiceWorker();
  }

  private async initServiceWorker() {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator && !this.detectTauri()) {
      try {
        await navigator.serviceWorker.register('/sw.js');
      } catch (err) {
        console.warn('Service worker registration failed:', err);
      }
    }
  }

  private detectTauri(): boolean {
    if (this.isTauriEnv !== null) return this.isTauriEnv;
    if (typeof window === 'undefined') {
      this.isTauriEnv = false;
      return false;
    }
    this.isTauriEnv = Boolean(
      (window as any).__TAURI_INTERNALS__ || (window as any).__TAURI__
    );
    return this.isTauriEnv;
  }

  public subscribe(listener: NotificationListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public onToast(listener: ToastListener): () => void {
    this.toastListeners.add(listener);
    return () => this.toastListeners.delete(listener);
  }

  private notifyListeners(list: AppNotification[]) {
    this.listeners.forEach((fn) => {
      try {
        fn(list);
      } catch (e) {
        console.warn('Notification listener error:', e);
      }
    });
  }

  private notifyToast(item: AppNotification) {
    this.toastListeners.forEach((fn) => {
      try {
        fn(item);
      } catch (e) {
        console.warn('Toast listener error:', e);
      }
    });
  }

  public async getHistory(): Promise<AppNotification[]> {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as AppNotification[]) : [];
    } catch {
      return [];
    }
  }

  public async saveHistory(list: AppNotification[]): Promise<void> {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(0, 50))); // Keep latest 50
    } catch {
      // ignore
    }
    this.notifyListeners(list);
  }

  public async markAllAsRead(): Promise<void> {
    const list = await this.getHistory();
    const updated = list.map((n) => ({ ...n, read: true }));
    await this.saveHistory(updated);
  }

  public async clearHistory(): Promise<void> {
    await this.saveHistory([]);
  }

  public async checkPermission(): Promise<boolean> {
    if (typeof window === 'undefined') return false;
    if (this.detectTauri()) {
      try {
        return await tauriIsPermissionGranted();
      } catch {
        // Fallback to web
      }
    }
    if ('Notification' in window) {
      return Notification.permission === 'granted';
    }
    return false;
  }

  public async requestPermission(): Promise<boolean> {
    if (typeof window === 'undefined') return false;

    // 1. Try Tauri Plugin Notification
    if (this.detectTauri()) {
      try {
        let granted = await tauriIsPermissionGranted();
        if (!granted) {
          const res = await tauriRequestPermission();
          granted = res === 'granted';
        }
        if (granted) return true;
      } catch (err) {
        console.warn('Tauri permission request failed:', err);
      }
    }

    // 2. Fallback to Web Notification API
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const res = await Notification.requestPermission();
        if (res === 'granted' && 'serviceWorker' in navigator) {
          await this.initServiceWorker();
        }
        return res === 'granted';
      } catch (e) {
        console.warn('Web notification request failed:', e);
      }
    }

    return false;
  }

  public async send(
    title: string,
    body: string,
    type: AppNotification['type'] = 'system'
  ): Promise<boolean> {
    // Record into history
    const item: AppNotification = {
      id: crypto.randomUUID ? crypto.randomUUID() : `notif-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      title,
      body,
      type,
      timestamp: new Date().toISOString(),
      read: false,
    };
    const current = await this.getHistory();
    await this.saveHistory([item, ...current]);

    // Instantly notify in-app toast banner listeners
    this.notifyToast(item);

    // Haptic vibration feedback on mobile
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      try {
        navigator.vibrate([120, 60, 120]);
      } catch {
        // ignore
      }
    }

    // Try Tauri native push/phone notification first
    if (this.detectTauri()) {
      try {
        const granted = await tauriIsPermissionGranted();
        if (granted) {
          tauriSendNotification({ title, body });
          return true;
        } else {
          const req = await tauriRequestPermission();
          if (req === 'granted') {
            tauriSendNotification({ title, body });
            return true;
          }
        }
      } catch (err) {
        console.warn('Tauri sendNotification error, fallback to Web API:', err);
      }
    }

    // Service Worker Notification (Primary mechanism for Android Chrome & mobile browsers)
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator && 'Notification' in window) {
      try {
        if (Notification.permission === 'granted') {
          const reg = await navigator.serviceWorker.ready;
          if (reg && typeof reg.showNotification === 'function') {
            await reg.showNotification(title, {
              body,
              icon: '/vite.svg',
              badge: '/vite.svg',
              tag: item.id,
            });
            return true;
          }
        }
      } catch (swErr) {
        console.warn('ServiceWorker showNotification failed, trying standard constructor:', swErr);
      }
    }

    // Fallback to Desktop Web Notification API
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        if (Notification.permission === 'granted') {
          new Notification(title, {
            body,
            icon: '/vite.svg',
            badge: '/vite.svg',
          });
          return true;
        }
      } catch (e) {
        console.warn('Web Notification send failed:', e);
      }
    }

    return false;
  }

  // --- Real-time Event Helpers ---

  public async notifyTransaction(
    type: 'expense' | 'income',
    amount: number,
    currencySymbol: string,
    category: string,
    walletName?: string
  ) {
    const formattedAmt = `${currencySymbol}${amount.toFixed(2)}`;
    const title = type === 'expense' ? `Expense Logged: -${formattedAmt}` : `Income Received: +${formattedAmt}`;
    const body = `${category}${walletName ? ` • ${walletName}` : ''}`;
    return this.send(title, body, 'transaction');
  }

  public async notifyBudgetAlert(
    spent: number,
    cap: number,
    currencySymbol: string,
    isOver: boolean
  ) {
    if (isOver) {
      const overAmount = (spent - cap).toFixed(2);
      return this.send(
        '⚠️ Daily Necessity Budget Exceeded!',
        `You spent ${currencySymbol}${spent.toFixed(2)}, exceeding your daily allowance by ${currencySymbol}${overAmount}.`,
        'budget'
      );
    } else {
      return this.send(
        '⚡ Approaching Daily Necessity Cap',
        `You have used 80%+ of your daily allowance (${currencySymbol}${spent.toFixed(2)} / ${currencySymbol}${cap.toFixed(2)}).`,
        'budget'
      );
    }
  }

  public async notifyLoanEvent(
    action: 'lent' | 'repaid',
    borrowerName: string,
    amount: number,
    currencySymbol: string,
    notes?: string
  ) {
    if (action === 'lent') {
      return this.send(
        '🤝 Money Lent Out Recorded',
        `${currencySymbol}${amount.toFixed(2)} lent to ${borrowerName}${notes ? ` (${notes})` : ''}. Logged as receivable asset.`,
        'loan'
      );
    } else {
      return this.send(
        '💰 Loan Repayment Received',
        `Received ${currencySymbol}${amount.toFixed(2)} from ${borrowerName}. Wallet balance updated.`,
        'loan'
      );
    }
  }

  public async notifyCloudSync(message: string) {
    return this.send('☁️ Cloud Real-Time Sync', message, 'sync');
  }

  public async sendTestNotification(): Promise<boolean> {
    await this.requestPermission();
    return this.send(
      '🔔 Test Notification Active',
      `Real-time phone notifications are working properly! (${new Date().toLocaleTimeString()})`,
      'system'
    );
  }
}

export const notificationService = new NotificationService();

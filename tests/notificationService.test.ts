import { describe, it, expect, beforeEach, vi } from 'vitest';
import { notificationService } from '../src/services/notificationService';

describe('NotificationService System', () => {
  beforeEach(async () => {
    await notificationService.clearHistory();
  });

  it('records sent notification into local history with unread state', async () => {
    await notificationService.send('Budget Alert', 'You are at 85% of allowance', 'budget');
    const history = await notificationService.getHistory();

    expect(history.length).toBe(1);
    expect(history[0].title).toBe('Budget Alert');
    expect(history[0].body).toBe('You are at 85% of allowance');
    expect(history[0].type).toBe('budget');
    expect(history[0].read).toBe(false);
  });

  it('marks all notifications as read', async () => {
    await notificationService.send('Notice 1', 'Message 1');
    await notificationService.send('Notice 2', 'Message 2');

    let history = await notificationService.getHistory();
    expect(history.filter((n) => !n.read).length).toBe(2);

    await notificationService.markAllAsRead();
    history = await notificationService.getHistory();
    expect(history.filter((n) => !n.read).length).toBe(0);
  });

  it('clears notification history properly', async () => {
    await notificationService.send('Notice 1', 'Message 1');
    expect((await notificationService.getHistory()).length).toBe(1);

    await notificationService.clearHistory();
    expect((await notificationService.getHistory()).length).toBe(0);
  });

  it('fires transaction notification with correct formatted message', async () => {
    await notificationService.notifyTransaction('expense', 45.5, '$', 'Food', 'Cash Wallet');
    const history = await notificationService.getHistory();

    expect(history[0].title).toBe('Expense Logged: -$45.50');
    expect(history[0].body).toContain('Food');
    expect(history[0].body).toContain('Cash Wallet');
    expect(history[0].type).toBe('transaction');
  });

  it('fires loan notification for money lent and repayment', async () => {
    await notificationService.notifyLoanEvent('lent', 'Bob', 200, '$', 'Emergency medical');
    let history = await notificationService.getHistory();
    expect(history[0].title).toBe('🤝 Money Lent Out Recorded');
    expect(history[0].body).toContain('Bob');

    await notificationService.notifyLoanEvent('repaid', 'Bob', 50, '$');
    history = await notificationService.getHistory();
    expect(history[0].title).toBe('💰 Loan Repayment Received');
  });

  it('notifies listeners when a new notification is recorded', async () => {
    const listener = vi.fn();
    const unsubscribe = notificationService.subscribe(listener);

    await notificationService.send('Live Alert', 'Testing real-time pub/sub');
    expect(listener).toHaveBeenCalled();
    const passedList = listener.mock.calls[0][0];
    expect(passedList.length).toBe(1);
    expect(passedList[0].title).toBe('Live Alert');

    unsubscribe();
  });

  it('triggers onToast listener with the newly created notification item', async () => {
    const toastSpy = vi.fn();
    const unsub = notificationService.onToast(toastSpy);

    await notificationService.send('Phone Real-Time Alert', 'Transaction saved successfully');
    expect(toastSpy).toHaveBeenCalledTimes(1);
    expect(toastSpy.mock.calls[0][0].title).toBe('Phone Real-Time Alert');
    expect(toastSpy.mock.calls[0][0].body).toBe('Transaction saved successfully');

    unsub();
  });
});

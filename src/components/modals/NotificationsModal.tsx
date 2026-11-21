import { createPortal } from 'react-dom';
import React, { useState, useEffect } from 'react';
import {
  X,
  Bell,
  AlertTriangle,
  Sparkles,
  HandCoins,
  CheckCircle2,
  Trash2,
  RefreshCw,
} from 'lucide-react';
import { Transaction, Loan, UserProfile } from '../../types';
import { notificationService, AppNotification } from '../../services/notificationService';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  loans: Loan[];
  profile: UserProfile;
  currencySymbol?: string;
}

export interface SmartNotification {
  id: string;
  title: string;
  message: string;
  type: 'alert' | 'loan' | 'tip' | 'info';
  timestamp: string;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  transactions,
  loans,
  profile,
  currencySymbol = '$',
}) => {
  const [history, setHistory] = useState<AppNotification[]>([]);

  useEffect(() => {
    if (isOpen) {
      notificationService.getHistory().then((list) => {
        setHistory(list);
        notificationService.markAllAsRead();
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Generate dynamic, live intelligent updates based on actual user data
  const dynamicAlerts: SmartNotification[] = [];

  // 1. Daily Necessity Cap Check
  const todayStr = new Date().toISOString().split('T')[0];
  const todayNecessitySpend = transactions
    .filter((t) => t.type === 'expense' && t.isNecessity && t.date.startsWith(todayStr))
    .reduce((sum, t) => sum + t.amount, 0);

  if (todayNecessitySpend > profile.dailyNecessityCap) {
    dynamicAlerts.push({
      id: 'cap-exceeded',
      title: 'Daily Necessity Cap Exceeded',
      message: `You spent ${currencySymbol}${todayNecessitySpend.toFixed(2)} on essentials today, exceeding your ${currencySymbol}${profile.dailyNecessityCap.toFixed(2)} target.`,
      type: 'alert',
      timestamp: 'Today',
    });
  } else if (todayNecessitySpend > 0) {
    dynamicAlerts.push({
      id: 'cap-status',
      title: 'Daily Necessity Status',
      message: `${currencySymbol}${todayNecessitySpend.toFixed(2)} spent out of ${currencySymbol}${profile.dailyNecessityCap.toFixed(2)} allowance.`,
      type: 'tip',
      timestamp: 'Today',
    });
  }

  // 2. Uncollected Loans Alert
  const pendingLoans = loans.filter((l) => l.status === 'active' || l.status === 'partial');
  const totalReceivable = pendingLoans.reduce((sum, l) => sum + l.remainingAmount, 0);

  if (pendingLoans.length > 0) {
    dynamicAlerts.push({
      id: 'pending-loans',
      title: `${pendingLoans.length} Outstanding Loan(s)`,
      message: `You have ${currencySymbol}${totalReceivable.toFixed(2)} waiting to be collected from borrowers.`,
      type: 'loan',
      timestamp: 'Active',
    });
  }

  // 3. Welcome / Status notice
  dynamicAlerts.push({
    id: 'db-sync',
    title: 'Cloud Real-Time Sync',
    message: profile.email
      ? `Encrypted session active for ${profile.email}. Real-time Supabase subscriptions running.`
      : 'Local offline storage active. Sign in via profile to backup & sync to cloud in real-time.',
    type: 'info',
    timestamp: 'System',
  });

  const handleClearHistory = async () => {
    await notificationService.clearHistory();
    setHistory([]);
  };

  const formatTimestamp = (iso: string) => {
    try {
      const d = new Date(iso);
      if (isNaN(d.getTime())) return 'Recently';
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return 'Recently';
    }
  };

  const modalContent = (
    <div className="auth-overlay" onClick={onClose} style={{ zIndex: 9999 }}>
      <div
        className="auth-modal-sheet"
        onClick={(e) => e.stopPropagation()}
        style={{ maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: 'var(--radius-full)',
                background: 'var(--role-accent-bg, rgba(232, 249, 83, 0.15))',
                color: 'var(--role-accent-color, var(--neon-yellow))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Bell size={16} />
            </div>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                Activity & Alerts
              </h3>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Real-time phone notifications & ledger updates
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {history.length > 0 && (
              <button
                type="button"
                className="icon-circle-btn"
                title="Clear activity log"
                onClick={handleClearHistory}
                style={{ width: '32px', height: '32px', color: 'var(--text-muted)' }}
              >
                <Trash2 size={14} />
              </button>
            )}
            <button type="button" className="icon-circle-btn" onClick={onClose} style={{ width: '36px', height: '36px' }}>
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Notifications Scroll List */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {/* Recent Real-Time Notifications History */}
          {history.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Recent Real-Time Notifications ({history.length})
              </div>
              {history.map((h) => (
                <div
                  key={h.id}
                  style={{
                    padding: '12px 14px',
                    borderRadius: '14px',
                    background: 'var(--card-surface)',
                    border: '1px solid var(--card-border)',
                    display: 'flex',
                    gap: '12px',
                  }}
                >
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: 'var(--radius-full)',
                      flexShrink: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background:
                        h.type === 'budget'
                          ? 'rgba(244, 63, 94, 0.15)'
                          : h.type === 'transaction'
                          ? 'rgba(34, 197, 94, 0.15)'
                          : h.type === 'loan'
                          ? 'var(--role-accent-bg, rgba(232, 249, 83, 0.15))'
                          : 'rgba(56, 189, 248, 0.15)',
                      color:
                        h.type === 'budget'
                          ? 'var(--accent-pink)'
                          : h.type === 'transaction'
                          ? 'var(--accent-green)'
                          : h.type === 'loan'
                          ? 'var(--role-accent-color, var(--neon-yellow))'
                          : 'var(--accent-blue)',
                    }}
                  >
                    {h.type === 'budget' && <AlertTriangle size={15} />}
                    {h.type === 'transaction' && <CheckCircle2 size={15} />}
                    {h.type === 'loan' && <HandCoins size={15} />}
                    {h.type === 'sync' && <RefreshCw size={15} />}
                    {h.type === 'system' && <Sparkles size={15} />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>{h.title}</div>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{formatTimestamp(h.timestamp)}</span>
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px', lineHeight: 1.4 }}>
                      {h.body}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* System & Financial Status Overview */}
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: history.length > 0 ? '6px' : '0' }}>
            Financial Insights & Status
          </div>
          {dynamicAlerts.map((n) => (
            <div
              key={n.id}
              style={{
                padding: '14px',
                borderRadius: '16px',
                background: 'var(--card-surface)',
                border:
                  n.type === 'alert'
                    ? '1px solid rgba(244, 63, 94, 0.3)'
                    : n.type === 'loan'
                    ? '1px solid var(--role-accent-border, rgba(232, 249, 83, 0.25))'
                    : '1px solid var(--card-border)',
                display: 'flex',
                gap: '12px',
              }}
            >
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: 'var(--radius-full)',
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background:
                    n.type === 'alert'
                      ? 'rgba(244, 63, 94, 0.15)'
                      : n.type === 'loan'
                      ? 'var(--role-accent-bg, rgba(232, 249, 83, 0.15))'
                      : 'rgba(56, 189, 248, 0.15)',
                  color:
                    n.type === 'alert'
                      ? 'var(--accent-pink)'
                      : n.type === 'loan'
                      ? 'var(--role-accent-color, var(--neon-yellow))'
                      : 'var(--accent-blue)',
                }}
              >
                {n.type === 'alert' && <AlertTriangle size={18} />}
                {n.type === 'loan' && <HandCoins size={18} />}
                {n.type === 'tip' && <Sparkles size={18} />}
                {n.type === 'info' && <CheckCircle2 size={18} />}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>{n.title}</div>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{n.timestamp}</span>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.4 }}>
                  {n.message}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent;
};

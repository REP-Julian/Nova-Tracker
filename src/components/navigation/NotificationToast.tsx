import React, { useEffect, useState } from 'react';
import { Bell, AlertTriangle, ArrowRightLeft, Handshake, X } from 'lucide-react';
import { AppNotification, notificationService } from '../../services/notificationService';

interface NotificationToastProps {
  onOpenNotifications: () => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({ onOpenNotifications }) => {
  const [activeToast, setActiveToast] = useState<AppNotification | null>(null);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    const unsub = notificationService.onToast((notif) => {
      setActiveToast(notif);
      setIsClosing(false);
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (!activeToast) return;

    const timer = setTimeout(() => {
      setIsClosing(true);
      setTimeout(() => {
        setActiveToast(null);
        setIsClosing(false);
      }, 300);
    }, 4500);

    return () => clearTimeout(timer);
  }, [activeToast]);

  if (!activeToast) return null;

  const getIcon = () => {
    switch (activeToast.type) {
      case 'transaction':
        return <ArrowRightLeft size={18} color="#22C55E" />;
      case 'budget':
        return <AlertTriangle size={18} color="#F43F5E" />;
      case 'loan':
        return <Handshake size={18} color="#F59E0B" />;
      default:
        return <Bell size={18} color="#38BDF8" />;
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: '16px',
        left: '50%',
        transform: `translateX(-50%) translateY(${isClosing ? '-20px' : '0'})`,
        opacity: isClosing ? 0 : 1,
        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        zIndex: 99999,
        width: 'calc(100% - 32px)',
        maxWidth: '400px',
        background: 'rgba(18, 24, 38, 0.95)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        borderRadius: '16px',
        padding: '12px 14px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        boxShadow: '0 12px 32px -4px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.05)',
        cursor: 'pointer',
      }}
      onClick={() => {
        onOpenNotifications();
        setActiveToast(null);
      }}
    >
      <div
        style={{
          width: '36px',
          height: '36px',
          borderRadius: '10px',
          background: 'rgba(255, 255, 255, 0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {getIcon()}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: '13px',
            fontWeight: 700,
            color: '#FFFFFF',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {activeToast.title}
        </div>
        <div
          style={{
            fontSize: '11px',
            color: 'rgba(255, 255, 255, 0.7)',
            marginTop: '2px',
            lineHeight: 1.3,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {activeToast.body}
        </div>
      </div>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsClosing(true);
          setTimeout(() => setActiveToast(null), 300);
        }}
        style={{
          background: 'transparent',
          border: 'none',
          padding: '4px',
          cursor: 'pointer',
          color: 'rgba(255, 255, 255, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        aria-label="Close notification"
      >
        <X size={16} />
      </button>
    </div>
  );
};

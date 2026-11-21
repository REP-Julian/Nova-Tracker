import { useState, useEffect } from 'react';
import { FinanceEngine } from '../services/financeEngine';

/**
 * Hook that triggers state update at 12:00:00 AM midnight (local time)
 * and upon device wakeup/tab focus. Ensures daily necessity allowance
 * and spent amount automatically reset for the new calendar day.
 */
export function useMidnightReset(): string {
  const [currentDate, setCurrentDate] = useState<string>(() => FinanceEngine.getLocalDateString());

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    const scheduleNextMidnight = () => {
      const now = new Date();
      // Target tomorrow at 00:00:00.050 (50ms past midnight)
      const nextMidnight = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1,
        0,
        0,
        0,
        50
      );
      const msUntilMidnight = Math.max(100, nextMidnight.getTime() - now.getTime());

      timeoutId = setTimeout(() => {
        const freshDate = FinanceEngine.getLocalDateString();
        setCurrentDate(freshDate);
        scheduleNextMidnight();
      }, msUntilMidnight);
    };

    scheduleNextMidnight();

    const checkDateChange = () => {
      const freshDate = FinanceEngine.getLocalDateString();
      if (freshDate !== currentDate) {
        setCurrentDate(freshDate);
      }
    };

    // 15-second heartbeat for system clock drift or sleep/wake
    const intervalId = setInterval(checkDateChange, 15000);

    window.addEventListener('focus', checkDateChange);
    document.addEventListener('visibilitychange', checkDateChange);

    return () => {
      clearTimeout(timeoutId);
      clearInterval(intervalId);
      window.removeEventListener('focus', checkDateChange);
      document.removeEventListener('visibilitychange', checkDateChange);
    };
  }, [currentDate]);

  return currentDate;
}

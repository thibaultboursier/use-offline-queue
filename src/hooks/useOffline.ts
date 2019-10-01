import { useEffect, useState } from 'react';

export const useOffline = (
  onOfflineCallback?: () => void,
  onOnlineCallback?: () => void
) => {
  const [isOnline, setIsOnline] = useState<boolean>(() =>
    navigator && typeof navigator.onLine === 'boolean' ? navigator.onLine : true
  );

  useEffect(() => {
    addEventListener('online', onOnline);
    addEventListener('offline', onOffline);

    return () => {
      removeEventListener('online', onOnline);
      removeEventListener('offline', onOffline);
    };
  }, []);

  const onOffline = () => {
    setIsOnline(false);

    if (typeof onOfflineCallback === 'function') {
      onOfflineCallback();
    }
  };

  const onOnline = () => {
    setIsOnline(true);

    if (typeof onOnlineCallback === 'function') {
      onOnlineCallback();
    }
  };

  return {
    isOnline,
  };
};

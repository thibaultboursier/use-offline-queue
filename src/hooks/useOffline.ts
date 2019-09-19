import { useEffect, useRef } from 'react';

export const useOffline = (
  onOnlineCallback?: () => void,
  onOfflineCallback?: () => void
) => {
  const isOnlineRef = useRef<boolean>(
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
    isOnlineRef.current = false;

    if (typeof onOfflineCallback === 'function') {
      onOfflineCallback();
    }
  };

  const onOnline = () => {
    isOnlineRef.current = true;

    if (typeof onOnlineCallback === 'function') {
      onOnlineCallback();
    }
  };

  return {
    isOnline: isOnlineRef.current,
  };
};

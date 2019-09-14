import { useEffect, useRef, useState } from 'react';

export interface Config {
  isQueueAsync?: boolean;
  timeoutInMS?: number;
}

const initialConfig: Config = {
  isQueueAsync: false,
};

export const useOfflineQueue = (config?: Partial<Config>) => {
  const { isQueueAsync, timeoutInMS } = {
    ...initialConfig,
    ...config,
  };
  const [isOnline, setIsOnline] = useState(() =>
    navigator && typeof navigator.onLine === 'boolean' ? navigator.onLine : true
  );
  const offlineTimeoutRef = useRef<number>();
  const queueRef = useRef<Function[]>([]);

  useEffect(() => {
    addEventListener('online', onOnline);
    addEventListener('offline', onOffline);

    return () => {
      removeEventListener('online', onOnline);
      removeEventListener('offline', onOffline);
    };
  }, []);

  const clearQueue = () => {
    queueRef.current = [];
  };

  const createOfflineTimeout = () => {
    offlineTimeoutRef.current = setTimeout(clearQueue, timeoutInMS);
  };

  const dequeue = () => {
    if (isQueueAsync) {
      dequeueAsync();
    } else {
      dequeueSync();
    }
  };

  const dequeueAsync = async () => {
    for (const callback of queueRef.current) {
      await callback();
    }

    clearQueue();
  };

  const dequeueSync = async () => {
    queueRef.current.forEach(callback => callback());
    clearQueue();
  };

  const enqueue = (callback: Function) => {
    if (isOnline) {
      return callback();
    }

    offlineTimeoutRef.current && clearTimeout(offlineTimeoutRef.current);
    timeoutInMS && createOfflineTimeout();

    queueRef.current = [...queueRef.current, callback];
  };

  const getQueue = () => queueRef.current;

  const onOffline = () => {
    setIsOnline(false);

    if (!timeoutInMS) {
      return;
    }

    createOfflineTimeout();
  };

  const onOnline = () => {
    setIsOnline(true);
    offlineTimeoutRef.current && clearTimeout(offlineTimeoutRef.current);
    queueRef.current.length > 0 && dequeue();
  };

  const peek = () => queueRef.current[0];

  return {
    dequeue,
    dequeueAsync,
    dequeueSync,
    enqueue,
    getQueue,
    isOnline,
    peek,
  };
};

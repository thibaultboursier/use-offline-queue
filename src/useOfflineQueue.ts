import { useEffect, useRef, useState } from 'react';
import useForceUpdate from 'use-force-update';

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
  const forceUpdate = useForceUpdate();

  useEffect(() => {
    addEventListener('online', onOnline);
    addEventListener('offline', onOffline);

    return () => {
      removeEventListener('online', onOnline);
      removeEventListener('offline', onOffline);
    };
  }, []);

  const clearQueue = () => {
    queueRef.current.length = 0;
    forceUpdate();
  };

  const createOfflineTimeout = () => {
    offlineTimeoutRef.current = setTimeout(clearQueue, timeoutInMS);
  };

  const dequeueAll = () => {
    if (isQueueAsync) {
      dequeueAllAsync();
    } else {
      queueRef.current.forEach(callback => callback());
      clearQueue();
    }
  };

  const dequeueAllAsync = async () => {
    const callbacks = [...queueRef.current];

    for (const callback of callbacks) {
      await callback();
      queueRef.current.shift();
      forceUpdate();
    }

    clearQueue();
  };

  const enqueue = (callback: Function) => {
    if (isOnline) {
      return callback();
    }

    offlineTimeoutRef.current && clearTimeout(offlineTimeoutRef.current);
    timeoutInMS && createOfflineTimeout();

    queueRef.current.push(callback);
  };

  const isEmpty = (): boolean => queueRef.current.length === 0;

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
    queueRef.current.length > 0 && dequeueAll();
  };

  const peek = () => queueRef.current[0];

  return {
    dequeueAll,
    dequeueAllAsync,
    enqueue,
    isEmpty,
    queue: queueRef.current,
    isOnline,
    peek,
  };
};

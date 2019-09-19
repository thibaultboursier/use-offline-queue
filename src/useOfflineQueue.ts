import { useRef } from 'react';
import useForceUpdate from 'use-force-update';
import { useOffline } from './hooks/useOffline';
import { useQueue } from './hooks/useQueue';

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
  const offlineTimeoutRef = useRef<number>();
  const {
    clearQueue,
    dequeue,
    enqueue,
    isQueueEmpty,
    peek,
    queue,
  } = useQueue();
  const { isOnline } = useOffline(onOffline, onOnline);
  const forceUpdate = useForceUpdate();

  const dequeueAll = () => {
    if (isQueueAsync) {
      dequeueAllAsync();
    } else {
      queue.forEach(callback => callback());
      clearQueue();
    }
  };

  const dequeueAllAsync = async () => {
    const callbacks = [...queue];

    for (const callback of callbacks) {
      if (!isOnline) {
        return;
      }

      await callback();
      dequeue();
    }

    clearQueue();
  };

  const addToQueue = (callback: Function) => {
    if (isOnline) {
      callback();
      return;
    }

    clearTimeout(offlineTimeoutRef.current);
    timeoutInMS && createOfflineTimeout();
    enqueue(callback);
  };

  const createOfflineTimeout = () => {
    offlineTimeoutRef.current = setTimeout(clearQueue, timeoutInMS);
  };

  function onOffline() {
    forceUpdate();

    if (!timeoutInMS) {
      return;
    }

    createOfflineTimeout();
  }

  function onOnline() {
    clearTimeout(offlineTimeoutRef.current);
    queue.length > 0 && dequeueAll();
    forceUpdate();
  }

  return {
    dequeueAll,
    dequeueAllAsync,
    enqueue: addToQueue,
    isOnline,
    isQueueEmpty,
    peek,
    queue,
  };
};

import { useRef } from 'react';
import useForceUpdate from 'use-force-update';

export const useQueue = () => {
  const queueRef = useRef<Function[]>([]);
  const forceUpdate = useForceUpdate();

  const enqueue = (callback: Function) => {
    if (typeof callback !== 'function') {
      throw new Error('Only functions can be enqueued.');
    }

    queueRef.current.push(callback);
    forceUpdate();
  };

  const clearQueue = () => {
    queueRef.current.length = 0;
    forceUpdate();
  };

  const dequeue = () => {
    queueRef.current.shift();
    forceUpdate();
  };

  const isQueueEmpty = (): boolean => queueRef.current.length === 0;

  const peek = () => queueRef.current[0];

  return {
    clearQueue,
    dequeue,
    enqueue,
    isQueueEmpty,
    peek,
    queue: queueRef.current,
  };
};

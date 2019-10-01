import { renderHook, act } from '@testing-library/react-hooks';
import { useOfflineQueue } from './useOfflineQueue';

const changeOnlineStatus = (isOnline: boolean) => {
  const eventType = isOnline ? 'online' : 'offline';

  act(() => {
    window.dispatchEvent(new Event(eventType, { bubbles: true }));
  });
};

test('should contain three functions into queue when status is offline', () => {
  // Given
  const { result } = renderHook(() => useOfflineQueue());

  // When
  changeOnlineStatus(false);
  act(() => {
    result.current.enqueue(() => {});
    result.current.enqueue(() => {});
    result.current.enqueue(() => {});
  });

  // Then
  expect(result.current.isQueueEmpty()).toBe(false);
  expect(result.current.queue.length).toBe(3);
});

test('should not contain any function into queue after online status became true', () => {
  // Given
  const { result } = renderHook(() => useOfflineQueue());

  // When
  changeOnlineStatus(false);
  act(() => {
    result.current.enqueue(() => {});
    result.current.enqueue(() => {});
    result.current.enqueue(() => {});
  });
  changeOnlineStatus(true);

  // Then
  expect(result.current.isQueueEmpty()).toBe(true);
  expect(result.current.queue.length).toBe(0);
});

import { renderHook, act } from '@testing-library/react-hooks';
import { useOfflineQueue } from './useOfflineQueue';

const changeOnlineStatus = (isOnline: boolean) => {
  const eventType = isOnline ? 'online' : 'offline';

  act(() => {
    window.dispatchEvent(new Event(eventType, { bubbles: true }));
  });
};

test('should contain one function into queue when status is offline', () => {
  // Given
  const { result } = renderHook(() => useOfflineQueue());

  // When
  changeOnlineStatus(false);
  act(() => {
    result.current.enqueue(() => {});
  });

  // Then
  expect(result.current.isQueueEmpty()).toBe(false);
  expect(result.current.queue.length).toBe(1);
});

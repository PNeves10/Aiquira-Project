import { renderHook } from '@testing-library/react';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';

describe('useInfiniteScroll', () => {
  let mockIntersectionObserver: jest.Mock;
  let mockObserve: jest.Mock;
  let mockDisconnect: jest.Mock;

  beforeEach(() => {
    mockObserve = jest.fn();
    mockDisconnect = jest.fn();
    mockIntersectionObserver = jest.fn().mockImplementation((callback) => ({
      observe: mockObserve,
      disconnect: mockDisconnect,
    }));

    window.IntersectionObserver = mockIntersectionObserver;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create an IntersectionObserver with correct options', () => {
    const onLoadMore = jest.fn();
    renderHook(() =>
      useInfiniteScroll({
        loading: false,
        hasMore: true,
        onLoadMore,
        threshold: 200,
      })
    );

    expect(mockIntersectionObserver).toHaveBeenCalledWith(
      expect.any(Function),
      {
        rootMargin: '200px',
      }
    );
  });

  it('should call onLoadMore when element is intersecting', () => {
    const onLoadMore = jest.fn();
    renderHook(() =>
      useInfiniteScroll({
        loading: false,
        hasMore: true,
        onLoadMore,
      })
    );

    const callback = mockIntersectionObserver.mock.calls[0][0];
    callback([{ isIntersecting: true }]);

    expect(onLoadMore).toHaveBeenCalled();
  });

  it('should not call onLoadMore when loading', () => {
    const onLoadMore = jest.fn();
    renderHook(() =>
      useInfiniteScroll({
        loading: true,
        hasMore: true,
        onLoadMore,
      })
    );

    const callback = mockIntersectionObserver.mock.calls[0][0];
    callback([{ isIntersecting: true }]);

    expect(onLoadMore).not.toHaveBeenCalled();
  });

  it('should not call onLoadMore when hasMore is false', () => {
    const onLoadMore = jest.fn();
    renderHook(() =>
      useInfiniteScroll({
        loading: false,
        hasMore: false,
        onLoadMore,
      })
    );

    const callback = mockIntersectionObserver.mock.calls[0][0];
    callback([{ isIntersecting: true }]);

    expect(onLoadMore).not.toHaveBeenCalled();
  });

  it('should disconnect observer on unmount', () => {
    const { unmount } = renderHook(() =>
      useInfiniteScroll({
        loading: false,
        hasMore: true,
        onLoadMore: jest.fn(),
      })
    );

    unmount();
    expect(mockDisconnect).toHaveBeenCalled();
  });

  it('should observe element when ref is set', () => {
    const { result } = renderHook(() =>
      useInfiniteScroll({
        loading: false,
        hasMore: true,
        onLoadMore: jest.fn(),
      })
    );

    const mockElement = document.createElement('div');
    result.current(mockElement);

    expect(mockObserve).toHaveBeenCalledWith(mockElement);
  });
}); 
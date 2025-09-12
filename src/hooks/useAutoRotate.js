import { useInterval } from './useInterval';

/**
 * useAutoRotate
 * Calls onTick() every delay ms when enabled and there are at least 2 items.
 * @param {Object} params
 * @param {boolean} params.enabled
 * @param {number} params.delay
 * @param {number} params.length - number of items to rotate through
 * @param {() => void} params.onTick
 */
export function useAutoRotate({ enabled, delay, length, onTick }) {
  useInterval(() => {
    if (enabled && length > 1) onTick();
  }, enabled ? delay : null);
}

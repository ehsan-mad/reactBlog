// Stable setInterval hook
// Pass delay as null to pause the interval without tearing it down permanently.
import { useEffect, useRef } from 'react';

/**
 * useInterval
 * A React hook that calls the latest callback at a specified interval.
 * @param {() => void} callback - Function to be called on each tick
 * @param {number|null} delay - Interval in ms; set to null to stop
 */
export function useInterval(callback, delay) {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (delay === null) return undefined;
    const id = setInterval(() => savedCallback.current(), delay);
    return () => clearInterval(id);
  }, [delay]);
}

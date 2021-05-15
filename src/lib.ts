const rejectAfter = (ms: number) =>
  new Promise<never>((_resolve, reject) => {
    setTimeout(() => {
      reject("Timeout passed");
    }, ms);
  });

const defaultOptions = {
  timeout: 10_000,
};

/**
 * Any pure function in the form `(...args) => Promise`, can be passed to `deduper` and subsequent
 * requests with the same arguments will wait for the result of the first one that arrived.
 * This is meant to prevent unnecessary http or database requests.
 * @param keyFn function that generates key for the internal cache, receives same params as the deduped function
 * @param fn function whose invocation is being deduplicated
 * @param options { timeout } - timeout in ms after which the task fails, default is 10s
 */
const deduper = <Key extends any, FnParams extends any[], Result extends any>(
  keyFn: (...params: FnParams) => Key,
  fn: (...params: FnParams) => Promise<Result>,
  options = defaultOptions
) => {
  const currentOptions = { ...defaultOptions, ...options };
  const cache = new Map<Key, Promise<Result>>();

  return (...params: FnParams) => {
    const key = keyFn(...params);
    const p = cache.get(key);

    // Calculation is in progress
    if (p) {
      return p.then((res) => {
        cache.delete(key);
        return res;
      });
    }

    // Record and return new calculation
    // from here all the calls to the same
    const newP = Promise.race([
      fn(...params),
      rejectAfter(currentOptions.timeout),
    ]).finally(() => {
      cache.delete(key);
    });

    cache.set(key, newP as Promise<Result>);

    return newP;
  };
};

export { deduper };

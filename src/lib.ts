const rejectAfter = (ms: number) =>
  new Promise<never>((_resolve, reject) => {
    setTimeout(() => {
      reject("Timeout passed");
    }, ms);
  });

const defaultOptions = {
  timeout: 10_000,
};

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

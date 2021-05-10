const deduper = <Key extends any, FnParams extends any[], Result extends any>(
  keyFn: (...params: FnParams) => Key,
  fn: (...params: FnParams) => Promise<Result>
) => {
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
    const newP = fn(...params).then((res) => {
      cache.delete(key);
      return res;
    });

    cache.set(key, newP);

    return newP;
  };
};

export { deduper };

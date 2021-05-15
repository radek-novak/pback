# pback

_(piggy-back)_

_**Experimental and untested**_

Any pure function in the form `(...args) => Promise`, can be passed to `deduper` and subsequent
requests with the same arguments will wait for the result of the first one that arrived.
This is meant to prevent unnecessary http or database requests.

```
npm install pback
```

```JS
/**
 * @param keyFn function that generates key for the internal cache, receives same params as the deduped function
 * @param fn function whose invocation is being deduplicated
 * @param options { timeout } - timeout in ms after which the task fails, default is 10s
 * @returns promise (same as the fn)
 */
```

```TypeScript
  import { deduper } from 'pback';

  // an expensive async task that'll be repeated
  const getUser = (userId: number) => {
    return fetch(`/api/user/${userId.toString()}`)
  };

  const dedGetUser = deduper(id => id, getUser, {
    timeout: 1000,
  });


  // Consecutive requests will make only 2 fetches (as long as they arrive)
  getUser(1);
  // later
  getUser(2);
  // ...
  getUser(2);
  // ...
  getUser(1);
  // ...
  getUser(1);


```

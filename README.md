# pback

Any pure function in the form `(...args) => Promise`, can be passed to `deduper` and subsequent
requests with the same arguments will wait for the result of the first one that arrived.
Typically, you'd use this for

```
npm install
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

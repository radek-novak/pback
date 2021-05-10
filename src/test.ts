import { deduper } from "./lib";

async function run() {
  let calledTimes = 0;

  const expensiveCalculation = (id: string, time = 1000) => {
    calledTimes++;

    return new Promise((resolve) => {
      setTimeout(() => resolve(id.toUpperCase()), time);
    });
  };

  const dedupedExpensiveCalc = deduper((id, n) => id, expensiveCalculation);

  const result = await Promise.all(
    new Array(100)
      .fill(0)
      .map((_, i) => dedupedExpensiveCalc(i % 3 === 0 ? "a" : "b", i))
  );

  console.log({ result });

  console.assert(
    calledTimes === 2,
    `Was called ${calledTimes} times instead of twice`
  );
}

run();

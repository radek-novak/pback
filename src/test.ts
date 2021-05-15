import { deduper } from "./lib";

const sleep = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

async function succeeding() {
  let calledTimes = 0;

  const expensiveCalculation = (id: string, time = 100) => {
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

  console.log({ succeeding: result });

  console.assert(
    calledTimes === 2,
    `Was called ${calledTimes} times instead of twice`
  );
}

async function timingOut() {
  let calledTimes = 0;

  const expensiveCalculation = (id: string, time: number) => {
    calledTimes++;

    return new Promise((resolve) => {
      setTimeout(() => resolve(id.toUpperCase()), time);
    });
  };

  const dedupedExpensiveCalc = deduper((id, n) => id, expensiveCalculation, {
    timeout: 1,
  });

  const result = await Promise.all(
    new Array(100)
      .fill(0)
      .map((_, i) => dedupedExpensiveCalc(i % 3 === 0 ? "a" : "b", 100))
  ).catch((e) => e);

  console.log({ timingOut: result });

  console.assert(result === "Timeout passed", `Timed out: ${result}`);
  console.assert(
    calledTimes === 2,
    `Was called ${calledTimes} times instead of twice`
  );
}

async function succeedingLastLate() {
  let calledTimes = 0;

  const expensiveCalculation = (id: string, time = 100) => {
    calledTimes++;

    return new Promise<string>((resolve) => {
      setTimeout(() => resolve(id.toUpperCase()), time);
    });
  };

  const dedupedExpensiveCalc = deduper((id, n) => id, expensiveCalculation, {
    timeout: 100,
  });

  dedupedExpensiveCalc("a", 10);
  dedupedExpensiveCalc("b", 10);
  dedupedExpensiveCalc("c", 10);
  dedupedExpensiveCalc("a", 10);
  await sleep(1);
  dedupedExpensiveCalc("a", 10);
  await sleep(200);
  dedupedExpensiveCalc("a", 10);

  await sleep(100);

  console.assert(
    calledTimes === 4,
    `Was called ${calledTimes} times instead of 4`
  );
}

const scenarios = [succeeding, timingOut, succeedingLastLate];
scenarios.forEach(async (sc) => await sc());

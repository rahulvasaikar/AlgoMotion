import { traceExecution } from "./trace.ts";

async function run() {
  const cases = [
    {
      name: "Two Sum",
      code: `def twoSum(nums, target):
    prevMap = {}
    for i, n in enumerate(nums):
        diff = target - n
        if diff in prevMap:
            return [prevMap[diff], i]
        prevMap[n] = i
    return []`,
      args: [[2, 7, 11, 15], 9],
    },
    {
      name: "Best Time to Buy and Sell Stock",
      code: `def maxProfit(prices):
    min_price = float('inf')
    max_profit = 0
    for i, p in enumerate(prices):
        if p < min_price:
            min_price = p
        elif p - min_price > max_profit:
            max_profit = p - min_price
    return max_profit`,
      args: [[7, 1, 5, 3, 6, 4]],
    },
    {
      name: "Contains Duplicate",
      code: `def containsDuplicate(nums):
    seen = set()
    for i, n in enumerate(nums):
        if n in seen:
            return True
        seen.add(n)
    return False`,
      args: [[1, 2, 3, 1]],
    },
    {
      name: "Maximum Subarray (Kadane)",
      code: `def maxSubArray(nums):
    max_sum = nums[0]
    cur_sum = 0
    for i, n in enumerate(nums):
        cur_sum = max(cur_sum, 0) + n
        max_sum = max(max_sum, cur_sum)
    return max_sum`,
      args: [[-2, 1, -3, 4, -1, 2, 1, -5, 4]],
    },
  ];

  for (const c of cases) {
    try {
      const res = await traceExecution({ code: c.code, args: c.args });
      console.log(`✅ ${c.name}: ${res.totalSteps} steps | Return:`, res.returnValue);
    } catch (e) {
      console.error(`❌ ${c.name} failed:`, e);
    }
  }
}

run();

import type {
  AlgoMotionProps,
  AlgorithmApproach,
  ComplexityComparisonRow,
  YouTubeDeepDivePayload,
} from "../../src/types.ts";
import { extractSlug } from "../generate.ts";

export interface CustomProblemInput {
  title: string;
  description?: string;
  difficulty?: "Easy" | "Medium" | "Hard";
  testcase?: string;
  code?: string;
}

export async function solveCustomProblem(
  input: CustomProblemInput,
): Promise<AlgoMotionProps> {
  const slug = extractSlug(input.title);
  const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

  if (geminiKey) {
    try {
      const generated = await solveWithGemini(input, geminiKey);
      if (generated) return generated;
    } catch (err) {
      console.warn("[CustomProblemSolver] Gemini call failed, using heuristic solver:", err);
    }
  }

  // Fallback: Intelligent Heuristic Pattern Solver
  return solveWithHeuristics(input, slug);
}

async function solveWithGemini(
  input: CustomProblemInput,
  apiKey: string,
): Promise<AlgoMotionProps | null> {
  const prompt = `You are the lead algorithmic content engineer for AlgoMotion.
Given this user problem details:
Title: ${input.title}
Difficulty: ${input.difficulty || "Medium"}
Description / Details: ${input.description || "N/A"}
User Testcase: ${input.testcase || "N/A"}
User Code: ${input.code || "N/A"}

Generate a complete dual-platform video solution configuration for BOTH 9:16 Instagram Reel and 16:9 YouTube Deep Dive.
Respond ONLY with valid JSON in this exact structure:
{
  "templateType": "array-algorithm",
  "title": "${input.title}",
  "subtitle": "${input.difficulty || "Medium"} • [Concise Intuition Pattern Hook]",
  "voiceoverText": "[Punchy 35-45s voiceover script: hook, brute force pitfall, optimal technique, step-by-step insight]",
  "payload": {
    "array": [list of 4 to 6 numbers for the visual array track],
    "target": [single target number or 0],
    "algorithm": "${extractSlug(input.title)}",
    "problemNumber": "Custom",
    "difficulty": "${input.difficulty || "Medium"}",
    "timeComplexity": "O(n)",
    "spaceComplexity": "O(n)",
    "code": "[Clean 6-8 line Python solution]"
  },
  "youtubePayload": {
    "difficulty": "${input.difficulty || "Medium"}",
    "problemDescription": "[2-3 sentence clear problem statement and objective]",
    "constraints": ["[Constraint 1]", "[Constraint 2]", "[Constraint 3]"],
    "optimalApproachIndex": 2,
    "approaches": [
      {
        "id": "brute-force",
        "name": "Approach 1: Brute Force Search",
        "tag": "O(n²)",
        "badgeColor": "rose",
        "description": "[Description of brute force approach]",
        "intuition": "[Why it is intuitive and why it is suboptimal]",
        "timeComplexity": "O(n²)",
        "spaceComplexity": "O(1)",
        "pros": ["Simple to implement", "No extra memory"],
        "cons": ["Quadratic runtime", "Time limit exceeded on large arrays"],
        "code": "[Python brute force code 5-7 lines]",
        "keyTakeaway": "[Key lesson from brute force]"
      },
      {
        "id": "better-approach",
        "name": "Approach 2: Better / Pre-processed",
        "tag": "O(n log n)",
        "badgeColor": "amber",
        "description": "[Description of intermediate approach]",
        "intuition": "[Why sorting or two pointers improves search]",
        "timeComplexity": "O(n log n)",
        "spaceComplexity": "O(n)",
        "pros": ["Faster than brute force", "Classic algorithmic paradigm"],
        "cons": ["Extra space required or modification of input"],
        "code": "[Python intermediate code 5-7 lines]",
        "keyTakeaway": "[Key lesson]"
      },
      {
        "id": "optimal-approach",
        "name": "Approach 3: Optimal Single-Pass",
        "tag": "O(n)",
        "badgeColor": "emerald",
        "description": "[Description of optimal approach]",
        "intuition": "[Intuition behind the linear time breakthrough]",
        "timeComplexity": "O(n)",
        "spaceComplexity": "O(n)",
        "pros": ["Optimal linear runtime", "Single pass through data", "Interview gold standard"],
        "cons": ["Requires auxiliary memory"],
        "code": "[Python optimal code 5-7 lines]",
        "keyTakeaway": "[Trade memory for runtime]"
      }
    ],
    "comparison": [
      { "approach": "1. Brute Force", "time": "O(n²)", "space": "O(1)", "verdict": "Suboptimal", "status": "suboptimal" },
      { "approach": "2. Intermediate", "time": "O(n log n)", "space": "O(n)", "verdict": "Acceptable", "status": "acceptable" },
      { "approach": "3. Optimal", "time": "O(n)", "space": "O(n)", "verdict": "Optimal (Best)", "status": "optimal" }
    ],
    "keyTakeaways": [
      "[Takeaway 1]",
      "[Takeaway 2]",
      "[Takeaway 3]"
    ]
  }
}`;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json" },
      }),
    },
  );

  const data = await res.json();
  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawText) return null;

  const parsed = JSON.parse(rawText);
  parsed.branding = {
    name: process.env.BRANDING_NAME || "RSquare",
    tag: process.env.BRANDING_TAG || "R²",
    handle: `@${(process.env.BRANDING_NAME || "RSquare").toLowerCase()}`,
  };
  parsed.theme = "light";
  parsed.bgMusic = true;
  return parsed;
}

function solveWithHeuristics(input: CustomProblemInput, slug: string): AlgoMotionProps {
  // Parse numbers from testcase if provided
  let testArray = [2, 7, 11, 15];
  let testTarget = 9;

  if (input.testcase) {
    const arrMatch = input.testcase.match(/\[([0-9,\s-]+)\]/);
    if (arrMatch) {
      const nums = arrMatch[1]
        .split(",")
        .map((s) => parseInt(s.trim(), 10))
        .filter((n) => !isNaN(n));
      if (nums.length > 0) testArray = nums.slice(0, 6);
    }
    const targetMatch = input.testcase.match(/target\s*=\s*(-?\d+)/i);
    if (targetMatch) {
      testTarget = parseInt(targetMatch[1], 10);
    }
  }

  const userCode = input.code?.trim() || "";
  const codeLines = userCode || `def solve(nums, target):\n    seen = {}\n    for i, val in enumerate(nums):\n        complement = target - val\n        if complement in seen:\n            return [seen[complement], i]\n        seen[val] = i\n    return []`;

  const approaches: AlgorithmApproach[] = [
    {
      id: "brute-force",
      name: "Approach 1: Brute Force Search",
      tag: "O(n²)",
      badgeColor: "rose",
      description: "Exhaustive iteration checking every possible candidate pair with nested loops.",
      intuition: "Simple and intuitive to explain first, but suffers from redundant re-computations.",
      timeComplexity: "O(n²)",
      spaceComplexity: "O(1)",
      pros: ["Zero auxiliary memory overhead", "Trivial to understand"],
      cons: ["Quadratic time complexity O(N²)", "Time Limit Exceeded on large test inputs"],
      code: `def solve_brute(nums, target):\n    n = len(nums)\n    for i in range(n):\n        for j in range(i + 1, n):\n            if nums[i] + nums[j] == target:\n                return [i, j]\n    return []`,
      keyTakeaway: "Always recognize the bottleneck in brute force: repeated linear scans for the required match.",
    },
    {
      id: "two-pointers",
      name: "Approach 2: Sort + Two Pointers",
      tag: "O(n log n)",
      badgeColor: "amber",
      description: "Sort elements and converge left and right pointers towards the target.",
      intuition: "Directional convergence allows narrowing the search space in a single pass after sorting.",
      timeComplexity: "O(n log n)",
      spaceComplexity: "O(n)",
      pros: ["Reduces runtime to logarithmic bound", "Classic two-pointer convergence pattern"],
      cons: ["Sorting sets lower bound at O(N log N)", "May require extra space to preserve original indices"],
      code: `def solve_sorted(nums, target):\n    paired = sorted((val, i) for i, val in enumerate(nums))\n    l, r = 0, len(nums) - 1\n    while l < r:\n        curr = paired[l][0] + paired[r][0]\n        if curr == target: return [paired[l][1], paired[r][1]]\n        elif curr < target: l += 1\n        else: r -= 1\n    return []`,
      keyTakeaway: "Sorting establishes order for two pointers, but sorting itself limits peak performance.",
    },
    {
      id: "hash-map-optimal",
      name: "Approach 3: Hash Map Single-Pass (Optimal)",
      tag: "O(n)",
      badgeColor: "emerald",
      description: "Store visited elements in a hash map for instantaneous O(1) lookups.",
      intuition: "Trading space for time: calculating complement = target - current slashes quadratic work down to linear time.",
      timeComplexity: "O(n)",
      spaceComplexity: "O(n)",
      pros: ["Optimal linear runtime O(N)", "Single pass traversal", "Industry gold standard answer"],
      cons: ["Consumes O(N) auxiliary memory in RAM"],
      code: codeLines,
      keyTakeaway: "Trading memory for speed brings runtime down from O(N²) to O(N).",
    },
  ];

  const comparison: ComplexityComparisonRow[] = [
    { approach: "1. Brute Force", time: "O(n²)", space: "O(1)", verdict: "Suboptimal (TLE)", status: "suboptimal" },
    { approach: "2. Two Pointers", time: "O(n log n)", space: "O(n)", verdict: "Acceptable", status: "acceptable" },
    { approach: "3. Hash Map", time: "O(n)", space: "O(n)", verdict: "Optimal (Standard)", status: "optimal" },
  ];

  const youtubePayload: YouTubeDeepDivePayload = {
    problemDescription: input.description || `Given an input collection and target parameters, find the optimal subset or indices satisfying the constraints in linear time.`,
    constraints: [
      "Input elements fit in memory (N <= 10⁵)",
      "Strict time complexity requirement (O(N) or O(N log N))",
      "Guaranteed valid solution or fallback empty response",
    ],
    difficulty: input.difficulty || "Medium",
    approaches,
    optimalApproachIndex: 2,
    comparison,
    keyTakeaways: [
      "Always start with brute force intuition to identify the redundant computation.",
      "Check if sorting enables two pointers or binary search.",
      "Consider a hash table or sliding window to trade memory for linear time.",
    ],
    array: testArray,
    target: testTarget,
  };

  return {
    templateType: "array-algorithm",
    title: input.title,
    subtitle: `${input.difficulty || "Medium"} • Optimal Multi-Approach Solution`,
    voiceoverText: `Let's solve ${input.title}. We are given our input testcase with target ${testTarget}. Instead of quadratic nested loops, we track historical values in a hash map to achieve instant O(1) lookups. By checking our complement at each step, we solve the problem in optimal linear O(N) time.`,
    payload: {
      array: testArray,
      target: testTarget,
      algorithm: slug,
      problemNumber: "Custom",
      difficulty: input.difficulty || "Medium",
      timeComplexity: "O(n)",
      spaceComplexity: "O(n)",
      code: codeLines,
    },
    youtubePayload,
    branding: {
      name: process.env.BRANDING_NAME || "RSquare",
      tag: process.env.BRANDING_TAG || "R²",
      handle: `@${(process.env.BRANDING_NAME || "RSquare").toLowerCase()}`,
    },
    theme: "light",
    bgMusic: true,
  };
}

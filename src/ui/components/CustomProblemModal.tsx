import React, { useState } from "react";
import {
  X,
  Sparkles,
  Loader2,
  Lightbulb,
} from "lucide-react";
import type { AlgoMotionProps } from "../../types.ts";

interface CustomProblemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProblemSolved: (props: AlgoMotionProps) => void;
  uiTheme?: "light" | "dark";
}

export const CustomProblemModal: React.FC<CustomProblemModalProps> = ({
  isOpen,
  onClose,
  onProblemSolved,
  uiTheme = "light",
}) => {
  const isLight = uiTheme === "light";

  const [title, setTitle] = useState("");
  const [difficulty, setDifficulty] = useState<"Easy" | "Medium" | "Hard">("Medium");
  const [description, setDescription] = useState("");
  const [testcase, setTestcase] = useState("");
  const [code, setCode] = useState("");
  const [isSolving, setIsSolving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleQuickTemplate = (templateType: string) => {
    switch (templateType) {
      case "sliding-window":
        setTitle("Longest Substring Without Repeating Characters");
        setDifficulty("Medium");
        setDescription(
          "Given a string s, find the length of the longest substring without repeating characters. Utilize a dynamic sliding window with a hash set to achieve linear time.",
        );
        setTestcase("s = 'abcabcbb', Output: 3");
        setCode(
          "def lengthOfLongestSubstring(s):\n    charSet = set()\n    l = 0\n    res = 0\n    for r in range(len(s)):\n        while s[r] in charSet:\n            charSet.remove(s[l])\n            l += 1\n        charSet.add(s[r])\n        res = max(res, r - l + 1)\n    return res",
        );
        break;
      case "trapping-rain":
        setTitle("Trapping Rain Water");
        setDifficulty("Hard");
        setDescription(
          "Given n non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining using two converging pointers.",
        );
        setTestcase("[0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]");
        setCode(
          "def trap(height):\n    if not height: return 0\n    l, r = 0, len(height) - 1\n    leftMax, rightMax = height[l], height[r]\n    res = 0\n    while l < r:\n        if leftMax < rightMax:\n            l += 1\n            leftMax = max(leftMax, height[l])\n            res += leftMax - height[l]\n        else:\n            r -= 1\n            rightMax = max(rightMax, height[r])\n            res += rightMax - height[r]\n    return res",
        );
        break;
      case "coin-change":
        setTitle("Coin Change (Fewest Coins)");
        setDifficulty("Medium");
        setDescription(
          "You are given an integer array coins and target amount. Compute the fewest number of coins needed to make up that amount using bottom-up dynamic programming.",
        );
        setTestcase("coins = [1, 2, 5], target = 11");
        setCode(
          "def coinChange(coins, amount):\n    dp = [float('inf')] * (amount + 1)\n    dp[0] = 0\n    for a in range(1, amount + 1):\n        for c in coins:\n            if a - c >= 0:\n                dp[a] = min(dp[a], 1 + dp[a - c])\n    return dp[amount] if dp[amount] != float('inf') else -1",
        );
        break;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg("Please provide a problem title.");
      return;
    }

    setIsSolving(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/solve-custom-problem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          difficulty,
          testcase: testcase.trim(),
          code: code.trim(),
        }),
      });

      const data = await res.json();
      if (!data.success || !data.data) {
        throw new Error(data.error || "Failed to generate solution engine.");
      }

      onProblemSolved(data.data);
      onClose();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "An error occurred while generating solution.";
      setErrorMsg(message);
    } finally {
      setIsSolving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
      <div
        className={`relative w-full max-w-2xl max-h-[92vh] flex flex-col rounded-2xl border shadow-2xl overflow-hidden transition-colors ${
          isLight
            ? "bg-white border-slate-200 text-slate-900"
            : "bg-[#0b0f19] border-slate-800 text-slate-100"
        }`}
      >
        {/* Modal Header */}
        <div
          className={`flex items-center justify-between px-6 py-4 border-b ${
            isLight
              ? "bg-slate-50 border-slate-200"
              : "bg-[#080c14] border-slate-800"
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 text-white shadow-sm">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-black tracking-tight">
                Add Custom Problem & Auto-Generate Solution
              </h2>
              <p
                className={`text-xs ${
                  isLight ? "text-slate-500" : "text-slate-400"
                }`}
              >
                AI will generate 3 approaches, code, intuition, and Instagram/YouTube video animations.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg border transition-all ${
              isLight
                ? "bg-white border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                : "bg-slate-800 border-slate-700 text-slate-400 hover:text-white"
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 text-xs font-semibold">
              ⚠️ {errorMsg}
            </div>
          )}

          {/* Quick Presets Bar */}
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Quick Template Examples:
              </span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => handleQuickTemplate("sliding-window")}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                  isLight
                    ? "bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700"
                    : "bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300"
                }`}
              >
                🪟 Sliding Window
              </button>
              <button
                type="button"
                onClick={() => handleQuickTemplate("trapping-rain")}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                  isLight
                    ? "bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700"
                    : "bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300"
                }`}
              >
                🌧️ Trapping Rain Water
              </button>
              <button
                type="button"
                onClick={() => handleQuickTemplate("coin-change")}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                  isLight
                    ? "bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700"
                    : "bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300"
                }`}
              >
                💰 Dynamic Programming
              </button>
            </div>
          </div>

          {/* Problem Title & Difficulty */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Problem Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. 'Trapping Rain Water' or 'Course Schedule'"
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-semibold transition-all ${
                  isLight
                    ? "bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-cyan-600 focus:ring-1 focus:ring-cyan-600"
                    : "bg-slate-900 border-slate-700 text-white placeholder-slate-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                }`}
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Difficulty
              </label>
              <select
                value={difficulty}
                onChange={(e) =>
                  setDifficulty(e.target.value as "Easy" | "Medium" | "Hard")
                }
                className={`w-full px-3 py-2.5 rounded-xl border text-sm font-bold transition-all cursor-pointer ${
                  isLight
                    ? "bg-slate-50 border-slate-300 text-slate-900"
                    : "bg-slate-900 border-slate-700 text-white"
                }`}
              >
                <option value="Easy">🟢 Easy</option>
                <option value="Medium">🟡 Medium</option>
                <option value="Hard">🔴 Hard</option>
              </select>
            </div>
          </div>

          {/* Description / Problem Details */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Problem Description & Constraints
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Paste problem details, constraints, or goals here..."
              className={`w-full px-3.5 py-2.5 rounded-xl border text-xs leading-relaxed transition-all ${
                isLight
                  ? "bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-cyan-600"
                  : "bg-slate-900 border-slate-700 text-slate-200 placeholder-slate-500 focus:border-cyan-500"
              }`}
            />
          </div>

          {/* Testcase Input */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Visual Testcase / Input Array
            </label>
            <input
              type="text"
              value={testcase}
              onChange={(e) => setTestcase(e.target.value)}
              placeholder="e.g. '[0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]' or 'nums = [1, 2, 3], target = 4'"
              className={`w-full px-3.5 py-2 rounded-xl border text-xs font-mono transition-all ${
                isLight
                  ? "bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-cyan-600"
                  : "bg-slate-900 border-slate-700 text-slate-200 placeholder-slate-500 focus:border-cyan-500"
              }`}
            />
          </div>

          {/* Code Snippet (Optional) */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Custom Code (Optional - leave blank for AI to generate)
            </label>
            <textarea
              rows={4}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="def solve(nums):\n    # Enter your existing Python solution here or let AI synthesize it..."
              className={`w-full px-3.5 py-2 rounded-xl border text-xs font-mono leading-relaxed transition-all ${
                isLight
                  ? "bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-cyan-600"
                  : "bg-slate-900 border-slate-700 text-slate-200 placeholder-slate-500 focus:border-cyan-500"
              }`}
            />
          </div>

          {/* Footer Actions */}
          <div
            className={`flex items-center justify-end gap-3 pt-4 border-t ${
              isLight ? "border-slate-200" : "border-slate-800"
            }`}
          >
            <button
              type="button"
              onClick={onClose}
              disabled={isSolving}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                isLight
                  ? "bg-white hover:bg-slate-100 border-slate-300 text-slate-700"
                  : "bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300"
              }`}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSolving || !title.trim()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-fuchsia-600 hover:from-cyan-400 hover:via-indigo-500 hover:to-fuchsia-500 text-white text-xs font-bold shadow-lg shadow-indigo-500/25 disabled:opacity-50 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              {isSolving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-cyan-200" />
                  <span>Synthesizing Multi-Approach Solution...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Complete Solution Engine</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

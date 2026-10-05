export function verifyTraceOutput(
  actual: any,
  expected: any,
): { valid: boolean; message: string } {
  if (expected === undefined || expected === null) {
    return { valid: true, message: "No expected value specified to verify against." };
  }

  const serialize = (val: any): string => {
    if (Array.isArray(val)) {
      return `[${val.map(serialize).join(",")}]`;
    }
    if (typeof val === "object" && val !== null) {
      const keys = Object.keys(val).sort();
      return `{${keys.map((k) => `"${k}":${serialize(val[k])}`).join(",")}}`;
    }
    return String(val);
  };

  const actualStr = serialize(actual);
  const expectedStr = serialize(expected);

  if (actualStr === expectedStr) {
    return { valid: true, message: `Output matches expected value: ${actualStr}` };
  }

  // Also handle unordered array check if both are arrays of length 2 (e.g. indices [0, 1] vs [1, 0])
  if (Array.isArray(actual) && Array.isArray(expected) && actual.length === expected.length) {
    const sortedActual = [...actual].sort().join(",");
    const sortedExpected = [...expected].sort().join(",");
    if (sortedActual === sortedExpected) {
      return { valid: true, message: `Output matches expected set: ${actualStr}` };
    }
  }

  return {
    valid: false,
    message: `Output mismatch! Expected ${expectedStr}, got ${actualStr}`,
  };
}

import { describe, it, expect } from "vitest";
import { ok, fail, validatePromptId, sanitizeString } from "./api.js";

describe("ok", () => {
  it("returns success response with data", () => {
    const r = ok({ name: "test" });
    expect(r.success).toBe(true);
    expect(r.data).toEqual({ name: "test" });
    expect(r.error).toBeUndefined();
  });
});

describe("fail", () => {
  it("returns error response", () => {
    const r = fail("something went wrong");
    expect(r.success).toBe(false);
    expect(r.error).toBe("something went wrong");
    expect(r.data).toBeUndefined();
  });
});

describe("validatePromptId", () => {
  it("accepts valid AI³ IDs", () => {
    expect(validatePromptId("AI³-00001")).toBeNull();
    expect(validatePromptId("AI³-00999")).toBeNull();
  });

  it("accepts valid CUSTOM IDs", () => {
    expect(validatePromptId("CUSTOM-001")).toBeNull();
    expect(validatePromptId("CUSTOM-my_prompt-v2")).toBeNull();
  });

  it("accepts valid custom prefix IDs", () => {
    expect(validatePromptId("SANDBOX-R1")).toBeNull();
    expect(validatePromptId("MY-Prompt_123")).toBeNull();
  });

  it("rejects empty string", () => {
    expect(validatePromptId("")).toBeTruthy();
  });

  it("rejects too long ID", () => {
    expect(validatePromptId("AI³-" + "0".repeat(100))).toBeTruthy();
  });

  it("rejects invalid format", () => {
    expect(validatePromptId("<script>alert(1)</script>")).toBeTruthy();
    expect(validatePromptId("../../etc/passwd")).toBeTruthy();
  });
});

describe("sanitizeString", () => {
  it("truncates to maxLen", () => {
    expect(sanitizeString("hello world", 5)).toBe("hello");
  });

  it("removes control characters", () => {
    expect(sanitizeString("hello\x00world\x1f!", 100)).toBe("helloworld!");
  });

  it("passes clean strings through", () => {
    expect(sanitizeString("hello world", 100)).toBe("hello world");
  });
});

export interface ApiResult {
  success: boolean;
  data?: unknown;
  error?: string;
}

export function ok(data: unknown): ApiResult {
  return { success: true, data };
}

export function fail(error: string): ApiResult {
  return { success: false, error };
}

const PROMPT_ID_RE = /^(AI³-\d{5}|[A-Z][A-Z0-9_-]*-[A-Za-z0-9_-]+)$/;

export function validatePromptId(id: string): string | null {
  if (!id || id.length > 64) return "Invalid prompt ID: must be 1-64 chars";
  if (!PROMPT_ID_RE.test(id))
    return "Invalid prompt ID format. Expected 'AI³-XXXXX' or 'CUSTOM-xxx'";
  return null;
}

export function sanitizeString(s: string, maxLen: number): string {
  return s
    .slice(0, maxLen)
    .split("")
    .filter((c) => c.charCodeAt(0) >= 32)
    .join("");
}

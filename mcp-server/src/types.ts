export interface AiInstructions {
  role: string;
  task: string;
  type?: string;
  framework?: string[];
  style?: string;
  limits?: string[];
  search?: string;
  format?: string;
  check?: string;
  [key: string]: unknown;
}

export interface Prompt {
  id: string;
  name: string;
  input_section: string;
  ai_instructions: AiInstructions;
  version: string;
  section_code: string;
  section_name: string;
  category_code: string;
  category_path: string;
  translation_quality?: "draft" | "community-reviewed" | "expert-reviewed";
}

export interface CategorySummary {
  section_code: string;
  section_name: string;
  category_code: string;
  category_path: string;
  prompt_count: number;
  prompts: Array<{ id: string; name: string }>;
}

export interface ScoredPrompt {
  prompt: Prompt;
  score: number;
}

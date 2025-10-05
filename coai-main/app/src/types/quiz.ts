// Quiz related types
export interface QuizOption {
  a: string;
  b: string;
  c: string;
  d: string;
}

export interface QuizResource {
  title: string;
  link: string;
}

export interface Quiz {
  id: string;
  question: string;
  description: string;
  options: QuizOption;
  answer: string;
  resources?: QuizResource[];
}

export interface QuizGenerationForm {
  token: string;
  notes?: string;
  files?: string[];
  file_mimes?: string[];
  quiz_count: number;
  difficulty: string;
  topic?: string;
  model: string;
}

export interface QuizGenerationResponse {
  message: string;
  quota: number;
  end: boolean;
  error?: string;
  data?: string;
}

export type QuizStatus = "idle" | "streaming" | "done" | "start" | "summary";

export type QuizDifficulty = "Easy" | "Medium" | "Hard";

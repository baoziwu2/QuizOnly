import axios from "axios";
import { getApiBase } from "@/utils/base";

const api = axios.create({
  baseURL: getApiBase(),
});

// 添加请求拦截器，自动添加认证token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface GenerateQuizRequest {
  content: string;
  topic: string;
  difficulty: "easy" | "medium" | "hard";
  quiz_count: number;
  model: string;
}

export interface GenerateQuizResponse {
  quiz_set_id: number;
  questions: Array<{
    id: number;
    question: string;
    description: string;
    options: {
      a: string;
      b: string;
      c: string;
      d: string;
    };
    answer: string;
    resources?: string[];
  }>;
}

export interface SubmitAnswerRequest {
  quiz_set_id: number;
  answers: Record<number, string>;
  time_spent: number;
}

export interface SubmitAnswerResponse {
  attempt_id: number;
  score: number;
  total_num: number;
  correct: number;
}

export interface QuizSet {
  id: number;
  user_id: number;
  title: string;
  description: string;
  topic: string;
  difficulty: string;
  question_num: number;
  created_at: string;
  updated_at: string;
}

export interface QuizAttempt {
  id: number;
  user_id: number;
  quiz_set_id: number;
  score: number;
  answers: string;
  time_spent: number;
  created_at: string;
}

// 生成题目
export async function generateQuiz(
  data: GenerateQuizRequest
): Promise<GenerateQuizResponse> {
  const response = await api.post("/quiz/generate", {
    content: data.content,
    topic: data.topic,
    difficulty: data.difficulty,
    quiz_count: data.quiz_count,
    model: data.model,
  });
  return response.data;
}

// 提交答案
export async function submitAnswers(
  data: SubmitAnswerRequest
): Promise<SubmitAnswerResponse> {
  const response = await api.post("/quiz/submit", data);
  return response.data;
}

// 获取题目集列表
export async function getQuizSets(params?: {
  page?: number;
  page_size?: number;
  topic?: string;
}): Promise<{ total: number; quiz_sets: QuizSet[] }> {
  const response = await api.get("/quiz/sets", { params });
  return response.data;
}

// 获取题目集详情
export async function getQuizSet(id: number): Promise<QuizSet> {
  const response = await api.get(`/quiz/sets/${id}`);
  return response.data;
}

// 删除题目集
export async function deleteQuizSet(id: number): Promise<void> {
  await api.delete(`/quiz/sets/${id}`);
}

// 获取题目列表
export async function getQuestions(quizSetId: number): Promise<any[]> {
  const response = await api.get(`/quiz/sets/${quizSetId}/questions`);
  return response.data;
}

// 获取答题记录列表
export async function getAttempts(): Promise<QuizAttempt[]> {
  const response = await api.get("/quiz/attempts");
  return response.data;
}

// 获取答题记录详情
export async function getAttempt(id: number): Promise<QuizAttempt> {
  const response = await api.get(`/quiz/attempts/${id}`);
  return response.data;
}

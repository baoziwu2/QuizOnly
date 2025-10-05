import React, { useState } from "react";
import QuizForm, { QuizFormData } from "@/components/quiz/QuizForm";
import QuizPlayer, { Question } from "@/components/quiz/QuizPlayer";
import QuizResult from "@/components/quiz/QuizResult";
import { generateQuiz, submitAnswers } from "@/api/quiz";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

type QuizStage = "form" | "generating" | "playing" | "result";

interface QuizResult {
  attemptId: number;
  score: number;
  totalNum: number;
  correct: number;
}

export default function Quiz() {
  const [stage, setStage] = useState<QuizStage>("form");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [quizSetId, setQuizSetId] = useState<number>(0);
  const [result, setResult] = useState<QuizResult | null>(null);
  const { toast } = useToast();

  const handleGenerate = async (formData: QuizFormData) => {
    setStage("generating");

    try {
      const response = await generateQuiz(formData);
      setQuestions(response.questions);
      setQuizSetId(response.quiz_set_id);
      setStage("playing");
    } catch (error: any) {
      toast({
        title: "生成失败",
        description: error.message || "题目生成失败，请重试",
        variant: "destructive",
      });
      setStage("form");
    }
  };

  const handleSubmit = async (
    answers: Record<number, string>,
    timeSpent: number
  ) => {
    try {
      const response = await submitAnswers({
        quiz_set_id: quizSetId,
        answers,
        time_spent: timeSpent,
      });

      setResult({
        attemptId: response.attempt_id,
        score: response.score,
        totalNum: response.total_num,
        correct: response.correct,
      });
      setStage("result");

      toast({
        title: "提交成功",
        description: `您的得分：${response.score}分`,
      });
    } catch (error: any) {
      toast({
        title: "提交失败",
        description: error.message || "答案提交失败，请重试",
        variant: "destructive",
      });
    }
  };

  const handleRestart = () => {
    setStage("form");
    setQuestions([]);
    setQuizSetId(0);
    setResult(null);
  };

  const handleViewHistory = () => {
    // 跳转到历史记录页面
    window.location.href = "/quiz/history";
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="container mx-auto">
        {stage === "form" && (
          <QuizForm onSubmit={handleGenerate} isGenerating={false} />
        )}

        {stage === "generating" && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
            <h2 className="text-2xl font-semibold mb-2">正在生成题目...</h2>
            <p className="text-muted-foreground">请稍候，AI正在为您生成测验题</p>
          </div>
        )}

        {stage === "playing" && (
          <QuizPlayer
            questions={questions}
            onSubmit={handleSubmit}
            timeLimit={10}
          />
        )}

        {stage === "result" && result && (
          <QuizResult
            score={result.score}
            totalNum={result.totalNum}
            correct={result.correct}
            onRestart={handleRestart}
            onViewHistory={handleViewHistory}
          />
        )}
      </div>
    </div>
  );
}

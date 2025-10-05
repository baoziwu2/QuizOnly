import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, XCircle, Clock } from "lucide-react";

export interface Question {
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
}

interface QuizPlayerProps {
  questions: Question[];
  onSubmit: (answers: Record<number, string>, timeSpent: number) => void;
  timeLimit?: number; // 分钟
}

export default function QuizPlayer({ questions, onSubmit, timeLimit }: QuizPlayerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showResult, setShowResult] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState((timeLimit || 10) * 60);

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  // 计时器
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeSpent((prev) => prev + 1);
      if (timeLimit) {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleAnswer = (answer: string) => {
    setAnswers({
      ...answers,
      [currentQuestion.id]: answer,
    });
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setShowResult(true);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleSubmit = () => {
    onSubmit(answers, timeSpent);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (showResult) {
    return (
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>准备提交答案</CardTitle>
          <CardDescription>
            您已完成所有题目，点击下方按钮提交答案
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span>已回答题目：</span>
            <span className="font-bold">
              {Object.keys(answers).length} / {questions.length}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>用时：</span>
            <span className="font-bold">{formatTime(timeSpent)}</span>
          </div>
        </CardContent>
        <CardFooter className="flex gap-2">
          <Button variant="outline" onClick={() => setShowResult(false)}>
            返回检查
          </Button>
          <Button onClick={handleSubmit} className="flex-1">
            提交答案
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto space-y-4">
      {/* 进度和计时 */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>
            题目 {currentIndex + 1} / {questions.length}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {timeLimit
              ? `剩余: ${formatTime(timeRemaining)}`
              : `用时: ${formatTime(timeSpent)}`}
          </span>
        </div>
        <Progress value={progress} />
      </div>

      {/* 题目卡片 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">{currentQuestion.question}</CardTitle>
          {currentQuestion.description && (
            <CardDescription>{currentQuestion.description}</CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={answers[currentQuestion.id]}
            onValueChange={handleAnswer}
          >
            {Object.entries(currentQuestion.options).map(([key, value]) => (
              <div
                key={key}
                className="flex items-center space-x-2 p-4 rounded-lg border hover:bg-accent transition-colors"
              >
                <RadioGroupItem value={key} id={`option-${key}`} />
                <Label
                  htmlFor={`option-${key}`}
                  className="flex-1 cursor-pointer"
                >
                  <span className="font-semibold mr-2">{key.toUpperCase()}.</span>
                  {value}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentIndex === 0}
          >
            上一题
          </Button>
          <Button
            onClick={handleNext}
            disabled={!answers[currentQuestion.id]}
          >
            {currentIndex === questions.length - 1 ? "完成" : "下一题"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

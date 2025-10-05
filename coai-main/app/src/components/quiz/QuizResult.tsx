import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Trophy } from "lucide-react";

interface QuizResultProps {
  score: number;
  totalNum: number;
  correct: number;
  onRestart: () => void;
  onViewHistory: () => void;
}

export default function QuizResult({
  score,
  totalNum,
  correct,
  onRestart,
  onViewHistory,
}: QuizResultProps) {
  const percentage = Math.round(score);
  const isPassed = percentage >= 60;

  const getGrade = (score: number) => {
    if (score >= 90) return { grade: "优秀", color: "text-green-600" };
    if (score >= 80) return { grade: "良好", color: "text-blue-600" };
    if (score >= 60) return { grade: "及格", color: "text-yellow-600" };
    return { grade: "不及格", color: "text-red-600" };
  };

  const { grade, color } = getGrade(percentage);

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          {isPassed ? (
            <Trophy className="w-20 h-20 text-yellow-500" />
          ) : (
            <XCircle className="w-20 h-20 text-red-500" />
          )}
        </div>
        <CardTitle className="text-3xl">测验完成！</CardTitle>
        <CardDescription>
          {isPassed ? "恭喜你通过了测验！" : "继续努力，下次会更好！"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 分数展示 */}
        <div className="text-center space-y-2">
          <div className={`text-6xl font-bold ${color}`}>{percentage}分</div>
          <div className={`text-2xl font-semibold ${color}`}>{grade}</div>
        </div>

        {/* 统计信息 */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="space-y-1">
            <div className="text-2xl font-bold text-green-600">{correct}</div>
            <div className="text-sm text-muted-foreground">答对</div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold text-red-600">
              {totalNum - correct}
            </div>
            <div className="text-sm text-muted-foreground">答错</div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold">{totalNum}</div>
            <div className="text-sm text-muted-foreground">总题数</div>
          </div>
        </div>

        {/* 正确率圆环 */}
        <div className="flex justify-center">
          <div className="relative w-40 h-40">
            <svg className="transform -rotate-90 w-40 h-40">
              <circle
                cx="80"
                cy="80"
                r="70"
                stroke="currentColor"
                strokeWidth="10"
                fill="transparent"
                className="text-gray-200"
              />
              <circle
                cx="80"
                cy="80"
                r="70"
                stroke="currentColor"
                strokeWidth="10"
                fill="transparent"
                strokeDasharray={`${(percentage / 100) * 439.6} 439.6`}
                className={color}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold">{percentage}%</span>
            </div>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex gap-4">
          <Button variant="outline" onClick={onViewHistory} className="flex-1">
            查看历史记录
          </Button>
          <Button onClick={onRestart} className="flex-1">
            重新生成题目
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

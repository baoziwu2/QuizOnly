import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getQuizSets, getAttempts, deleteQuizSet, type QuizSet, type QuizAttempt } from "@/api/quiz";
import { useToast } from "@/components/ui/use-toast";
import { Trash2, Play, History, BookOpen } from "lucide-react";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";

export default function QuizHistory() {
  const [quizSets, setQuizSets] = useState<QuizSet[]>([]);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"sets" | "attempts">("sets");
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [setsResponse, attemptsResponse] = await Promise.all([
        getQuizSets(),
        getAttempts(),
      ]);
      setQuizSets(setsResponse.quiz_sets);
      setAttempts(attemptsResponse);
    } catch (error: any) {
      toast({
        title: "加载失败",
        description: error.message || "数据加载失败",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("确定要删除这个题目集吗？")) return;

    try {
      await deleteQuizSet(id);
      setQuizSets(quizSets.filter((s) => s.id !== id));
      toast({
        title: "删除成功",
        description: "题目集已删除",
      });
    } catch (error: any) {
      toast({
        title: "删除失败",
        description: error.message || "删除失败",
        variant: "destructive",
      });
    }
  };

  const handleReplay = (id: number) => {
    window.location.href = `/quiz/play/${id}`;
  };

  const getDifficultyLabel = (difficulty: string) => {
    const map: Record<string, string> = {
      easy: "简单",
      medium: "中等",
      hard: "困难",
    };
    return map[difficulty] || difficulty;
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 80) return "text-blue-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">我的测验</h1>
          <p className="text-muted-foreground">查看和管理您的题目集与答题记录</p>
        </div>

        {/* 标签切换 */}
        <div className="flex gap-4 mb-6">
          <Button
            variant={activeTab === "sets" ? "default" : "outline"}
            onClick={() => setActiveTab("sets")}
            className="flex items-center gap-2"
          >
            <BookOpen className="w-4 h-4" />
            题目集
          </Button>
          <Button
            variant={activeTab === "attempts" ? "default" : "outline"}
            onClick={() => setActiveTab("attempts")}
            className="flex items-center gap-2"
          >
            <History className="w-4 h-4" />
            答题记录
          </Button>
        </div>

        {/* 题目集列表 */}
        {activeTab === "sets" && (
          <Card>
            <CardHeader>
              <CardTitle>我的题目集</CardTitle>
              <CardDescription>共 {quizSets.length} 个题目集</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>标题</TableHead>
                    <TableHead>主题</TableHead>
                    <TableHead>难度</TableHead>
                    <TableHead>题数</TableHead>
                    <TableHead>创建时间</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {quizSets.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        暂无题目集，<a href="/quiz" className="text-primary hover:underline">去创建</a>
                      </TableCell>
                    </TableRow>
                  ) : (
                    quizSets.map((set) => (
                      <TableRow key={set.id}>
                        <TableCell className="font-medium">{set.title}</TableCell>
                        <TableCell>{set.topic}</TableCell>
                        <TableCell>{getDifficultyLabel(set.difficulty)}</TableCell>
                        <TableCell>{set.question_num}</TableCell>
                        <TableCell>
                          {format(new Date(set.created_at), "PPP", { locale: zhCN })}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleReplay(set.id)}
                            >
                              <Play className="w-4 h-4 mr-1" />
                              重做
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDelete(set.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* 答题记录 */}
        {activeTab === "attempts" && (
          <Card>
            <CardHeader>
              <CardTitle>答题记录</CardTitle>
              <CardDescription>共 {attempts.length} 条记录</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>题目集ID</TableHead>
                    <TableHead>得分</TableHead>
                    <TableHead>用时</TableHead>
                    <TableHead>答题时间</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attempts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8">
                        暂无答题记录
                      </TableCell>
                    </TableRow>
                  ) : (
                    attempts.map((attempt) => (
                      <TableRow key={attempt.id}>
                        <TableCell>#{attempt.quiz_set_id}</TableCell>
                        <TableCell>
                          <span className={`font-bold ${getScoreColor(attempt.score)}`}>
                            {Math.round(attempt.score)}分
                          </span>
                        </TableCell>
                        <TableCell>{Math.floor(attempt.time_spent / 60)}分{attempt.time_spent % 60}秒</TableCell>
                        <TableCell>
                          {format(new Date(attempt.created_at), "PPP p", { locale: zhCN })}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

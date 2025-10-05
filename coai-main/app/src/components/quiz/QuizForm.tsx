import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Upload } from "lucide-react";

interface QuizFormProps {
  onSubmit: (data: QuizFormData) => void;
  isGenerating: boolean;
}

export interface QuizFormData {
  content: string;
  topic: string;
  difficulty: "easy" | "medium" | "hard";
  quizCount: number;
  model: string;
}

export default function QuizForm({ onSubmit, isGenerating }: QuizFormProps) {
  const [formData, setFormData] = useState<QuizFormData>({
    content: "",
    topic: "",
    difficulty: "easy",
    quizCount: 5,
    model: "gpt-3.5-turbo",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        setFormData({ ...formData, content: text });
      };
      reader.readAsText(file);
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>生成AI测验题</CardTitle>
        <CardDescription>
          根据您的笔记或文本内容自动生成测验题目
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 主题 */}
          <div className="space-y-2">
            <Label htmlFor="topic">主题</Label>
            <Input
              id="topic"
              placeholder="例如：面向对象编程"
              value={formData.topic}
              onChange={(e) =>
                setFormData({ ...formData, topic: e.target.value })
              }
              required
            />
          </div>

          {/* 内容输入 */}
          <Tabs defaultValue="text" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="text">
                <FileText className="w-4 h-4 mr-2" />
                文本输入
              </TabsTrigger>
              <TabsTrigger value="file">
                <Upload className="w-4 h-4 mr-2" />
                文件上传
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="text" className="space-y-2">
              <Label htmlFor="content">笔记内容</Label>
              <Textarea
                id="content"
                placeholder="粘贴您的笔记或文本内容..."
                className="min-h-[200px]"
                value={formData.content}
                onChange={(e) =>
                  setFormData({ ...formData, content: e.target.value })
                }
                required
              />
            </TabsContent>
            
            <TabsContent value="file" className="space-y-2">
              <Label htmlFor="file">上传文件</Label>
              <Input
                id="file"
                type="file"
                accept=".txt,.md,.pdf,.docx"
                onChange={handleFileUpload}
              />
            </TabsContent>
          </Tabs>

          {/* 设置 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="difficulty">难度</Label>
              <Select
                value={formData.difficulty}
                onValueChange={(value: "easy" | "medium" | "hard") =>
                  setFormData({ ...formData, difficulty: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">简单</SelectItem>
                  <SelectItem value="medium">中等</SelectItem>
                  <SelectItem value="hard">困难</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quizCount">题目数量</Label>
              <Select
                value={formData.quizCount.toString()}
                onValueChange={(value) =>
                  setFormData({ ...formData, quizCount: parseInt(value) })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5题</SelectItem>
                  <SelectItem value="10">10题</SelectItem>
                  <SelectItem value="15">15题</SelectItem>
                  <SelectItem value="20">20题</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="model">AI模型</Label>
              <Select
                value={formData.model}
                onValueChange={(value) =>
                  setFormData({ ...formData, model: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gpt-3.5-turbo">GPT-3.5</SelectItem>
                  <SelectItem value="gpt-4">GPT-4</SelectItem>
                  <SelectItem value="claude-3-sonnet">Claude 3</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* 提交按钮 */}
          <Button
            type="submit"
            className="w-full"
            disabled={isGenerating || !formData.content || !formData.topic}
          >
            {isGenerating ? "生成中..." : "生成测验"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

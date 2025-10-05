import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { selectAuthenticated } from "@/store/auth.ts";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Textarea } from "@/components/ui/textarea.tsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select.tsx";

interface QuizFormProps {
  onSubmit: (data: {
    notes: string;
    files: File[];
    quizCount: number;
    difficulty: string;
    topic: string;
    model: string;
  }) => void;
  error?: string;
}

function QuizForm({ onSubmit, error }: QuizFormProps) {
  const { t } = useTranslation();
  const authenticated = useSelector(selectAuthenticated);
  const [notes, setNotes] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [quizCount, setQuizCount] = useState(5);
  const [difficulty, setDifficulty] = useState("Easy");
  const [topic, setTopic] = useState("");
  const [model, setModel] = useState("gpt-3.5-turbo");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authenticated) {
      return;
    }
    if (!notes && files.length === 0) {
      return;
    }
    onSubmit({ notes, files, quizCount, difficulty, topic, model });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  return (
    <div className="quiz-form-container">
      <div className="quiz-header">
        <h1>{t("quiz.title")}</h1>
        <p>{t("quiz.description")}</p>
      </div>

      <form onSubmit={handleSubmit} className="quiz-form">
        {error && <div className="error-message">{error}</div>}

        <div className="form-group">
          <label htmlFor="topic">{t("quiz.topic-label")}</label>
          <Input
            id="topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder={t("quiz.topic-placeholder")}
          />
        </div>

        <div className="form-group">
          <label htmlFor="notes">{t("quiz.notes-label")}</label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={t("quiz.notes-placeholder")}
            rows={6}
          />
        </div>

        <div className="form-group">
          <label htmlFor="files">{t("quiz.files-label")}</label>
          <Input
            id="files"
            type="file"
            onChange={handleFileChange}
            multiple
            accept=".pdf,.docx,.txt,.png,.jpg,.jpeg"
          />
          {files.length > 0 && (
            <div className="file-list">
              {files.map((file, index) => (
                <div key={index} className="file-item">
                  {file.name}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="difficulty">{t("quiz.difficulty-label")}</label>
            <Select value={difficulty} onValueChange={setDifficulty}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Easy">{t("quiz.difficulty-easy")}</SelectItem>
                <SelectItem value="Medium">{t("quiz.difficulty-medium")}</SelectItem>
                <SelectItem value="Hard">{t("quiz.difficulty-hard")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="form-group">
            <label htmlFor="quizCount">{t("quiz.count-label")}</label>
            <Input
              id="quizCount"
              type="number"
              value={quizCount}
              onChange={(e) => setQuizCount(parseInt(e.target.value))}
              min={1}
              max={20}
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="model">{t("quiz.model-label")}</label>
          <Select value={model} onValueChange={setModel}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
              <SelectItem value="gpt-4">GPT-4</SelectItem>
              <SelectItem value="gemini-pro">Gemini Pro</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button type="submit" disabled={!authenticated || (!notes && files.length === 0)}>
          {t("quiz.generate-button")}
        </Button>

        {!authenticated && (
          <p className="auth-notice">{t("quiz.auth-required")}</p>
        )}
      </form>
    </div>
  );
}

export default QuizForm;

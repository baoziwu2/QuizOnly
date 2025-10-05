import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { quizSelector } from "@/store/quiz.ts";
import { Button } from "@/components/ui/button.tsx";

interface QuizSummaryProps {
  onReset: () => void;
}

function QuizSummary({ onReset }: QuizSummaryProps) {
  const { t } = useTranslation();
  const { totalPoints, quizzes } = useSelector(quizSelector);

  const percentage = Math.round(totalPoints);
  const correctCount = Math.round((percentage / 100) * quizzes.length);

  const getMessage = () => {
    if (percentage >= 90) return t("quiz.excellent");
    if (percentage >= 70) return t("quiz.good");
    if (percentage >= 50) return t("quiz.average");
    return t("quiz.need-improvement");
  };

  return (
    <div className="quiz-summary">
      <div className="summary-content">
        <h2>{t("quiz.summary-title")}</h2>

        <div className="score-display">
          <div className="score-circle">
            <div className="score-text">
              <span className="score-value">{percentage}%</span>
            </div>
          </div>
        </div>

        <div className="summary-stats">
          <div className="stat-item">
            <span className="stat-label">{t("quiz.correct-answers")}</span>
            <span className="stat-value">
              {correctCount} / {quizzes.length}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">{t("quiz.score")}</span>
            <span className="stat-value">{percentage}%</span>
          </div>
        </div>

        <div className="summary-message">
          <p>{getMessage()}</p>
        </div>

        <div className="summary-actions">
          <Button onClick={onReset}>{t("quiz.try-again")}</Button>
        </div>
      </div>
    </div>
  );
}

export default QuizSummary;

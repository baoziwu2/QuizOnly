import { useTranslation } from "react-i18next";

function QuizLoading() {
  const { t } = useTranslation();

  return (
    <div className="quiz-loading">
      <div className="loading-spinner">
        <div className="spinner"></div>
      </div>
      <h2>{t("quiz.generating")}</h2>
      <p>{t("quiz.please-wait")}</p>
    </div>
  );
}

export default QuizLoading;

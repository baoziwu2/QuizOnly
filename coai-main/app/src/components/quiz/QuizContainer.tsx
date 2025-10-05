import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import {
  quizSelector,
  nextIndex,
  setSelectedAnswer,
  addPoints,
  setStatus,
} from "@/store/quiz.ts";
import { Button } from "@/components/ui/button.tsx";

function QuizContainer() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { quizzes, index, selectedAnswer } = useSelector(quizSelector);

  const currentQuiz = quizzes[index];

  if (!currentQuiz) {
    return null;
  }

  const handleSelectAnswer = (answer: string) => {
    dispatch(setSelectedAnswer(answer));
  };

  const handleNext = () => {
    if (selectedAnswer === currentQuiz.answer) {
      dispatch(addPoints());
    }

    if (index + 1 >= quizzes.length) {
      dispatch(setStatus("summary"));
    } else {
      dispatch(nextIndex());
    }
  };

  const options = [
    { key: "a", value: currentQuiz.options.a },
    { key: "b", value: currentQuiz.options.b },
    { key: "c", value: currentQuiz.options.c },
    { key: "d", value: currentQuiz.options.d },
  ];

  return (
    <div className="quiz-question-container">
      <div className="quiz-progress">
        <span>
          {t("quiz.question-progress", {
            current: index + 1,
            total: quizzes.length,
          })}
        </span>
      </div>

      <div className="quiz-question">
        <h2>{currentQuiz.question}</h2>
        {currentQuiz.description && (
          <p className="quiz-description">{currentQuiz.description}</p>
        )}
      </div>

      <div className="quiz-options">
        {options.map((option) => (
          <button
            key={option.key}
            className={`quiz-option ${selectedAnswer === option.key ? "selected" : ""}`}
            onClick={() => handleSelectAnswer(option.key)}
          >
            <span className="option-key">{option.key.toUpperCase()}</span>
            <span className="option-value">{option.value}</span>
          </button>
        ))}
      </div>

      <div className="quiz-actions">
        <Button onClick={handleNext} disabled={!selectedAnswer}>
          {index + 1 >= quizzes.length
            ? t("quiz.finish")
            : t("quiz.next-question")}
        </Button>
      </div>

      {currentQuiz.resources && currentQuiz.resources.length > 0 && (
        <div className="quiz-resources">
          <h3>{t("quiz.resources")}</h3>
          {currentQuiz.resources.map((resource, idx) => (
            <a
              key={idx}
              href={resource.link}
              target="_blank"
              rel="noopener noreferrer"
            >
              {resource.title}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

export default QuizContainer;

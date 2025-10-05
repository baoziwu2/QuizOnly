import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import {
  quizSelector,
  setStatus,
  setStreamContent,
  setQuizzes,
  reset,
} from "@/store/quiz.ts";
import { useEffect, useState } from "react";
import { Quiz, QuizGenerationForm } from "@/types/quiz.ts";
import { quizManager } from "@/api/quiz.ts";
import { getMemory } from "@/utils/memory.ts";
import { tokenField } from "@/conf/bootstrap.ts";
import "@/assets/pages/quiz.less";
import QuizForm from "@/components/quiz/QuizForm.tsx";
import QuizLoading from "@/components/quiz/QuizLoading.tsx";
import QuizContainer from "@/components/quiz/QuizContainer.tsx";
import QuizSummary from "@/components/quiz/QuizSummary.tsx";

function QuizPage() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { status, streamContent } = useSelector(quizSelector);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (status === "done") {
      try {
        // Clean up the response
        let data = streamContent.trim();
        data = data.replace(/^```json\s*/i, "").replace(/```\s*$/, "");
        data = data.trim();

        const quizzes = JSON.parse(data) as Quiz[];
        dispatch(setQuizzes(quizzes));
      } catch (err) {
        console.error("Error parsing quiz data:", err);
        setError(t("quiz.parse-error"));
        dispatch(reset());
        dispatch(setStreamContent(""));
        dispatch(setStatus("idle"));
      }
    }
  }, [status, streamContent, dispatch, t]);

  const handleGenerateQuiz = (formData: {
    notes: string;
    files: File[];
    quizCount: number;
    difficulty: string;
    topic: string;
    model: string;
  }) => {
    dispatch(setStatus("streaming"));
    dispatch(setStreamContent(""));
    setError("");

    const token = getMemory(tokenField) || "";

    // Convert files to base64
    Promise.all(
      formData.files.map((file) =>
        file.arrayBuffer().then((buffer) => {
          const base64 = btoa(
            new Uint8Array(buffer).reduce(
              (data, byte) => data + String.fromCharCode(byte),
              "",
            ),
          );
          return { base64, mime: file.type };
        }),
      ),
    ).then((filesData) => {
      const form: QuizGenerationForm = {
        token,
        notes: formData.notes || undefined,
        files: filesData.map((f) => f.base64),
        file_mimes: filesData.map((f) => f.mime),
        quiz_count: formData.quizCount,
        difficulty: formData.difficulty,
        topic: formData.topic || undefined,
        model: formData.model,
      };

      quizManager.generate(
        form,
        (response) => {
          if (response.error) {
            setError(response.error);
            dispatch(setStatus("idle"));
          }
          if (response.data) {
            dispatch(setStreamContent(response.data));
          }
        },
        (quizzes) => {
          dispatch(setQuizzes(quizzes));
          dispatch(setStatus("done"));
        },
      );
    });
  };

  const handleStartQuiz = () => {
    dispatch(setStatus("start"));
  };

  const handleReset = () => {
    dispatch(reset());
  };

  return (
    <div className="quiz-page">
      <div className="quiz-container">
        {status === "idle" && (
          <QuizForm onSubmit={handleGenerateQuiz} error={error} />
        )}
        {status === "streaming" && <QuizLoading />}
        {status === "done" && (
          <div className="quiz-ready">
            <h2>{t("quiz.ready-title")}</h2>
            <p>{t("quiz.ready-description")}</p>
            <button onClick={handleStartQuiz} className="start-button">
              {t("quiz.start-quiz")}
            </button>
          </div>
        )}
        {status === "start" && <QuizContainer />}
        {status === "summary" && <QuizSummary onReset={handleReset} />}
      </div>
    </div>
  );
}

export default QuizPage;

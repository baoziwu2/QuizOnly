import { createSlice } from "@reduxjs/toolkit";
import { Quiz, QuizStatus } from "@/types/quiz.ts";
import { RootState } from "@/store/index.ts";

interface QuizState {
  quizzes: Quiz[];
  index: number;
  selectedAnswer: string;
  points: number;
  totalPoints: number;
  status: QuizStatus;
  streamContent: string;
}

const initialState: QuizState = {
  quizzes: [],
  index: 0,
  selectedAnswer: "",
  points: 1,
  totalPoints: 0,
  status: "idle",
  streamContent: "",
};

export const quizSlice = createSlice({
  name: "quiz",
  initialState,
  reducers: {
    setQuizzes: (state, action) => {
      const quizzes = action.payload as Quiz[];
      state.quizzes = quizzes;
      state.points = quizzes.length > 0 ? 100 / quizzes.length : 0;
      state.index = 0;
      state.selectedAnswer = "";
      state.totalPoints = 0;
    },
    nextIndex: (state) => {
      if (state.index + 1 < state.quizzes.length) {
        state.index += 1;
      }
      state.selectedAnswer = "";
    },
    setSelectedAnswer: (state, action) => {
      state.selectedAnswer = action.payload as string;
    },
    addPoints: (state) => {
      state.totalPoints += state.points;
    },
    reset: (state) => {
      Object.assign(state, initialState);
    },
    setStatus: (state, action) => {
      state.status = action.payload as QuizStatus;
    },
    setStreamContent: (state, action) => {
      state.streamContent = action.payload as string;
    },
  },
});

export const {
  setQuizzes,
  nextIndex,
  setSelectedAnswer,
  addPoints,
  reset,
  setStatus,
  setStreamContent,
} = quizSlice.actions;

export default quizSlice.reducer;

export const quizSelector = (state: RootState): QuizState => state.quiz;

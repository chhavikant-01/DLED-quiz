import api from './api';

export interface Quiz {
  _id: string;
  title: string;
  description: string;
  createdBy: string;
  isPublished: boolean;
  timeLimit: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface Question {
  _id: string;
  quizId: string;
  questionText: string;
  choices: Choice[];
  isMultipleChoice: boolean;
  points: number;
  createdAt: string;
  updatedAt: string;
}

export interface Choice {
  text: string;
  isCorrect: boolean;
}

export interface CreateQuizData {
  title: string;
  description: string;
  timeLimit?: number | null;
}

export interface CreateQuestionData {
  questionText: string;
  choices: Choice[];
  isMultipleChoice: boolean;
  points?: number;
}

export interface QuizResponse {
  success: boolean;
  data: Quiz;
}

export interface QuizzesResponse {
  success: boolean;
  count: number;
  data: Quiz[];
}

export interface QuestionResponse {
  success: boolean;
  data: Question;
}

export interface QuestionsResponse {
  success: boolean;
  count: number;
  data: Question[];
}

export interface QuizWithQuestionsResponse {
  success: boolean;
  data: {
    quiz: Quiz;
    questions: Question[];
  };
}

const quizService = {
  // Quiz CRUD operations
  createQuiz: async (quizData: CreateQuizData) => {
    const response = await api.post<QuizResponse>('/quizzes', quizData);
    return response.data;
  },

  getQuizzes: async () => {
    const response = await api.get<QuizzesResponse>('/quizzes');
    return response.data;
  },

  getQuiz: async (quizId: string) => {
    const response = await api.get<QuizWithQuestionsResponse>(`/quizzes/${quizId}`);
    return response.data;
  },

  updateQuiz: async (quizId: string, quizData: Partial<CreateQuizData>) => {
    const response = await api.put<QuizResponse>(`/quizzes/${quizId}`, quizData);
    return response.data;
  },

  deleteQuiz: async (quizId: string) => {
    const response = await api.delete<{ success: boolean; data: {} }>(`/quizzes/${quizId}`);
    return response.data;
  },

  publishQuiz: async (quizId: string) => {
    const response = await api.put<QuizResponse>(`/quizzes/${quizId}/publish`, {});
    return response.data;
  },

  // Question CRUD operations
  addQuestion: async (quizId: string, questionData: CreateQuestionData) => {
    const response = await api.post<QuestionResponse>(`/quizzes/${quizId}/questions`, questionData);
    return response.data;
  },

  getQuestions: async (quizId: string) => {
    const response = await api.get<QuestionsResponse>(`/quizzes/${quizId}/questions`);
    return response.data;
  },

  getQuestion: async (questionId: string) => {
    const response = await api.get<QuestionResponse>(`/questions/${questionId}`);
    return response.data;
  },

  updateQuestion: async (questionId: string, questionData: Partial<CreateQuestionData>) => {
    const response = await api.put<QuestionResponse>(`/questions/${questionId}`, questionData);
    return response.data;
  },

  deleteQuestion: async (questionId: string) => {
    const response = await api.delete<{ success: boolean; data: {} }>(`/questions/${questionId}`);
    return response.data;
  },
};

export default quizService; 
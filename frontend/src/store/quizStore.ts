import { create } from 'zustand';
import axios from 'axios';
import { API_URL } from '../config/api';

// Configure axios to include auth token in all requests
axios.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

interface Option {
  _id: string;
  text: string;
  isCorrect: boolean;
}

interface Question {
  _id: string;
  quizId: string;
  text: string;
  options: Option[];
  correctAnswer: number;
  isMultipleChoice: boolean;
}

export interface Quiz {
  _id: string;
  title: string;
  description: string;
  timeLimit: number | null;
  questions: Question[];
  status: 'draft' | 'published';
  createdAt: string;
  updatedAt: string;
}

interface QuizData {
  title: string;
  description: string;
  timeLimit: number | null;
}

interface QuizStoreState {
  quizzes: Quiz[];
  currentQuiz: Quiz | null;
  isLoading: boolean;
  error: string | null;
  
  // Quiz operations
  fetchQuizzes: () => Promise<Quiz[]>;
  fetchQuizById: (id: string) => Promise<Quiz | null>;
  createQuiz: (quizData: QuizData) => Promise<Quiz | null>;
  updateQuiz: (id: string, quizData: Partial<QuizData>) => Promise<Quiz | null>;
  deleteQuiz: (id: string) => Promise<boolean>;
  publishQuiz: (id: string) => Promise<Quiz | null>;
  
  // Question operations
  addQuestion: (quizId: string, questionData: any) => Promise<Question | null>;
  updateQuestion: (quizId: string, questionId: string, questionData: any) => Promise<Question | null>;
  deleteQuestion: (quizId: string, questionId: string) => Promise<boolean>;
  
  // Error handling
  clearError: () => void;
}

const useQuizStore = create<QuizStoreState>((set, get) => ({
  quizzes: [],
  currentQuiz: null,
  isLoading: false,
  error: null,
  
  clearError: () => set({ error: null }),
  
  fetchQuizzes: async () => {
    try {
      set({ isLoading: true, error: null });
      const response = await axios.get(`${API_URL}/quizzes`, {
        withCredentials: true
      });
      
      // Extract the actual quizzes array from the response
      const quizzesArray = response.data.data || [];
      
      // Now we set just the array to the quizzes state
      set({ quizzes: quizzesArray, isLoading: false });
      return quizzesArray;
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Failed to fetch quizzes', 
        isLoading: false 
      });
      return [];
    }
  },
  
  fetchQuizById: async (id: string) => {
    try {
      set({ isLoading: true, error: null });
      const response = await axios.get(`${API_URL}/quizzes/${id}`, {
        withCredentials: true
      });
      const quizData = response.data.data;
      console.log("quizData", quizData);  
    const mappedQuiz = {
      ...quizData,
      status: quizData.isPublished ? 'published' : 'draft'
    };
    
    set({ currentQuiz: mappedQuiz, isLoading: false });
    return mappedQuiz;
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Failed to fetch quiz', 
        isLoading: false 
      });
      return null;
    }
  },
  
  createQuiz: async (quizData: QuizData) => {
    try {
      set({ isLoading: true, error: null });
      const response = await axios.post(`${API_URL}/quizzes`, quizData, {
        withCredentials: true
      });
      set({ isLoading: false });
      return response.data;
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Failed to create quiz', 
        isLoading: false 
      });
      return null;
    }
  },
  
  updateQuiz: async (id: string, quizData: Partial<QuizData>) => {
    try {
      set({ isLoading: true, error: null });
      const response = await axios.put(`${API_URL}/quizzes/${id}`, quizData);
      
      // Update the current quiz if it's the one being updated
      if (get().currentQuiz?._id === id) {
        set({ currentQuiz: response.data });
      }
      
      // Update the quiz in the quizzes array
      const updatedQuizzes = get().quizzes.map((quiz: Quiz) => 
        quiz._id === id ? response.data : quiz
      );
      
      set({ quizzes: updatedQuizzes, isLoading: false });
      return response.data;
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Failed to update quiz', 
        isLoading: false 
      });
      return null;
    }
  },
  
  deleteQuiz: async (id: string) => {
    try {
      set({ isLoading: true, error: null });
      await axios.delete(`${API_URL}/quizzes/${id}`);
      
      // Remove the quiz from the quizzes array
      const updatedQuizzes = get().quizzes.filter((quiz: Quiz) => quiz._id !== id);
      set({ quizzes: updatedQuizzes, isLoading: false });
      
      // Reset currentQuiz if it's the one being deleted
      if (get().currentQuiz?._id === id) {
        set({ currentQuiz: null });
      }
      
      return true;
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Failed to delete quiz', 
        isLoading: false 
      });
      return false;
    }
  },
  
  publishQuiz: async (id: string) => {
    try {
      set({ isLoading: true, error: null });
      const response = await axios.put(`${API_URL}/quizzes/${id}/publish`, {
        withCredentials: true
      });
      return response.data.success;
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Failed to publish quiz', 
        isLoading: false 
      });
      return null;
    }
  },
  
  addQuestion: async (quizId: string, questionData: any) => {
    try {
      set({ isLoading: true, error: null });
      const response = await axios.post(`${API_URL}/quizzes/${quizId}/questions`, questionData);
      
      // Update the current quiz with the new question
      if (get().currentQuiz?._id === quizId) {
        const updatedQuiz = {
          ...get().currentQuiz!,
          questions: [...get().currentQuiz!.questions, response.data]
        };
        set({ currentQuiz: updatedQuiz });
      }
      
      set({ isLoading: false });
      return response.data;
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Failed to add question', 
        isLoading: false 
      });
      return null;
    }
  },
  
  updateQuestion: async (quizId: string, questionId: string, questionData: any) => {
    try {
      set({ isLoading: true, error: null });
      const response = await axios.put(
        `${API_URL}/questions/${questionId}`,
        questionData
      );
      
      // Update the current quiz's question
      if (get().currentQuiz?._id === quizId) {
        const updatedQuestions = get().currentQuiz!.questions.map((q: Question) => 
          q._id === questionId ? response.data : q
        );
        
        const updatedQuiz = {
          ...get().currentQuiz!,
          questions: updatedQuestions
        };
        
        set({ currentQuiz: updatedQuiz });
      }
      
      set({ isLoading: false });
      return response.data;
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Failed to update question', 
        isLoading: false 
      });
      return null;
    }
  },
  
  deleteQuestion: async (quizId: string, questionId: string) => {
    try {
      set({ isLoading: true, error: null });
      await axios.delete(`${API_URL}/questions/${questionId}`);
      
      // Update the current quiz by removing the question
      if (get().currentQuiz?._id === quizId) {
        const updatedQuestions = get().currentQuiz!.questions.filter(
          (q: Question) => q._id !== questionId
        );
        
        const updatedQuiz = {
          ...get().currentQuiz!,
          questions: updatedQuestions
        };
        
        set({ currentQuiz: updatedQuiz });
      }
      
      set({ isLoading: false });
      return true;
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Failed to delete question', 
        isLoading: false 
      });
      return false;
    }
  }
}));

export default useQuizStore; 
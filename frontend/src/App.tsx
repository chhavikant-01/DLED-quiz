import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import CreateQuizPage from './pages/CreateQuizPage';
import QuizDetailsPage from './pages/QuizDetailsPage';
import EditQuizPage from './pages/EditQuizPage';
import AddQuestionPage from './pages/AddQuestionPage';
import EditQuestionPage from './pages/EditQuestionPage';
import useAuthStore from './store/authStore';
import UnderConstruction from './pages/UnderConstruction';

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuthStore();
  
  // right now, role === "techear" can only access protected routes
  const { user } = useAuthStore();
  if (user?.role === 'admin' || user?.role === 'student') {
    return <UnderConstruction role={user?.role || ''} />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          } 
        />
        <Route
          path="/create-quiz"
          element={
            <ProtectedRoute>
              <CreateQuizPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/quizzes/:quizId"
          element={
            <ProtectedRoute>
              <QuizDetailsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/quizzes/:quizId/add-question"
          element={
            <ProtectedRoute>
              <AddQuestionPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/quizzes/:quizId/edit-question/:questionId"
          element={
            <ProtectedRoute>
              <EditQuestionPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/edit-quiz/:quizId"
          element={
            <ProtectedRoute>
              <EditQuizPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Navigate to="/dashboard" replace />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../components/ui/card';
import Button from '../components/ui/button';
import useAuthStore from '../store/authStore';
import useQuizStore from '../store/quizStore';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { quizzes, fetchQuizzes, deleteQuiz, publishQuiz, isLoading, error } = useQuizStore();
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState<string | null>(null);

  useEffect(() => {
    const loadQuizzes = async () => {
      const data = await fetchQuizzes();
      console.log('Fetched quizzes:', data);
      console.log('Store quizzes after fetch:', quizzes);
    };
    
    loadQuizzes();
  }, []);

  const handleDeleteQuiz = async (quizId: string) => {
    if (window.confirm('Are you sure you want to delete this quiz?')) {
      setIsDeleting(quizId);
      const success = await deleteQuiz(quizId);
      if (success) {
        fetchQuizzes();
      }
      setIsDeleting(null);
    }
  };

  const handlePublishQuiz = async (quizId: string) => {
    setIsPublishing(quizId);
    const success = await publishQuiz(quizId);
    if (success) {
      fetchQuizzes();
    }
    else {
      alert('Failed to publish quiz. Please try again.');
    }
    setIsPublishing(null);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isTeacher = user?.role === 'teacher';

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Quiz Dashboard</h1>
          <div className="flex items-center space-x-4">
            <span className="text-gray-600">Welcome, {user?.name}</span>
            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">Your Quizzes</h2>
            {isTeacher && (
              <Button variant="outline" onClick={() => navigate('/create-quiz')}>Create New Quiz</Button>
            )}
          </div>

          {isLoading && <p className="text-center py-4">Loading quizzes...</p>}

          {!isLoading && quizzes.length === 0 && (
            <div className="text-center py-10">
              <p className="text-gray-500 mb-4">No quizzes found.</p>
              {isTeacher && (
                <Button onClick={() => navigate('/create-quiz')}>Create Your First Quiz</Button>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes.length > 0 && quizzes.map((quiz, i) => (
              <Card key={i} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle>{quiz.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-2">{quiz.description}</p>
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <span>
                      {quiz.status === 'published' ? (
                        <span className="text-green-600 font-medium">Published</span>
                      ) : (
                        <span className="text-yellow-600 font-medium">Draft</span>
                      )}
                    </span>
                    <span>•</span>
                    <span>
                      {quiz.timeLimit
                        ? `${quiz.timeLimit} minutes`
                        : 'No time limit'}
                    </span>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button
                    variant="outline"
                    className='bg-blue-400'
                    onClick={() => navigate(`/quizzes/${quiz._id}`)}
                  >
                    View Details
                  </Button>
                  {isTeacher && (
                    <div className="flex space-x-2">
                      {quiz.status !== 'published' && (
                        <Button
                          variant="outline"
                          className='bg-green-400'
                          onClick={() => handlePublishQuiz(quiz._id)}
                          isLoading={isPublishing === quiz._id}
                          disabled={isPublishing === quiz._id}
                        >
                          Publish
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        className='bg-red-400'
                        onClick={() => handleDeleteQuiz(quiz._id)}
                        isLoading={isDeleting === quiz._id}
                        disabled={isDeleting === quiz._id}
                      >
                        Delete
                      </Button>
                    </div>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage; 
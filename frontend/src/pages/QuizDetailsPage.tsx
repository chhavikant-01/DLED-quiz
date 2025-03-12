import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import Button from '../components/ui/button';
import { AlertCircle, Clock, Edit, Plus, Trash } from 'react-feather';
import useQuizStore from '../store/quizStore';

const QuizDetailsPage: React.FC = () => {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { 
    currentQuiz, 
    fetchQuizById, 
    deleteQuestion, 
    isLoading, 
    error, 
    publishQuiz 
  } = useQuizStore();
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [showCreatedMessage, setShowCreatedMessage] = useState(false);

  useEffect(() => {
    if (quizId) {
      fetchQuizById(quizId);
    }
  }, [quizId, fetchQuizById]);

  useEffect(() => {
    // Check if quiz was just created
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get('created') === 'true') {
      setShowCreatedMessage(true);
      // Reset URL without the query param
      const newUrl = location.pathname;
      window.history.replaceState({}, '', newUrl);
      
      // Clear the message after 5 seconds
      const timer = setTimeout(() => {
        setShowCreatedMessage(false);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [location]);

  const handleDeleteQuestion = async (questionId: string) => {
    setIsDeleting(true);
    setDeleteError(null);
    
    try {
      if (quizId) {
        const success = await deleteQuestion(quizId, questionId);
        if (!success) {
          setDeleteError('Failed to delete question. Please try again.');
        }
      }
    } catch (error) {
      setDeleteError('An unexpected error occurred.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePublishQuiz = async () => {
    if (quizId && currentQuiz) {
      const success = await publishQuiz(quizId);
      if (success) {
        fetchQuizById(quizId);
      }
      else {
        setDeleteError('Failed to publish quiz. Please try again.');
      }
    }
  };

  const handleEditQuiz = () => {
    if (quizId) {
      navigate(`/edit-quiz/${quizId}`);
    }
  };

  const handleAddQuestion = () => {
    if (quizId) {
      navigate(`/quizzes/${quizId}/add-question`);
    }
  };


  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">Loading quiz details...</p>
      </div>
    );
  }

  if (!currentQuiz) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Quiz Not Found</h1>
        <p className="text-gray-600 mb-6">The quiz you're looking for doesn't exist or has been removed.</p>
        <Button onClick={() => navigate('/dashboard')} variant="primary">
          Back to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Quiz Details</h1>
          <div className="flex space-x-3">
            <Button variant="outline" onClick={() => navigate('/dashboard')}>
              Back to Dashboard
            </Button>
            {currentQuiz.status === 'draft' && (
              <Button variant="primary" onClick={handleEditQuiz}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Quiz
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {showCreatedMessage && (
          <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded flex items-center">
            <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Quiz created successfully! You can now add questions to your quiz.
          </div>
        )}
        
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            {error}
          </div>
        )}
        
        <Card className="mb-8">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-2xl">{currentQuiz.title}</CardTitle>
              <div className="mt-2 flex items-center space-x-2">
                <Badge variant={currentQuiz.status === 'published' ? 'success' : 'warning'}>
                  {currentQuiz.status === 'published' ? 'Published' : 'Draft'}
                </Badge>
                {currentQuiz.timeLimit && (
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="h-4 w-4 mr-1" />
                    {currentQuiz.timeLimit} minutes
                  </div>
                )}
              </div>
            </div>
            {currentQuiz.status === 'draft' && currentQuiz.questions.length > 0 && (
              <Button 
                onClick={handlePublishQuiz} 
                variant="primary" 
                className="bg-green-600 hover:bg-green-700"
              >
                Publish Quiz
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {currentQuiz.description ? (
              <p className="text-gray-600">{currentQuiz.description}</p>
            ) : (
              <p className="text-gray-500 italic">No description provided</p>
            )}
          </CardContent>
        </Card>

        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-xl font-semibold">
            Questions ({currentQuiz?.questions?.length})
          </h2>
          {currentQuiz.status === 'draft' && (
            <Button onClick={handleAddQuestion} variant="primary">
              <Plus className="h-4 w-4 mr-2" />
              Add Question
            </Button>
          )}
        </div>

        {deleteError && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            {deleteError}
          </div>
        )}

        {currentQuiz?.questions?.length === 0 ? (
          <Card className="bg-gray-50 border-dashed">
            <CardContent className="py-12">
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-1">No Questions Yet</h3>
                <p className="text-gray-500 mb-6">
                  This quiz doesn't have any questions yet. Add your first question to get started.
                </p>
                {currentQuiz.status === 'draft' && (
                  <Button onClick={handleAddQuestion} variant="primary">
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Question
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {currentQuiz?.questions?.map((question, index) => (
              <Card key={question._id} className="bg-white py-4">
                <CardContent className="p-6">
                  <div className="flex justify-between">
                    <h3 className="text-lg font-medium">
                      <span className="text-gray-500 mr-2">Q{index + 1}.</span>
                      {question.text}
                    </h3>
                    {currentQuiz.status === 'draft' && (
                      <div className="flex space-x-2">
                        <Button
                          onClick={() => navigate(`/quizzes/${quizId}/edit-question/${question._id}`)}
                          variant="outline"
                          size="sm"
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          onClick={() => handleDeleteQuestion(question._id)}
                          variant="danger"
                          size="sm"
                          isLoading={isDeleting}
                        >
                          <Trash className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    )}
                  </div>
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                    {question.options && question.options.map((option, optIndex) => (
                      <div
                        key={optIndex}
                        className={`p-3 rounded-md border ${
                          option.isCorrect === true
                            ? 'bg-green-50 border-green-200'
                            : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className="flex items-start">
                          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-white border border-gray-300 text-sm mr-2">
                            {String.fromCharCode(65 + optIndex)}
                          </span>
                          <p className="text-gray-700">{option.text}</p>
                        </div>
                        {option.isCorrect === true && (
                          <p className="mt-2 text-sm text-green-600 font-medium">Correct Answer</p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default QuizDetailsPage; 
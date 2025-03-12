import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../components/ui/card';
import Input from '../components/ui/input';
import Button from '../components/ui/button';
import Checkbox from '../components/ui/checkbox';
import { AlertCircle } from 'react-feather';
import useQuizStore from '../store/quizStore';

const EditQuizPage: React.FC = () => {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();
  const { currentQuiz, fetchQuizById, updateQuiz, isLoading, error, clearError } = useQuizStore();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [timeLimit, setTimeLimit] = useState<string>('');
  const [hasTimeLimit, setHasTimeLimit] = useState(false);
  const [formErrors, setFormErrors] = useState<{
    title?: string;
    description?: string;
    timeLimit?: string;
  }>({});
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (quizId) {
      fetchQuizById(quizId);
    }
  }, [quizId, fetchQuizById]);

  useEffect(() => {
    if (currentQuiz && !isInitialized) {
      setTitle(currentQuiz.title);
      setDescription(currentQuiz.description || '');
      
      if (currentQuiz.timeLimit) {
        setTimeLimit(currentQuiz.timeLimit.toString());
        setHasTimeLimit(true);
      } else {
        setHasTimeLimit(false);
      }
      
      setIsInitialized(true);
    }
  }, [currentQuiz, isInitialized]);

  const validateForm = () => {
    const errors: {
      title?: string;
      description?: string;
      timeLimit?: string;
    } = {};
    let isValid = true;

    if (!title.trim()) {
      errors.title = 'Title is required';
      isValid = false;
    } else if (title.length > 100) {
      errors.title = 'Title cannot be more than 100 characters';
      isValid = false;
    }

    if (description.length > 500) {
      errors.description = 'Description cannot be more than 500 characters';
      isValid = false;
    }

    if (hasTimeLimit) {
      const timeLimitNum = parseInt(timeLimit);
      if (!timeLimit || isNaN(timeLimitNum)) {
        errors.timeLimit = 'Time limit must be a number';
        isValid = false;
      } else if (timeLimitNum < 1 || timeLimitNum > 180) {
        errors.timeLimit = 'Time limit must be between 1 and 180 minutes';
        isValid = false;
      }
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError?.();

    if (validateForm()) {
      try {
        const quizData = {
          title,
          description,
          timeLimit: hasTimeLimit ? parseInt(timeLimit) : null,
        };

        if (quizId) {
          const quiz = await updateQuiz(quizId, quizData);
          if (quiz) {
            navigate(`/quizzes/${quizId}`);
          }
        }
      } catch (error) {
        // Error is handled in the store
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">Loading quiz...</p>
      </div>
    );
  }

  if (!currentQuiz && !isLoading) {
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
          <h1 className="text-3xl font-bold text-gray-900">Edit Quiz</h1>
          <Button variant="outline" onClick={() => navigate(`/quizzes/${quizId}`)}>
            Cancel
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Quiz Details</CardTitle>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="mb-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded">
                  {error}
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-6">
                <Input
                  label="Quiz Title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  error={formErrors.title}
                  placeholder="Enter quiz title"
                  required
                />
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Description
                  </label>
                  <textarea
                    className="flex min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Enter quiz description (optional)"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                  {formErrors.description && (
                    <p className="text-sm text-destructive">{formErrors.description}</p>
                  )}
                </div>
                <div className="space-y-4">
                  <Checkbox
                    label="Set a time limit for this quiz"
                    checked={hasTimeLimit}
                    onChange={() => setHasTimeLimit(!hasTimeLimit)}
                  />
                  {hasTimeLimit && (
                    <Input
                      label="Time Limit (minutes)"
                      type="number"
                      min="1"
                      max="180"
                      value={timeLimit}
                      onChange={(e) => setTimeLimit(e.target.value)}
                      error={formErrors.timeLimit}
                      placeholder="Enter time limit in minutes"
                    />
                  )}
                </div>
                <div className="pt-4">
                  <Button
                    type="submit"
                    className="w-full"
                    isLoading={isLoading}
                    disabled={isLoading}
                  >
                    Save Changes
                  </Button>
                </div>
              </form>
            </CardContent>
            <CardFooter className="flex justify-center text-sm text-gray-500">
              <p>
                You can manage questions from the quiz details page
              </p>
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default EditQuizPage; 
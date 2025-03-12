import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../components/ui/card';
import Input from '../components/ui/input';
import Button from '../components/ui/button';
import useQuizStore from '../store/quizStore';

const CreateQuizPage: React.FC = () => {
  const navigate = useNavigate();
  const { createQuiz, isLoading, error, clearError } = useQuizStore();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [timeLimit, setTimeLimit] = useState<string>('');
  const [formErrors, setFormErrors] = useState<{
    title?: string;
    description?: string;
    timeLimit?: string;
  }>({});

  const validateForm = () => {
    // all fields are required
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


    if (!description.trim()) {
      errors.description = 'Description is required';
      isValid = false;
    } else if (description.length > 500) {
      errors.description = 'Description cannot be more than 500 characters';
      isValid = false;
    }


    const timeLimitNum = parseInt(timeLimit);
    if (!timeLimit || isNaN(timeLimitNum)) {
      errors.timeLimit = 'Time limit must be a number';
      isValid = false;
    } else if (timeLimitNum < 1 || timeLimitNum > 180) {
      errors.timeLimit = 'Time limit must be between 1 and 180 minutes';
      isValid = false;
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
          timeLimit: parseInt(timeLimit),
        };

        const quiz = await createQuiz(quizData);
        if (quiz) {
          navigate(`/dashboard`);
        }
      } catch (error) {
        // Error is handled in the store
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Create New Quiz</h1>
          <Button variant="outline" onClick={() => navigate('/dashboard')}>
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
                  maxLength={100}
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
                    placeholder="Enter quiz description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    maxLength={500}
                  />
                  {formErrors.description && (
                    <p className="text-sm text-destructive">{formErrors.description}</p>
                  )}
                </div>
                <div className="space-y-4">
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
                </div>
                <div className="pt-4">
                  <Button
                    type="submit"
                    variant="outline"
                    className="w-full bg-blue-400"
                    isLoading={isLoading}
                    disabled={isLoading}
                  >
                    Create Quiz
                  </Button>
                </div>
              </form>
            </CardContent>
            <CardFooter className="flex justify-center text-sm text-gray-500">
              <p>
                You'll be able to add questions after creating the quiz
              </p>
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default CreateQuizPage; 
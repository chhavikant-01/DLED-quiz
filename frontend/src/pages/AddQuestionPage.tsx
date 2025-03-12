import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../components/ui/card';
import Input from '../components/ui/input';
import Button from '../components/ui/button';
import { Plus, Trash, Check } from 'react-feather';
import useQuizStore from '../store/quizStore';

const AddQuestionPage: React.FC = () => {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();
  const { currentQuiz, fetchQuizById, addQuestion, isLoading, error, clearError } = useQuizStore();
  
  const [questionText, setQuestionText] = useState('');
  const [options, setOptions] = useState<{ text: string; isCorrect: boolean }[]>([
    { text: '', isCorrect: false },
    { text: '', isCorrect: false },
    { text: '', isCorrect: false },
    { text: '', isCorrect: false }
  ]);
  const [isMultipleChoice, setIsMultipleChoice] = useState(false);
  const [formErrors, setFormErrors] = useState<{
    questionText?: string;
    options?: string;
    correctAnswer?: string;
  }>({});

  useEffect(() => {
    if (quizId) {
      fetchQuizById(quizId);
    }
  }, [quizId, fetchQuizById]);

  const validateForm = () => {
    const errors: {
      questionText?: string;
      options?: string;
      correctAnswer?: string;
    } = {};
    let isValid = true;

    if (!questionText.trim()) {
      errors.questionText = 'Question text is required';
      isValid = false;
    }

    // Check if at least 2 options are provided
    const filledOptions = options.filter(option => option.text.trim() !== '');
    if (filledOptions.length < 2) {
      errors.options = 'At least 2 options are required';
      isValid = false;
    }

    // Check if at least one correct answer is selected
    const hasCorrectAnswer = options.some(option => option.isCorrect);
    if (!hasCorrectAnswer) {
      errors.correctAnswer = 'Please select at least one correct answer';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index].text = value;
    setOptions(newOptions);
  };

  const handleCorrectAnswerChange = (index: number) => {
    const newOptions = [...options];
    
    if (isMultipleChoice) {
      // Toggle the current option
      newOptions[index].isCorrect = !newOptions[index].isCorrect;
    } else {
      // Single choice: set all to false, then set the selected one to true
      newOptions.forEach((option, i) => {
        option.isCorrect = i === index;
      });
    }
    
    setOptions(newOptions);
  };

  const handleAddOption = () => {
    setOptions([...options, { text: '', isCorrect: false }]);
  };

  const handleRemoveOption = (index: number) => {
    if (options.length <= 2) {
      setFormErrors({
        ...formErrors,
        options: 'At least 2 options are required'
      });
      return;
    }
    
    const newOptions = [...options];
    newOptions.splice(index, 1);
    setOptions(newOptions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError?.();

    if (validateForm()) {
      try {
        const questionData = {
          questionText,
          choices: options.filter(option => option.text.trim() !== '').map(option => ({
            text: option.text,
            isCorrect: option.isCorrect
          })),
          isMultipleChoice,
          points: 1
        };

        if (quizId) {
          const question = await addQuestion(quizId, questionData);
          if (question) {
            navigate(`/quizzes/${quizId}`);
          }
        }
      } catch (error) {
        // Error is handled in the store
      }
    }
  };

  if (!currentQuiz && !isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <p className="text-center">Quiz not found or you don't have permission to add questions.</p>
            <div className="flex justify-center mt-4">
              <Button onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Add Question</h1>
          <Button variant="outline" onClick={() => navigate(`/quizzes/${quizId}`)}>
            Cancel
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <Card className="max-w-3xl mx-auto">
            <CardHeader>
              <CardTitle>New Question for {currentQuiz?.title}</CardTitle>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="mb-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded">
                  {error}
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-6">
                <Input
                  label="Question Text"
                  type="text"
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  error={formErrors.questionText}
                  placeholder="Enter your question"
                  required
                />

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Answer Options</label>
                    <div className="flex items-center space-x-2">
                      <label className="text-sm flex items-center space-x-1">
                        <input
                          type="checkbox"
                          checked={isMultipleChoice}
                          onChange={() => setIsMultipleChoice(!isMultipleChoice)}
                          className="rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <span>Allow multiple correct answers</span>
                      </label>
                    </div>
                  </div>
                  
                  {formErrors.options && (
                    <p className="text-sm text-red-400">{formErrors.options}</p>
                  )}
                  
                  {formErrors.correctAnswer && (
                    <p className="text-sm text-red-400">{formErrors.correctAnswer}</p>
                  )}

                  <div className="space-y-3 mt-2">
                    {options.map((option, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <div className="flex-grow">
                          <div className="flex items-center space-x-2">
                            <button
                              type="button"
                              onClick={() => handleCorrectAnswerChange(index)}
                              className={`flex-shrink-0 w-6 h-6 rounded-full border ${
                                option.isCorrect
                                  ? 'bg-green-500 border-green-500 text-white'
                                  : 'border-gray-300 bg-white'
                              } flex items-center justify-center`}
                            >
                              {option.isCorrect && <Check className="h-4 w-4" />}
                            </button>
                            <input
                              type="text"
                              value={option.text}
                              onChange={(e) => handleOptionChange(index, e.target.value)}
                              placeholder={`Option ${index + 1}`}
                              className="flex-grow rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            />
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveOption(index)}
                          className="flex-shrink-0 text-gray-400 hover:text-red-500"
                        >
                          <Trash className="h-5 w-5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={handleAddOption}
                    className="mt-2 inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Option
                  </button>
                </div>

                <div className="pt-4">
                  <Button
                    type="submit"
                    className="w-full"
                    isLoading={isLoading}
                    disabled={isLoading}
                  >
                    Add Question
                  </Button>
                </div>
              </form>
            </CardContent>
            <CardFooter className="flex justify-center text-sm text-gray-500">
              <p>
                You can add more questions after saving this one
              </p>
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default AddQuestionPage; 
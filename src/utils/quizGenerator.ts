import OpenAI from 'openai';

export interface QuizQuestion {
  question: string;
  options: string[] | string;
  correctAnswer: string;
  explanation: string;
}

export interface QuizGeneratorProgress {
  status: string;
  progress: number;
}

export interface QuizGeneratorOptions {
  onProgress?: (progress: QuizGeneratorProgress) => void;
  numberOfQuestions?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  questionTypes?: ('mcq' | 'true-false')[];
}

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

export async function generateQuiz(
  content: string,
  options: QuizGeneratorOptions = {}
): Promise<QuizQuestion[]> {
  const {
    onProgress,
    numberOfQuestions = 10,
    difficulty = 'medium',
    questionTypes = ['mcq']
  } = options;

  try {
    if (!content.trim()) {
      throw new Error('No content provided for quiz generation');
    }

    if (onProgress) {
      onProgress({
        status: 'Analyzing content...',
        progress: 0
      });
    }

    const prompt = `Generate a ${difficulty} difficulty quiz with ${numberOfQuestions} questions based on the following content. Include a mix of ${questionTypes.join(' and ')} questions. For each question, provide:
    1. The question
    2. Four possible options (for MCQs) or True/False options
    3. The correct answer
    4. A brief explanation of why it's correct

    Format each question as a JSON object with properties: question, options, correctAnswer, and explanation.

    Content to base the quiz on:
    ${content}`;

    if (onProgress) {
      onProgress({
        status: 'Generating questions...',
        progress: 50
      });
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `You are a quiz generator that creates educational questions based on provided content.
Generate a mix of multiple choice and true/false questions. For multiple choice questions, always provide
exactly 4 options as an array. For true/false questions, provide "True" and "False" as options.

Format each question as a JSON object with:
{
  "question": "The question text",
  "options": ["Option A", "Option B", "Option C", "Option D"] for MCQ or ["True", "False"] for T/F,
  "correctAnswer": "The correct option",
  "explanation": "Explanation of why this is correct"
}

Return a JSON object with a "questions" array containing these question objects.`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000,
      response_format: { type: 'json_object' }
    });

    if (onProgress) {
      onProgress({
        status: 'Processing questions...',
        progress: 90
      });
    }

    const result = response.choices[0]?.message?.content;
    if (!result) {
      throw new Error('Failed to generate quiz questions');
    }

    const questions = JSON.parse(result).questions;

    // Validate question format
    questions.forEach((q: QuizQuestion) => {
      if (!Array.isArray(q.options)) {
        throw new Error('Invalid question format: options must be an array');
      }
      if (!q.options.includes(q.correctAnswer)) {
        throw new Error('Invalid question format: correct answer must be one of the options');
      }
    });

    if (onProgress) {
      onProgress({
        status: 'Quiz generated successfully!',
        progress: 100
      });
    }

    return questions;
  } catch (error) {
    console.error('Quiz generation failed:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to generate quiz');
  }
}
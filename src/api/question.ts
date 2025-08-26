const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

interface QuestionResponse {
  question: string;
}

interface ErrorResponse {
  detail: string;
}

export const generateQuestion = async (company: string, role: string, resume: string): Promise<QuestionResponse> => {
  if (!API_BASE_URL) {
    throw new Error('API Base URL is not defined in environment variables.');
  }

  const response = await fetch(`${API_BASE_URL}/api/question/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      company: company,
      role: role,
      resume: resume,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    const errorData: ErrorResponse = data;
    const errorMessage = `Error ${response.status}: ${errorData.detail}`;
    throw new Error(errorMessage);
  }

  return data as QuestionResponse;
};

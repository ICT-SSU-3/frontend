// src/api/question.ts

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

export interface GetQuestionRequest {
  session_id: number;
  index: number;
}

export interface GetQuestionResponse {
  session_id: number;
  index: number;
  total: number;
  question_id: number;
  question_content: string;
  similar_jd: string | null;
}

export async function getQuestion(req: GetQuestionRequest): Promise<GetQuestionResponse> {
  if (!API_BASE_URL) {
    throw new Error('API Base URL is not defined in environment variables.');
  }

  const params = new URLSearchParams({
    session_id: req.session_id.toString(),
    index: req.index.toString(),
  });

  const url = `${API_BASE_URL}/api/question?${params.toString()}`;

  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'accept': 'application/json',
    },
  });

  const data = await res.json();

  if (!res.ok) {
    const msg = typeof data?.detail === 'string'
      ? `Error ${res.status}: ${data.detail}`
      : `Error ${res.status}: ${JSON.stringify(data)}`;

    const error = new Error(msg) as any;
    error.detail = data.detail;
    throw error;
  }

  return data as GetQuestionResponse;
}
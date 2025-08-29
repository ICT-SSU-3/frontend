// src/api/question.ts

// API_BASE_URL은 환경 변수에서 가져옵니다.
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
    throw new Error('API Base URL이 환경 변수에 정의되지 않았습니다.');
  }

  // URLSearchParams를 사용하여 파라미터를 안전하게 인코딩합니다.
  const params = new URLSearchParams({
    session_id: req.session_id.toString(), // number를 string으로 변환
    index: req.index.toString(), // number를 string으로 변환
  });

  // 절대 URL 사용
  const url = `${API_BASE_URL}/api/question/?${params.toString()}`;

  // URL을 확인하기 위해 alert 추가
  alert(url);

  const res = await fetch(url, {
    method: 'GET',
    headers: { 'accept': 'application/json' },
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
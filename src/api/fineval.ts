// src/api/fineval.ts

const BASE = process.env.REACT_APP_API_BASE_URL;

export type FinevalRequest = {
  session_id: number;
};

// ⭐ FinevalResponse 타입 수정: 백엔드 명세에 맞게
export type FinevalResponse = {
  session: {
    session_id: number;
    user_name: string;
    company_name: string;
    jd_name: string;
    created_at: string;
  };
  results: Array<{
    question_id: number;
    question_content: string;
    similar_jd: string | null;
    answer_content: string | null;
    evaluation_content: string | null;
  }>;
  counts: {
    total_questions: number;
    answered: number;
  };
};

export async function fineval(payload: FinevalRequest): Promise<FinevalResponse> {
  // ⭐ POST 대신 GET 요청으로 변경
  // ⭐ 요청 본문 대신 URL 쿼리 파라미터 사용
  const params = new URLSearchParams({
    session_id: payload.session_id.toString(),
  });

  const url = `${BASE}/api/fineval?${params.toString()}`;

  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'accept': 'application/json',
    },
  });

  if (!res.ok) {
    const data = await res.json();
    const msg = typeof data?.detail === 'string'
      ? `Error ${res.status}: ${data.detail}`
      : `Error ${res.status}: ${JSON.stringify(data)}`;
    const error = new Error(msg) as any;
    error.detail = data.detail;
    throw error;
  }

  return res.json() as Promise<FinevalResponse>;
}
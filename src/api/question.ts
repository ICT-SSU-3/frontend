// src/api/question.ts

// API_BASE_URL은 더 이상 사용하지 않습니다.
// const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

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
// 뒤에 슬래시 고정 + 에러 본문 로깅
export async function getQuestion(req: GetQuestionRequest): Promise<GetQuestionResponse> {
  const params = new URLSearchParams({
    session_id: String(req.session_id),
    index: String(req.index), // 1-based 주의
  });

  const url = `/api/question/?${params.toString()}`; // ✅ 슬래시 포함

  const res = await fetch(url, { method: 'GET', headers: { accept: 'application/json' } });
  const text = await res.text();

  if (!res.ok) {
    console.error('[getQuestion] FAIL', res.status, res.statusText, text?.slice(0, 400));
    // JSON이면 detail 뽑아서 던지기
    try {
      const data = JSON.parse(text);
      const msg = typeof data?.detail === 'string'
        ? `Error ${res.status}: ${data.detail}`
        : `Error ${res.status}: ${JSON.stringify(data)}`;
      const err: any = new Error(msg);
      err.detail = data?.detail ?? data;
      throw err;
    } catch {
      throw new Error(`Error ${res.status}: ${res.statusText} - ${text?.slice(0, 300)}`);
    }
  }

  try {
    return JSON.parse(text) as GetQuestionResponse;
  } catch {
    console.error('[getQuestion] JSON parse error', text?.slice(0, 400));
    throw new Error('Invalid JSON from /api/question/');
  }
}

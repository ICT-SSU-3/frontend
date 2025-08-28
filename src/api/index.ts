import { getQuestion, GetQuestionRequest, GetQuestionResponse } from './question';

const BASE = process.env.REACT_APP_API_BASE_URL ?? '';

type StartReq = {
  company: string;
  role: string;
  user_name: string;
  resume_masked_text?: string;
};
type StartRes = { session_id: string; message?: string };

type EvalReq = {
  session_id: string;
  question: string;
  answer: string;
  time_in_seconds: number;
};
type EvalRes = { report_for_current_answer: string };

type EndReq = { session_id: string };
type EndRes = {
  interview_log: Array<{
    question: string;
    answer: string;
    time_in_seconds: number;
    evaluations: {
      star_evaluation?: string;
      logic_evaluation?: string;
      timing_evaluation?: { score: number; evaluation: string };
    };
    final_report: string;
  }>;
};

async function postJSON<T>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status} ${res.statusText} - ${text}`);
  }
  return res.json() as Promise<T>;
}

export const InterviewAPI = {
  start: (payload: StartReq) =>
    postJSON<StartRes>('/api/start_interview', payload),

  evaluate: (payload: EvalReq) =>
    postJSON<EvalRes>('/api/evaluate_answer', payload),

  end: (payload: EndReq) =>
    postJSON<EndRes>('/api/end_interview', payload),

  // ✅ getQuestion 메서드를 InterviewAPI 객체에 추가
  getQuestion: (payload: GetQuestionRequest) => getQuestion(payload),
};

// 타입스크립트가 InterviewAPI 객체의 타입을 정확히 추론하도록 돕기 위해
// 필요한 경우, 명시적으로 타입을 정의할 수도 있습니다.
// export type InterviewAPI = typeof InterviewAPI;
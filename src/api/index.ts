const BASE = process.env.REACT_APP_API_BASE_URL ?? '';

type StartReq = {
  company: string;
  role: string;
  user_name: string;
  resume_masked_text?: string; // 선택 전달
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
};
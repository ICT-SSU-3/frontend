// src/api/index.ts

import { getQuestion, GetQuestionRequest, GetQuestionResponse } from './question';
import { resumeFull, ResumeFullRequest, ResumeFullResponse } from './resumeFull';
import { fineval, FinevalRequest, FinevalResponse } from './fineval';

// ❌ BASE 제거
// const BASE = process.env.REACT_APP_API_BASE_URL;

type EvalReq = {
  session_id: number;
  question_id: number;
  answer: string;
  response_time: number;
};
type EvalRes = { report_for_current_answer: string };

async function postJSON<T>(path: string, body?: unknown): Promise<T> {
  // ✅ BASE 제거하고 path만 사용
  const res = await fetch(path, {
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

async function getJSON<T>(path: string, params: URLSearchParams): Promise<T> {
  const res = await fetch(`${path}?${params.toString()}`, {
    method: 'GET',
    headers: { 'accept': 'application/json' },
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
  return res.json() as Promise<T>;
}

export const InterviewAPI = {
  evaluate: (payload: EvalReq) =>
    postJSON<EvalRes>('/api/evaluate_answer', payload), // ✅ path만 사용

  getQuestion: (payload: GetQuestionRequest) =>
    getJSON<GetQuestionResponse>('/api/question',
      new URLSearchParams({
        session_id: payload.session_id.toString(),
        index: payload.index.toString(),
      })
    ),

  resumeFull: (payload: ResumeFullRequest) =>
    postJSON<ResumeFullResponse>('/api/resume/full', payload),

  fineval: (payload: FinevalRequest) =>
    getJSON<FinevalResponse>('/api/fineval',
      new URLSearchParams({ session_id: payload.session_id.toString() })
    ),
};

export {
  getQuestion,
  resumeFull,
};

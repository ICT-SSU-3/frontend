// const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

export interface ResumeFullRequest {
  user_name: string;
  company_name: string;
  jd_name: string;
  resume_text: string;
}

export interface ResumeFullResponse {
  session_id: string;
  summaries: string[];
  pairs: Array<{
    summary: string;
    jd?: { dataset: "jd"; doc_id: string; chunk_id: string; content: string; score: number } | null;
    faq?: { dataset: "question"; doc_id: string; chunk_id: string; content: string; score: number } | null;
  }>;
  questions: Array<{
    question_id: number;
    question_content: string;
    similar_jd: string;
  }>;
}

export async function resumeFull(req: ResumeFullRequest): Promise<ResumeFullResponse> {

  const res = await fetch('/api/resume/full', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  });

  const data = await res.json();
  if (!res.ok) {
    const msg = typeof data?.detail === 'string'
      ? `Error ${res.status}: ${data.detail}`
      : `Error ${res.status}: ${JSON.stringify(data)}`;
    throw new Error(msg);
  }
  return data as ResumeFullResponse;
}

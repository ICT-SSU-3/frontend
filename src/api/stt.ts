// src/api/stt.ts

// ❌ API_BASE_URL 제거
// const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

interface RecognizeResponse {
  transcript: string;
  duration: number;
  language: string;
  confidence: number;
}

interface ErrorResponse {
  detail: string;
}

export const recognizeSpeech = async (file: Blob, language: string = 'ko-KR'): Promise<RecognizeResponse> => {
  const formData = new FormData();
  formData.append('file', file, 'audio.webm'); 
  formData.append('language', language);

  // ✅ 절대 URL → 상대경로
  const response = await fetch('/api/stt/google/recognize', {
    method: 'POST',
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    const errorData: ErrorResponse = data;
    throw new Error(`Error ${response.status}: ${errorData.detail}`);
  }

  return data as RecognizeResponse;
};

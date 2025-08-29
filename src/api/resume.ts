// src/api/resume.ts

// ❌ API_BASE_URL 제거
// const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

interface MaskingResponse {
  engine: string;
  original_length: number;
  masked_length: number;
  masked_text: string;
}

interface ErrorResponse {
  detail: string;
}

export const maskResume = async (file: File, targetName: string): Promise<MaskingResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('target_name', targetName);

  // ✅ 절대 URL → 상대경로
  const response = await fetch('/api/resume/mask', {
    method: 'POST',
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    const errorData: ErrorResponse = data;
    throw new Error(`Error ${response.status}: ${errorData.detail}`);
  }

  return data as MaskingResponse;
};

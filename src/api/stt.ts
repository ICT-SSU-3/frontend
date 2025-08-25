const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

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
  if (!API_BASE_URL) {
    throw new Error('API Base URL is not defined in environment variables.');
  }

  const formData = new FormData();
  formData.append('file', file, 'audio.webm'); // 파일명은 임의로 지정
  formData.append('language', language);

  const response = await fetch(`${API_BASE_URL}/api/stt/google/recognize`, {
    method: 'POST',
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    const errorData: ErrorResponse = data;
    const errorMessage = `Error ${response.status}: ${errorData.detail}`;
    throw new Error(errorMessage);
  }

  return data as RecognizeResponse;
};
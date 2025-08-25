const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

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
  if (!API_BASE_URL) {
    throw new Error('API Base URL is not defined in environment variables.');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('target_name', targetName);

  const response = await fetch(`${API_BASE_URL}/api/resume/mask`, {
    method: 'POST',
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    const errorData: ErrorResponse = data;
    const errorMessage = `Error ${response.status}: ${errorData.detail}`;
    throw new Error(errorMessage);
  }

  return data as MaskingResponse;
};
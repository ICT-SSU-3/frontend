import React, { useState } from 'react';
import styled from 'styled-components';
import Modal from './Modal';
import { InputWrapper, StyledInput, Icon } from './Input';
import { StyledButton } from './Button';
import Select, { type SingleValue } from 'react-select';
import { maskResume } from '../../api/resume'; // API 함수 임포트

const Title = styled.h3`
  font-size: 20px; font-weight: bold; margin-bottom: 30px; text-align: center;
`;
const FileInputLabel = styled.label`
  background-color: #f7f7f7; border-radius: 8px; padding: 12px 16px;
  display: flex; align-items: center; justify-content: space-between;
  cursor: pointer; margin-bottom: 20px; font-size: 16px; color: #999;
`;
const FileInput = styled.input` display: none; `;
const DropdownWrapper = styled.div` margin-bottom: 20px; `;

const customStyles = {
  control: (provided: any) => ({
    ...provided,
    backgroundColor: '#f7f7f7',
    border: 'none',
    boxShadow: 'none',
    padding: '4px',
    borderRadius: '8px',
  }),
};

interface InterviewInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartInterview: (interviewData: {
    userName: string;
    companyName: string;
    jobTitle: string;
    pdfFile: File | null;
    maskedText?: string;
  }) => void;
}

type JobOption = { value: string; label: string };
const jobOptions: JobOption[] = [
  { value: 'security_development', label: 'Security Development' },
  { value: 'naver_app_android', label: '네이버 앱 Android' },
  { value: 'naver_app_ios', label: '네이버 앱 iOS' },
  { value: 'pwe_app_android', label: 'PWE 앱 Android' },
  { value: 'pwe_app_ios', label: 'PWE 앱 iOS' },
  { value: 'works_mobile_app_ios', label: 'WORKS MOBILE APP iOS' },
  { value: 'smartstudio_frontend', label: 'SMARTSTUDIO Front-end' },
  { value: 'smartstudio_backend', label: 'SMARTSTUDIO Back-end' },
  { value: 'smartstudio_android', label: 'SMARTSTUDIO Android' },
  { value: 'smartstudio_ios', label: 'SMARTSTUDIO iOS' },
  { value: 'wasl_backend', label: 'WASL Back-end' },
  { value: 'wasl_android', label: 'WASL Android' },
  { value: 'wasl_ios', label: 'WASL iOS' },
  { value: 'wasl_frontend', label: 'WASL Front-end' },
  { value: 'wasl_search_recommendation', label: 'WASL Search/Recommendation Engineer' },
];

const MaskedTextDisplay = styled.pre`
  background-color: #f3f4f6;
  border-radius: 8px;
  padding: 1rem;
  margin-top: 1rem;
  white-space: pre-wrap;
  font-size: 0.875rem;
  line-height: 1.5;
  color: #374151;
  max-height: 200px;
  overflow-y: auto;
`;

const ErrorDisplay = styled.div`
  background-color: #fee2e2;
  border: 1px solid #fca5a5;
  color: #b91c1c;
  border-radius: 8px;
  padding: 1rem;
  margin-top: 1rem;
  font-size: 0.875rem;
  font-weight: bold;
`;

const InterviewInfoModal: React.FC<InterviewInfoModalProps> = ({
  isOpen,
  onClose,
  onStartInterview,
}) => {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [userName, setUserName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [jobTitle, setJobTitle] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [maskedText, setMaskedText] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isFormValid = Boolean(pdfFile && userName && companyName && jobTitle);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
        setPdfFile(file);
        setError(null);
      } else {
        alert('PDF 파일만 업로드 가능합니다.');
        e.target.value = '';
      }
    }
  };

  const handleStart = async () => {
    if (!isFormValid || !pdfFile) return;

    setLoading(true);
    setError(null);

    try {
      const data = await maskResume(pdfFile, userName);
      console.log("마스킹 성공:", data);
      setMaskedText(data.masked_text);
      // onStartInterview({ 
      //   pdfFile, 
      //   userName, 
      //   companyName, 
      //   jobTitle: String(jobTitle),
      //   maskedText: data.masked_text,
      // });
      // onClose();
    } catch (err) {
      console.error('API 통신 중 오류 발생:', err);
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleJobChange = (opt: SingleValue<JobOption>) => {
    setJobTitle(opt?.label ?? '');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <Title>면접 정보 입력</Title>
      <div>
        <FileInputLabel htmlFor="pdf-upload">
          {pdfFile ? pdfFile.name : 'pdf 파일만 업로드 가능합니다.'}
          <Icon>📄</Icon>
          <FileInput
            id="pdf-upload"
            type="file"
            accept="application/pdf,.pdf"
            onChange={handleFileChange}
          />
        </FileInputLabel>
      </div>
      <InputWrapper>
        <Icon>👤</Icon>
        <StyledInput
          placeholder="이력서에 기입한 이름을 입력해주세요."
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
        />
      </InputWrapper>
      <InputWrapper>
        <Icon>🏢</Icon>
        <StyledInput
          placeholder="지원할 회사명을 입력해주세요."
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
        />
      </InputWrapper>
      <DropdownWrapper>
        <Select
          options={jobOptions}
          placeholder="직무를 선택하세요"
          styles={customStyles as any}
          value ={jobOptions.find(o => o.label === jobTitle) ?? null}
          onChange={handleJobChange} 
        />
      </DropdownWrapper>
      <StyledButton primary onClick={handleStart} disabled={!isFormValid || loading}>
        {loading ? '처리 중...' : '면접 생성'}
      </StyledButton>
      
      {error && (
        <ErrorDisplay>
          {error}
        </ErrorDisplay>
      )}

      {maskedText && (
        <MaskedTextDisplay>
          {maskedText}
        </MaskedTextDisplay>
      )}
    </Modal>
  );
};

export default InterviewInfoModal;

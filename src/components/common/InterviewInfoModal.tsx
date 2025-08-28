import React, { useState } from 'react';
import styled from 'styled-components';
import Modal from './Modal';
import { InputWrapper, StyledInput, Icon } from './Input';
import { StyledButton } from './Button';
import { maskResume } from '../../api/resume';
import { resumeFull, ResumeFullResponse } from '../../api/resumeFull';

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

interface InterviewInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartInterview: (interviewData: {
    userName: string;
    companyName: string;
    jobTitle: string;
    pdfFile: File | null;
    maskedText: string;
    initialQuestion: string;
    sessionId: string;
  }) => void;
}

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

const QuestionDisplay = styled.div`
  background-color: #e2f2ff;
  border: 1px solid #90caf9;
  color: #1a237e;
  border-radius: 8px;
  padding: 1rem;
  margin-top: 1rem;
  font-size: 1rem;
  line-height: 1.5;
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
  const [initialQuestion, setInitialQuestion] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fullResumeData, setFullResumeData] = useState<ResumeFullResponse | null>(null);

  const isFormValid = Boolean(pdfFile && userName && companyName && jobTitle);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
        setPdfFile(file);
        setError(null);
        setInitialQuestion(null);
        setMaskedText(null);
        setFullResumeData(null);
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
    setInitialQuestion(null);
    setMaskedText(null);

    try {
      // 1. resume/mask API 호출
      const maskingData = await maskResume(pdfFile, userName);
      const resumeText = maskingData.masked_text;
      setMaskedText(resumeText);
      console.log("마스킹 성공:", maskingData);

      // 2. resume/full API 호출
      const resumeFullData = await resumeFull({
        user_name: userName,
        company_name: companyName,
        jd_name: jobTitle,
        resume_text: resumeText,
      });
      setFullResumeData(resumeFullData);
      const initialQuestion = resumeFullData.questions[0].question_content;

      console.log("초기 질문 생성 성공:", initialQuestion);

      onStartInterview({
        pdfFile,
        userName,
        companyName,
        jobTitle,
        maskedText: resumeText,
        initialQuestion: initialQuestion,
        sessionId: resumeFullData.session_id,
      });

      onClose();

    } catch (err) {
      console.error('API 통신 중 오류 발생:', err);
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
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
      <InputWrapper>
        <Icon>💼</Icon>
        <StyledInput
          placeholder="직무를 입력해주세요."
          value={jobTitle}
          onChange={(e) => setJobTitle(e.target.value)}
        />
      </InputWrapper>
      <StyledButton primary onClick={handleStart} disabled={!isFormValid || loading}>
        {loading ? '처리 중...' : '면접 생성'}
      </StyledButton>

      {error && <ErrorDisplay>{error}</ErrorDisplay>}
      
      {maskedText && (
        <>
          <h4 style={{ marginTop: 16 }}>마스킹 텍스트(요약):</h4>
          <MaskedTextDisplay>{maskedText.slice(0, 1200)}</MaskedTextDisplay>
        </>
      )}

      {fullResumeData && fullResumeData.questions[0] && (
        <QuestionDisplay>{fullResumeData.questions[0].question_content}</QuestionDisplay>
      )}
    </Modal>
  );
};

export default InterviewInfoModal;
import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { InputWrapper, StyledTextarea } from '../common/Input';
import { recognizeSpeech } from '../../api/stt';
import { type ComponentType } from 'react';
import { FaMicrophone as FaMicrophoneRaw, FaPaperPlane as FaPaperPlaneRaw } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { StyledButton } from '../common/Button';
import { InterviewAPI } from '../../api';


const FaMicrophone = FaMicrophoneRaw as ComponentType;
const FaPaperPlane = FaPaperPlaneRaw as ComponentType;

const ChatContainer = styled.div`
  display: flex; flex-direction: column;
  height: 100%; width: 100%;
  padding: 20px; background-color: #fff;
`;
const MessageList = styled.div`
  flex: 1 1 auto;
  min-width: 0; min-height: 0;
  display: flex; flex-direction: column; gap: 12px;
  overflow-y: auto; overscroll-behavior: contain; -webkit-overflow-scrolling: touch;
  padding: 16px 10px 20px;
`;
const MessageBubble = styled.div<{ isUser: boolean }>`
  display: inline-block; width: fit-content; max-width: min(70%, 72ch);
  white-space: pre-wrap; overflow-wrap: anywhere; word-break: break-word;
  background-color: ${(p) => (p.isUser ? '#dcf8c6' : '#f7f7f7')};
  color: ${(p) => (p.isUser ? '#000' : '#333')};
  padding: 12px 20px; border-radius: 20px; margin: 0;
  align-self: ${(p) => (p.isUser ? 'flex-end' : 'flex-start')};
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
`;
const DividerBottom = styled.hr`
  border: none; border-top: 1px solid #e5e5e5;
  width: calc(100% + 40px); margin: 0 -20px 24px -20px;
`;
const ChatInputContainer = styled.div`
  display: flex; align-items: center; gap: 10px; width: 100%;
  background-color: #fff; border-radius: 25px; padding: 8px 16px;
  border: 1px solid #e5e5e5; box-shadow: 0 1px 2px rgba(0,0,0,0.03);
`;
const StyledIcon = styled.button<{ isRecording?: boolean }>`
  background: none; border: none; cursor: pointer; font-size: 20px;
  color: #555; padding: 0;
  &:hover { color: #000; }
  ${({ isRecording }) => isRecording && `
    color: red;
  `}
`;

const EndButtonWrap = styled.div`
  position: sticky; bottom: 8px; display: flex; justify-content: center; padding: 8px 0;
  background: transparent; pointer-events: none; z-index: 1;
  > * { pointer-events: auto; }
`;
const EndButton = styled(StyledButton)`
  width: auto; padding: 8px 16px; border-radius: 9999px;
`;
const DebugBox = styled.pre`
  background: #0b10210a; border: 1px dashed #cbd5e1; padding: 8px 10px; border-radius: 8px;
  font-size: 12px; color: #334155; max-height: 220px; overflow: auto; margin: 4px 0 0 0;
`;

// 더미 질문 -> 추후 질문 생성 api로 수정 필요
const dummyQuestions = [
  '네이버에서 데이터 분석가로 일하며 가장 중요하다고 생각하는 역량은 무엇인가요?',
  '데이터 기반 의사결정으로 성과를 개선했던 경험을 구체적으로 설명해주세요.',
  '대용량 로그/트래픽 데이터를 다룰 때 파이프라인을 어떻게 설계하시나요?',
  '모델/분석 결과를 PO/디자이너와 커뮤니케이션할 때 어떤 방식으로 설득하시나요?',
];

interface ChatbotProps {
  initialMessage: string;
  ctx: {
    sessionId?: string;           // start_interview 세션ID 
    companyName: string;
    jobTitle: string;
    userName: string;
    maskedText?: string;
  };
}
interface Message { text: string; isUser: boolean; }

export default function Chatbot({ initialMessage, ctx }: ChatbotProps) {
  const navigate = useNavigate();

  // 자소서 마스킹 데이터 출력
  const [messages, setMessages] = useState<Message[]>([
    { text: initialMessage, isUser: false },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

// 자소서 가드 -> 1500자만 보여줌
  const postedMaskedRef = useRef(false);
  const MAX_MASKED_CHARS = 1500; 

  useEffect(() => {
    if (postedMaskedRef.current) return;
    const full = (ctx.maskedText || '').trim();
    if (!full) return;

    postedMaskedRef.current = true;

    const sliced = full.slice(0, MAX_MASKED_CHARS);
    const omitted = full.length - sliced.length;

    const header = '📄 자소서(마스킹) 원문을 공유합니다.\n';
    const tail = omitted > 0 ? `\n\n(※ 길어 앞 ${MAX_MASKED_CHARS.toLocaleString()}자만 표시, 나머지 ${omitted.toLocaleString()}자 생략)` : '';

    setMessages(prev => [
      ...prev,
      { text: header + sliced + tail, isUser: false }, // 자소서 마스킹 데이터 호출
    ]);
  }, [ctx.maskedText]);

  // 질문 인덱스 -> 자기소개 답변 오면 질문 생성
  const [currentIdx, setCurrentIdx] = useState<number>(-1);
  const [questionStartAt, setQuestionStartAt] = useState<number | null>(null);

  // 디버깅
  const [sessionId, setSessionId] = useState<string | undefined>(ctx.sessionId);
  const [lastEval, setLastEval] = useState<string>('');
  const [lastError, setLastError] = useState<string>('');
  const [lastRequest, setLastRequest] = useState<any>(null);   // ★ 디버그용
  const [lastResponse, setLastResponse] = useState<any>(null); // ★ 디버그용

  useEffect(() => {
    if (ctx.sessionId && ctx.sessionId !== sessionId) setSessionId(ctx.sessionId);
  }, [ctx.sessionId]); // eslint-disable-line react-hooks/exhaustive-deps

  // textarea 높이 설정
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    if (!textareaRef.current) return;
    const el = textareaRef.current;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 120) + 'px';
  }, [inputValue]);

  // 스크롤
  const listRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages]);

  const sendUser = (text: string) => setMessages(prev => [...prev, { text, isUser: true }]);
  const sendBot  = (text: string) => setMessages(prev => [...prev, { text, isUser: false }]);

  // 다음 질문 보내기
  const askNext = (nextIdx: number) => {
    if (nextIdx >= dummyQuestions.length) {
      sendBot('준비된 질문은 여기까지예요. 필요하면 아래에서 면접을 종료해 로그를 확인해 주세요.');
      setCurrentIdx(nextIdx);
      setQuestionStartAt(null);
      return;
    }
    const q = dummyQuestions[nextIdx];
    sendBot(q);
    setCurrentIdx(nextIdx);
    setQuestionStartAt(Date.now());
  };

  // 메시지 전송
  const handleSendMessage = async () => {
    const text = inputValue.trim();
    if (!text) return;

    sendUser(text);
    setInputValue('');

    // 자기소개 답이 오면 0번 질문 시작
    if (currentIdx === -1) {
      askNext(0);
      return;
    }

    // 평가 api 호출 
    if (!sessionId) {
      setLastError('세션이 아직 준비되지 않아 evaluate를 생략했습니다.');
      askNext(currentIdx + 1);
      return;
    }

    try {
      const sec = questionStartAt != null
        ? Math.max(1, Math.round((Date.now() - questionStartAt) / 1000))
        : 60;

      const question = dummyQuestions[currentIdx] ?? '(unknown)';
      const reqPayload = {
        session_id: sessionId,
        question,
        answer: text,
        time_in_seconds: sec,
      };
      setLastRequest({ type: 'evaluate_answer', payload: reqPayload });

      const res = await InterviewAPI.evaluate(reqPayload);
      setLastResponse({ type: 'evaluate_answer', result: res });

      const { report_for_current_answer } = res;
      setLastEval(report_for_current_answer);
      sendBot(`평가 요약: ${report_for_current_answer}`);

      askNext(currentIdx + 1);
    } catch (e: any) {
      setLastError(String(e?.message || e));
      sendBot('평가 중 오류가 발생했습니다. 다음 질문으로 넘어갈게요.');
      askNext(currentIdx + 1);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // 면접 종료 -> 리더보드 페이지로 이동
  const onEndInterview = async () => {
    try {
      if (!sessionId) {
        navigate('/leaderboard', { state: {
          interview_log: [],
          note: '세션 없음',
          companyName: ctx.companyName,
          jobTitle: ctx.jobTitle,
        } });
        return;
      }
      const reqPayload = { session_id: sessionId };
      setLastRequest({ type: 'end_interview', payload: reqPayload });

      const data = await InterviewAPI.end(reqPayload);
      setLastResponse({ type: 'end_interview', result: data });

      navigate('/leaderboard', { state: {
        ...data,
        companyName: ctx.companyName,
        jobTitle: ctx.jobTitle,
      } });
    } catch (e: any) {
      setLastError('end_interview 실패: ' + (e?.message || e));
      navigate('/leaderboard', { state: {
        interview_log: [],
        error: String(e?.message || e),
        companyName: ctx.companyName,
        jobTitle: ctx.jobTitle,
      } });
    }
  };
  // 답변 녹음
  const handleSpeechRecognition = async () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
    } else {
      // 녹음 시작
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorderRef.current = new MediaRecorder(stream);
        audioChunksRef.current = [];

        mediaRecorderRef.current.ondataavailable = (event) => {
          audioChunksRef.current.push(event.data);
        };

        mediaRecorderRef.current.onstop = async () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          try {
            const result = await recognizeSpeech(audioBlob);
            setInputValue(result.transcript);
          } catch (error) {
            console.error('STT API 오류:', error);
            alert('음성 인식 중 오류가 발생했습니다.');
          }
        };

        mediaRecorderRef.current.start();
        setIsRecording(true);
      } catch (err) {
        console.error('음성 녹음 권한 오류:', err);
        alert('마이크 접근 권한이 필요합니다.');
      }
    }
  };

  return (
    <ChatContainer>
      <MessageList ref={listRef}>
        {messages.map((m, i) => (
          <MessageBubble key={i} isUser={m.isUser}>{m.text}</MessageBubble>
        ))}

        {/* 디버그  */}
        <DebugBox>
          {JSON.stringify({
            sessionId: sessionId ?? '(pending)',
            currentQuestionIndex: currentIdx,
            currentQuestion: currentIdx >= 0 && currentIdx < dummyQuestions.length ? dummyQuestions[currentIdx] : null,
            lastEvaluation: lastEval || null,
            lastError: lastError || null,
            lastRequest,
            lastResponse,
          }, null, 2)}
        </DebugBox>

        {/* 종료 버튼 */}
        <EndButtonWrap>
          <EndButton primary onClick={onEndInterview}>면접 종료하기</EndButton>
        </EndButtonWrap>
      </MessageList>

      <DividerBottom />

      <ChatInputContainer>
        <StyledIcon isRecording={isRecording} onClick={handleSpeechRecognition}>
          <FaMicrophone />
        </StyledIcon>
        <InputWrapper style={{ flexGrow: 1, marginBottom: 0, alignItems: 'stretch' }}>
          <StyledTextarea
            ref={textareaRef}
            rows={1}
            placeholder="답변을 입력하세요."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </InputWrapper>
        <StyledIcon onClick={handleSendMessage}><FaPaperPlane /></StyledIcon>
      </ChatInputContainer>
    </ChatContainer>
  );
}

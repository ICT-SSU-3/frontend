// src/components/chat/Chatbot.tsx

import React, { useEffect, useRef, useState, type ComponentType } from 'react';
import styled from 'styled-components';
import { InputWrapper, StyledTextarea } from '../common/Input';
import { recognizeSpeech } from '../../api/stt';
import { FaMicrophone as FaMicrophoneRaw, FaPaperPlane as FaPaperPlaneRaw } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { StyledButton } from '../common/Button';
import { InterviewAPI } from '../../api';

// 아이콘 타입 단언
const FaMicrophone = FaMicrophoneRaw as ComponentType;
const FaPaperPlane = FaPaperPlaneRaw as ComponentType;

/* ================== styles ================== */
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
  ${({ isRecording }) => isRecording && ` color: red; `}
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

/* ================== constants ================== */
// 백업 질문 (서버 질문 없을 때 사용)
const fallbackQuestions = [
  '네이버에서 데이터 분석가로 일하며 가장 중요하다고 생각하는 역량은 무엇인가요?',
  '데이터 기반 의사결정으로 성과를 개선했던 경험을 구체적으로 설명해주세요.',
  '대용량 로그/트래픽 데이터를 다룰 때 파이프라인을 어떻게 설계하시나요?',
  '모델/분석 결과를 PO/디자이너와 커뮤니케이션할 때 어떤 방식으로 설득하시나요?',
];

/* ================== types ================== */
interface ChatbotProps {
  initialMessage: string;
  ctx: {
    sessionId?: string;           // start_interview 세션ID
    companyName: string;
    jobTitle: string;
    userName: string;
    maskedText?: string;
    backendQuestions?: string[];  // /api/resume/full 로 생성된 질문
    backendRaw?: any;             // ResumeFullResponse (응답 전문)
  };
}
interface Message { text: string; isUser: boolean; }

/* ================== component ================== */
export default function Chatbot({ initialMessage, ctx }: ChatbotProps) {
  const navigate = useNavigate();

  // 서버 질문이 있으면 우선 사용, 없으면 fallback
  const questions = (ctx.backendQuestions && ctx.backendQuestions.length > 0)
    ? ctx.backendQuestions
    : fallbackQuestions;

  // 자소서/초기 메시지
  const [messages, setMessages] = useState<Message[]>([
    { text: initialMessage, isUser: false },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // 자소서 마스킹 표시 (앞 1500자만)
  const postedMaskedRef = useRef(false);
  const MAX_MASKED_CHARS = 1500;

  // 서버 응답 전문(JSON) 1회 표시 가드
  const postedBackendRawRef = useRef(false);

  // 질문 인덱스/타이머
  const [currentIdx, setCurrentIdx] = useState<number>(-1);
  const [questionStartAt, setQuestionStartAt] = useState<number | null>(null);

  // 디버깅 상태
  const [sessionId, setSessionId] = useState<string | undefined>(ctx.sessionId);
  const [lastEval, setLastEval] = useState<string>('');
  const [lastError, setLastError] = useState<string>('');
  const [lastRequest, setLastRequest] = useState<any>(null);
  const [lastResponse, setLastResponse] = useState<any>(null);

  // textarea 높이 자동
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    if (!textareaRef.current) return;
    const el = textareaRef.current;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 120) + 'px';
  }, [inputValue]);

  // 스크롤 하단 유지
  const listRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages]);

  // 세션 갱신
  useEffect(() => {
    if (ctx.sessionId && ctx.sessionId !== sessionId) setSessionId(ctx.sessionId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ctx.sessionId]);

  // 유틸: 메시지 추가
  const sendUser = (text: string) =>
    setMessages(prev => [...prev, { text, isUser: true }]);
  const sendBot  = (text: string) =>
    setMessages(prev => [...prev, { text, isUser: false }]);


  // FIX: 서버 응답 전문(JSON) 1회 출력
  useEffect(() => {
  // `ctx.backendRaw`가 존재하고 `postedBackendRawRef`가 아직 false일 때만 실행
  if (!postedBackendRawRef.current && ctx.backendRaw) {
    postedBackendRawRef.current = true;
    
    // ⭐ 수정된 부분: session_id만 추출하여 메시지 생성
    const sessionId = ctx.backendRaw.session_id;
    if (sessionId) {
      sendBot(`✅ 세션이 생성되었습니다. (ID: ${sessionId})`);
    } else {
      sendBot(`⚠️ 세션 ID를 찾을 수 없습니다.`);
    }
  }
}, [ctx.backendRaw]);

  // 다음 질문 송출
  const askNext = (nextIdx: number) => {
    // FIX: dummyQuestions 참조 제거, 통일해서 questions 사용
    if (nextIdx >= questions.length) {
      sendBot('준비된 질문은 여기까지예요. 필요하면 아래에서 면접을 종료해 로그를 확인해 주세요.');
      setCurrentIdx(nextIdx);
      setQuestionStartAt(null);
      return;
    }
    const q = questions[nextIdx];
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

    // 평가 api 호출 (세션 없으면 스킵하고 다음 질문)
    if (!sessionId) {
      setLastError('세션이 아직 준비되지 않아 evaluate를 생략했습니다.');
      askNext(currentIdx + 1);
      return;
    }

    try {
      const sec = questionStartAt != null
        ? Math.max(1, Math.round((Date.now() - questionStartAt) / 1000))
        : 60;

      // FIX: 현재 질문도 questions 기준으로 참조
      const question = questions[currentIdx] ?? '(unknown)';
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

  // 엔터 전송
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // 면접 종료 → 리더보드 이동
  const onEndInterview = async () => {
    try {
      if (!sessionId) {
        navigate('/leaderboard', {
          state: {
            interview_log: [],
            note: '세션 없음',
            companyName: ctx.companyName,
            jobTitle: ctx.jobTitle,
          },
        });
        return;
      }
      const reqPayload = { session_id: sessionId };
      setLastRequest({ type: 'end_interview', payload: reqPayload });

      const data = await InterviewAPI.end(reqPayload);
      setLastResponse({ type: 'end_interview', result: data });

      navigate('/leaderboard', {
        state: {
          ...data,
          companyName: ctx.companyName,
          jobTitle: ctx.jobTitle,
        },
      });
    } catch (e: any) {
      setLastError('end_interview 실패: ' + (e?.message || e));
      navigate('/leaderboard', {
        state: {
          interview_log: [],
          error: String(e?.message || e),
          companyName: ctx.companyName,
          jobTitle: ctx.jobTitle,
        },
      });
    }
  };

  // 음성 녹음 → STT
  const handleSpeechRecognition = async () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
      return;
    }
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
  };

  return (
    <ChatContainer>
      <MessageList ref={listRef}>
        {messages.map((m, i) => (
          <MessageBubble key={i} isUser={m.isUser}>{m.text}</MessageBubble>
        ))}

        {/* 디버그 */}
        <DebugBox>
          {JSON.stringify({
            sessionId: sessionId ?? '(pending)',
            currentQuestionIndex: currentIdx,
            // FIX: 여기서도 questions 사용
            currentQuestion: currentIdx >= 0 && currentIdx < questions.length ? questions[currentIdx] : null,
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
        <StyledIcon onClick={handleSendMessage}>
          <FaPaperPlane />
        </StyledIcon>
      </ChatInputContainer>
    </ChatContainer>
  );
}

import React, { useState, useRef, useEffect, type ComponentType } from 'react';
import styled from 'styled-components';
import { FaMicrophone as FaMicrophoneRaw, FaPaperPlane as FaPaperPlaneRaw } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { StyledButton } from '../common/Button';
import { InputWrapper, StyledTextarea } from '../common/Input';
import { recognizeSpeech } from '../../api/stt'; // STT API 함수 임포트

const FaMicrophone = FaMicrophoneRaw as ComponentType;
const FaPaperPlane = FaPaperPlaneRaw as ComponentType;

const ChatContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%; width: 100%;
  padding: 20px;
  background-color: #fff;
`;

const MessageList = styled.div`
  flex: 1 1 auto;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow-y: auto;
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
  padding: 16px 10px 10px;
  min-height: 0;
`;

const MessageBubble = styled.div<{ isUser: boolean }>`
  display: inline-block;
  width: fit-content;
  max-width: min(70%, 72ch);
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  word-break: break-word;

  background-color: ${(p) => (p.isUser ? '#dcf8c6' : '#f7f7f7')};
  color: ${(p) => (p.isUser ? '#000' : '#333')};
  padding: 12px 20px;
  border-radius: 20px;
  margin: 0;
  align-self: ${(p) => (p.isUser ? 'flex-end' : 'flex-start')};
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
`;

const EndButtonWrap = styled.div`
  position: sticky;
  bottom: 8px;
  display: flex;
  justify-content: center;
  padding: 4px 0;

  background: transparent;
  pointer-events: none;
  z-index: 1;

  > * { pointer-events: auto; }
`;
const EndButton = styled(StyledButton)`
  width: auto;
  padding: 8px 16px;
  border-radius: 9999px;
`;

const DividerBottom = styled.hr`
  border: none;
  border-top: 1px solid #e5e5e5;
  width: calc(100% + 40px);
  margin: 0 -20px 24px -20px;
`;

const ChatInputContainer = styled.div`
  display: flex; align-items: center; gap: 10px;
  width: 100%;
  background-color: #fff;
  border-radius: 25px;
  padding: 8px 16px;
  border: 1px solid #e5e5e5;
  box-shadow: 0 1px 2px rgba(0,0,0,0.03);
  transition: border-color .2s ease, box-shadow .2s ease;
`;

const StyledIcon = styled.button<{ isRecording?: boolean }>`
  background: none; border: none; cursor: pointer; font-size: 20px;
  color: #555; padding: 0;
  &:hover { color: #000; }
  ${({ isRecording }) => isRecording && `
    color: red;
  `}
`;

interface ChatbotProps { 
  initialMessage: string; 
  companyName: string;
  jobTitle: string;
}

interface Message { text: string; isUser: boolean; }

const Chatbot: React.FC<ChatbotProps> = ({ initialMessage, companyName, jobTitle }) => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([{ text: initialMessage, isUser: false }]);
  const [inputValue, setInputValue] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const messageListRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!textareaRef.current) return;
    const el = textareaRef.current;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 120) + 'px';
  }, [inputValue]);

  useEffect(() => {
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (inputValue.trim()) {
      const newUserMessage: Message = { text: inputValue, isUser: true };
      setMessages((prev) => [...prev, newUserMessage]);
      setInputValue('');
      // TODO: 백엔드 API 호출 로직 추가
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSpeechRecognition = async () => {
    if (isRecording) {
      // 녹음 중이면 녹음 종료
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
      <MessageList ref={messageListRef}>
        {messages.map((msg, i) => (
          <MessageBubble key={i} isUser={msg.isUser}>
            {msg.text}
          </MessageBubble>
        ))}

        <EndButtonWrap>
          <EndButton
            primary
            onClick={() => {
              navigate('/leaderboard', {
                state: { companyName, jobTitle }
              });
            }}
          >
            면접 종료하기
          </EndButton>
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
};

export default Chatbot;

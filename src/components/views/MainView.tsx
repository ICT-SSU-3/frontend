import React, { useEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';
import { StyledButton } from '../common/Button';
import Chatbot from '../chat/Chatbot';

const PageContainer = styled.div`
  display: flex;
  height: 100%;
  width: 100%;
  background-color: #ffffffff;
  font-family: 'Pretendard', sans-serif;
`;

const Sidebar = styled.div`
  flex: 0 0 280px;
  width: 280px;
  flex-shrink: 0;
  background-color: #fff;
  border-right: 1px solid #ddd;
  padding: 30px 20px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const Content = styled.div`
  flex: 1 1 auto;
  min-width: 0;
  display: flex;
  flex-direction: column;
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 20px;
`;

const Divider = styled.hr`
  border: none;
  border-top: 1px solid #e5e5e5;
  margin: 24px -20px;
`;

const DividerBottom = styled.hr`
  border: none;
  border-top: 1px solid #e5e5e5;
  width: calc(100% + 40px);
  margin: 0 -20px 24px -20px;
`;

const EmptyState = styled.div`
  flex: 1;
  display: grid;
  place-items: center;
`;

const SectionLabel = styled.h3`
  font-weight: 700;
  margin: 10px 0;
`;

const ChatList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const ChatItem = styled.button<{ active?: boolean }>`
  display: flex;
  width: 100%;
  text-align: left;
  gap: 12px;
  background: #fff;
  border: 1px solid transparent;
  padding: 10px 12px;
  border-radius: 10px;
  cursor: pointer;
  font-size: 14px;
  color: #111;
  transition: background-color .15s ease, border-color .15s ease, transform .04s ease;

  &:hover { background: #f7f7f7; border-color: #e5e5e5; }
  &:active, &[data-active="true"] { transform: translateY(1px); background: #efefef; }

  ${({ active }) => active && `border-color: #e5e5e5;`}
`;

const ChatLabel = styled.span`
  flex: 1;
  min-width: 0;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`;

const ChatIcon = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  line-height: 1;
`;

const EmptyNotice = styled.div`
  color: #9ca3af;
  font-size: 13px;
  padding: 8px;
  text-align: center;
`;

interface MainViewProps {
  onNewInterviewClick: () => void;
  onLoginClick: () => void;
  interviewData: {
    userName: string;
    companyName: string;
    jobTitle: string;
    pdfFile?: File | null;
  } | null;
}

type Session = {
  id: string;
  companyName: string;
  jobTitle: string;
  createdAt: number;
};

const uid = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;

const MainView: React.FC<MainViewProps> = ({ onNewInterviewClick, onLoginClick, interviewData }) => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const lastAddedKey = useRef<string | null>(null);

  // 새 면접이 들어오면 최신을 위로 추가
  useEffect(() => {
    if (!interviewData) return;
    const key = `${interviewData.companyName}|${interviewData.jobTitle}`;
    if (lastAddedKey.current === key) return;

    const s: Session = {
      id: uid(),
      companyName: String(interviewData.companyName ?? ''),
      jobTitle: String(interviewData.jobTitle ?? ''),
      createdAt: Date.now(),
    };
    setSessions(prev => [s, ...prev]); // 시간 순으로 정렬
    setActiveId(s.id);
    lastAddedKey.current = key;
  }, [interviewData]);

  const sessionsForView = useMemo(
    () => [...sessions].sort((a, b) => b.createdAt - a.createdAt), // 최신 위 / 과거 아래
    [sessions]
  );

  const activeSession = useMemo(
    () => sessions.find(s => s.id === activeId) ?? null,
    [sessions, activeId]
  );

  const initialMessage = activeSession
    ? `${activeSession.companyName}의 ${activeSession.jobTitle}에 대한 면접을 시작하겠습니다. 간단하게 자기소개 해주세요.`
    : '';



  return (
    <PageContainer>
      <Sidebar>
        <div>
          <Title>면접 챗봇</Title>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <StyledButton onClick={onNewInterviewClick}>
              + 새로운 면접 시작하기
            </StyledButton>
          </div>

          <Divider />

          <SectionLabel>면접 기록</SectionLabel>

          {sessionsForView.length === 0 ? (
            <EmptyNotice>진행한 면접이 없습니다.</EmptyNotice>
          ) : (
            <ChatList>
              {sessionsForView.map((s) => (
                <ChatItem
                  key={s.id}
                  active={s.id === activeId}
                  data-active={s.id === activeId || undefined}
                  onClick={() => setActiveId(s.id)}
                  title={`${s.companyName} · ${s.jobTitle}`}
                >
                  <ChatIcon role="img" aria-label="chat">💬</ChatIcon>
                  <ChatLabel>{s.companyName}, {s.jobTitle}</ChatLabel>
                </ChatItem>
              ))}
            </ChatList>
          )}
        </div>

        <div>
          <DividerBottom />
          <p style={{ fontSize: '12px', color: '#999', textAlign: 'center' }}>로그인하고 면접 기록 저장하기</p>
          <StyledButton style={{ marginTop: '10px' }} onClick={onLoginClick}>
            <span role="img" aria-label="login">👤</span> 로그인
          </StyledButton>
        </div>
      </Sidebar>

      <Content>
        {activeSession ? (
          <Chatbot
            initialMessage={initialMessage}
            companyName={activeSession.companyName}
            jobTitle={activeSession.jobTitle}
          />
        ) : (
          <EmptyState>
            <div style={{ color: '#999', fontSize: '20px' }}>
              새로운 면접을 시작해주세요.
            </div>
          </EmptyState>
        )}
      </Content>
    </PageContainer>
  );
};

export default MainView;

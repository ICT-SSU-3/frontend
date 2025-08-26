import React, { useState } from 'react';
import styled from 'styled-components';
import { useLocation } from 'react-router-dom';

const ModalOverlay = styled.div`
  position: fixed; inset: 0; background-color: rgba(0,0,0,0.5);
  display: flex; justify-content: center; align-items: center; z-index: 1000;
`;
const ModalContent = styled.div`
  background-color: #fff; padding: 30px; border-radius: 10px;
  max-width: 80%; max-height: 80%; overflow-y: auto; line-height: 1.6;
  text-align: left; white-space: pre-wrap;
`;

const ItemWrapper = styled.div`
  background-color: #f0f0f0; border-radius: 10px; padding: 15px 20px;
  margin-bottom: 10px; display: flex; align-items: flex-start; gap: 16px;
`;

const Container = styled.div`
  padding: 40px; background-color: #ffffff; text-align: center;
  width: 90%; max-width: 900px; margin: 0 auto;
  box-shadow: 0 4px 10px rgba(0,0,0,0.1); border-radius: 10px;
  font-family: 'Pretendard', sans-serif;
`;

const Header = styled.div` text-align: center; margin-bottom: 20px; `;
const Title = styled.h2` font-size: 24px; font-weight: bold; margin-bottom: 20px; `;
const HeaderInfo = styled.div` font-size: 16px; color: #555; `;
const Icon = styled.span` margin-left: 8px; `;

const ScrollArea = styled.div`
  max-height: 520px; overflow-y: auto; padding-right: 10px;
`;

const Pill = styled.span`
  display: inline-block; padding: 4px 10px; border-radius: 9999px;
  border: 1px solid #e5e7eb; background: #f9fafb; font-size: 12px; color: #374151;
`;

const Monos = styled.pre`
  font-size: 12px; text-align: left; background: #f8fafc; border: 1px dashed #cbd5e1;
  padding: 10px; border-radius: 8px; color: #334155; max-height: 200px; overflow: auto;
`;


const Question: React.FC<{ number: number; text: string }> = ({ number, text }) => (
  <div style={{ flex: 1, minWidth: 0 }}>
    <div style={{ fontWeight: 700, marginBottom: 6 }}>Q{number}.</div>
    <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{text}</div>
  </div>
);

const ScoreBox: React.FC<{ timingScore?: number }> = ({ timingScore }) => (
  <div style={{ width: 120, textAlign: 'center' }}>
    <div style={{ fontWeight: 700, marginBottom: 6 }}>Time</div>
    <Pill>{typeof timingScore === 'number' ? `${timingScore} 점` : 'N/A'}</Pill>
  </div>
);

const Feedback: React.FC<{ label: string; text?: string }> = ({ label, text }) => {
  const [open, setOpen] = useState(false);
  if (!text) return <div style={{ width: 240 }}><i style={{ color: '#9ca3af' }}>({label} 없음)</i></div>;
  return (
    <>
      <div
        onClick={() => setOpen(true)}
        style={{
          width: 240, cursor: 'pointer', background: '#eef2ff',
          border: '1px solid #c7d2fe', color: '#1e1b4b', borderRadius: 8,
          padding: '10px 12px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
        }}
        title={`${label} (클릭하여 전체 보기)`}
      >
        {text}
      </div>
      {open && (
        <ModalOverlay onClick={() => setOpen(false)}>
          <ModalContent onClick={e => e.stopPropagation()}>
            <h3 style={{ marginTop: 0 }}>{label}</h3>
            <div style={{ whiteSpace: 'pre-wrap' }}>{text}</div>
          </ModalContent>
        </ModalOverlay>
      )}
    </>
  );
};

type LBState = {
  interview_log?: Array<{
    question: string;
    answer: string;
    time_in_seconds: number;
    evaluations?: {
      star_evaluation?: string;
      logic_evaluation?: string;
      timing_evaluation?: { score: number; evaluation: string };
    };
    final_report?: string;
  }>;
  error?: string;
  note?: string;
  companyName?: string;
  jobTitle?: string;
};

const Leaderboard: React.FC = () => {
  const { state } = useLocation() as { state?: LBState };
  const companyName = state?.companyName ?? '';
  const jobTitle = state?.jobTitle ?? '';
  const rows = state?.interview_log ?? [];

  return (
    <Container>
      <Header>
        <Title>리더보드</Title>
        <HeaderInfo>
          <span><Icon>🏢</Icon>{companyName} / {jobTitle}</span>
        </HeaderInfo>
        {(state?.error || state?.note) && (
          <div style={{ marginTop: 8, color: state?.error ? '#b91c1c' : '#4b5563' }}>
            {state?.error ?? state?.note}
          </div>
        )}
      </Header>

      {rows.length === 0 ? (
        <div style={{ color: '#9ca3af' }}>표시할 인터뷰 로그가 없습니다.</div>
      ) : (
        <ScrollArea>
          {rows.map((item, idx) => (
            <ItemWrapper key={idx}>
              <Question number={idx + 1} text={item.question} />
              <div style={{ width: 120, textAlign: 'center' }}>
                <div style={{ fontWeight: 700, marginBottom: 6 }}>Sec</div>
                <Pill>{item.time_in_seconds}s</Pill>
              </div>
              <ScoreBox timingScore={item.evaluations?.timing_evaluation?.score} />
              <Feedback label="최종 보고서" text={item.final_report} />
            </ItemWrapper>
          ))}
        </ScrollArea>
      )}

      <div style={{ marginTop: 20, textAlign: 'left' }}>
        <h4 style={{ margin: '10px 0' }}>Raw interview_log (debug)</h4>
        <Monos>{JSON.stringify(rows, null, 2)}</Monos>
      </div>
    </Container>
  );
};

export default Leaderboard;

import React, { useState } from 'react';
import styled from 'styled-components';
import { useLocation } from 'react-router-dom';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color: #fff;
  padding: 30px;
  border-radius: 10px;
  max-width: 80%;
  max-height: 80%;
  overflow-y: auto;
  line-height: 1.6;
  text-align: left;
  white-space: pre-wrap;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
`;

const ItemWrapper = styled.div`
  background-color: #f0f0f0;
  border-radius: 10px;
  padding: 15px 20px;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  box-sizing: border-box;
`;

const Container = styled.div`
  padding: 40px;
  background-color: #ffffff;
  text-align: center;
  width: 90%;
  max-width: 750px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  border-radius: 10px;
  font-family: 'Pretendard', sans-serif; /* 폰트 유지 */
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 20px;
`;

const Title = styled.h2`
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 40px;
`;

const HeaderInfo = styled.div`
  font-size: 16px;
  color: #555;
`;

const Icon = styled.span`
  margin-left: 8px;
`;

const ScrollArea = styled.div`
  max-height: 400px; 
  overflow-y: auto; 
  padding-right: 15px;
`;

const ListItem = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 20px;
  align-items: start;
  margin-bottom: 15px;
`;

const Monos = styled.pre`
  font-size: 12px; text-align: left; background: #f8fafc; border: 1px dashed #cbd5e1;
  padding: 10px; border-radius: 8px; color: #334155; max-height: 200px; overflow: auto;
`;


const Question: React.FC<{ number: number; text: string }> = ({ number, text }) => {
  return (
    <ItemWrapper
      style={{
        height: '55px',
        overflowY: 'auto',
        display: 'block',
        whiteSpace: 'normal',
        width: '350px', 
      }}
    >
      <span style={{ fontWeight: 'bold' }}>Q{number}. </span>
      <span>{text}</span>
    </ItemWrapper>
  );
};

const Time: React.FC<{ time?: number }> = ({ time }) => {
  return (
    <ItemWrapper style={{ width: '90px', height: '55px', justifyContent: 'center' }}>
      <span>{time}초</span>
    </ItemWrapper>
  );
};

const Score: React.FC<{ score?: number }> = ({ score }) => {
  return (
    <ItemWrapper style={{ width: '90px', height: '55px', justifyContent: 'center' }}>
      <span>{score}점</span>
    </ItemWrapper>
  );
};

const Feedback: React.FC<{ text?: string }> = ({ text }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  return (
    <>
      <ItemWrapper
        onClick={openModal}
        style={{
          cursor: 'pointer',
          display: 'block',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          width: '250px', // 고정 너비
        }}
      >
        <span>{text}</span>
      </ItemWrapper>
      {isModalOpen && (
        <ModalOverlay onClick={closeModal}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <p>{text}</p>
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
            <ListItem key={idx}>
              <Question number={idx + 1} text={item.question} />
              <Time time={item.time_in_seconds} />
              <Score score={item.evaluations?.timing_evaluation?.score} />
              <Feedback text={item.final_report} />
            </ListItem>
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

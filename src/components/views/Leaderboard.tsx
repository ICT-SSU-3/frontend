import React, { useState } from 'react';
import styled from 'styled-components';
// ✅ 핵심: 라우터 state로 회사명/직무명 받기 위해 useLocation 추가
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

const Score: React.FC<{ score: number }> = ({ score }) => {
  return (
    <ItemWrapper style={{ width: '90px', height: '55px', justifyContent: 'center' }}>
      <span>{score}점</span>
    </ItemWrapper>
  );
};

const Feedback: React.FC<{ text: string }> = ({ text }) => {
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

const ScrollableQuestionList = styled.div`
  max-height: 400px;
  overflow-y: auto;
  padding-right: 15px; /* 스크롤바 공간 확보 */
`;

const ListItem = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 20px;
  align-items: start;
  margin-bottom: 15px;
`;

type LBState = { companyName?: string; jobTitle?: string };

const Leaderboard: React.FC = () => {

  const { state } = useLocation() as { state?: LBState };
  const companyName = state?.companyName ?? '';
  const jobTitle = state?.jobTitle ?? '';

  //임의의 데이터
  const myRank = 10;
  const totalUsers = 100;
  const totalScore = 95;

  const leaderboardData = [
    { question: '첫 번째 문제의 질문입니다. 문제가 길어진다악. 이 부분은 상하 스크롤이 되어야 합니다.', score: 85, feedback: '매우 잘했어요!' },
    { question: '두 번째 문제입니다. 텍스트가 매우 길어져서 여러 줄로 늘어날 수 있습니다. 상하 스크롤을 확인하세요!', score: 50, feedback: '개선이 필요합니다.별로에요 우우우 말투 별로 우우우 문장 별로 우우우 완전 별로 우우우 점수 날로 먹네 우우우ㅜ우 완전 길게 쓸게요 완전 길게 쓸게요 완전 길게 쓸게요 완전 길게 쓸게요.' },
    { question: '세 번째 문제입니다.', score: 92, feedback: '훌륭합니다!' },
    { question: '네 번째 문제입니다.', score: 78, feedback: '좋습니다.' },
    { question: '다섯 번째 문제입니다.', score: 65, feedback: '조금 더 노력해 보세요.' },
    { question: '여섯 번째 문제입니다.', score: 98, feedback: '아주 좋습니다.' },
    { question: '일곱 번째 문제입니다.', score: 45, feedback: '괜찮습니다.' },
    { question: '여덟 번째 문제입니다.', score: 89, feedback: '잘했습니다!' },
    { question: '아홉 번째 문제입니다.', score: 100, feedback: '매우 잘했어요!' },
    { question: '열 번째 문제입니다.', score: 55, feedback: '개선이 필요합니다.' },
  ];

  return (
    <Container>
      <Header>
        <Title>리더보드</Title>
        <HeaderInfo>
          <span><Icon>🏢</Icon>{companyName} / {jobTitle}</span>
          <Icon>🏆</Icon> {myRank}/{totalUsers}등 ({totalScore}점)
        </HeaderInfo>
      </Header>

      <ScrollableQuestionList>
        {leaderboardData.map((item, index) => (
          <ListItem key={index}>
            <Question number={index + 1} text={item.question} />
            <Score score={item.score} />
            <Feedback text={item.feedback} />
          </ListItem>
        ))}
      </ScrollableQuestionList>
    </Container>
  );
};

export default Leaderboard;

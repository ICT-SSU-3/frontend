import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import MainView from '../components/views/MainView';
import InterviewInfoModal from '../components/common/InterviewInfoModal';

const AppContainer = styled.div`
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
`;
const ContentContainer = styled.div`
  background-color: transparent;
  border-radius: 0;
  box-shadow: none;
  overflow: hidden;
  display: flex;
  width: 100vw;
  height: 100vh;
`;

export default function MainRoute() {
  const nav = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const startInterview = (data: any) => {
    nav('/chat', { state: data });
  };

  return (
    <AppContainer>
      <ContentContainer>
        <MainView
          onNewInterviewClick={() => setIsModalOpen(true)}
          onLoginClick={() => nav('/login')}
          interviewData={null}
        />
        {isModalOpen && (
          <InterviewInfoModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onStartInterview={startInterview}
          />
        )}
      </ContentContainer>
    </AppContainer>
  );
}

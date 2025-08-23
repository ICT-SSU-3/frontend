import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Signup from '../components/auth/Signup';

const Wrap = styled.div`
  height: 100vh; width: 100vw; display: flex;
`;
const CardArea = styled.div`
  margin: auto; width: 400px; padding: 40px;
`;

export default function SignupRoute() {
  const nav = useNavigate();
  return (
    <Wrap>
      <CardArea>
        <Signup onSignupSuccess={() => nav('/login')} />
      </CardArea>
    </Wrap>
  );
}

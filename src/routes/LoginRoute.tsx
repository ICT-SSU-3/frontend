import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Login from '../components/auth/Login';

const Wrap = styled.div`
  height: 100vh; width: 100vw; display: flex;
`;
const CardArea = styled.div`
  margin: auto; width: 400px; padding: 40px;
`;

export default function LoginRoute() {
  const nav = useNavigate();
  return (
    <Wrap>
      <CardArea>
        <Login onLoginSuccess={() => nav('/')} onSignupClick={() => nav('/signup')} />
      </CardArea>
    </Wrap>
  );
}

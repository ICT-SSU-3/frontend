  import React, { useState } from 'react';
  import styled from 'styled-components';
  import { InputWrapper, StyledInput, Icon } from '../common/Input';


  const Container = styled.div`
    padding: 40px;
    background-color: #ffffff;
    text-align: center;
    width: 200%;
    max-width: 500px;
    position: absolute;
    top: 45%;
    left: 50%;
    transform: translate(-50%, -50%);
`;

  const Title = styled.h2`
    font-size: 24px;
    font-weight: bold;
    margin-bottom: 40px;
  `;

  const LoginButton = styled.button`
    width: 40%;
    padding: 10px; 
    font-size: 16px;
    font-weight: bold;
    color: #ffffff;
    background-color: #000000;
    border: none;
    border-radius: 12px;
    cursor: pointer;
    
    &:disabled {
      background-color: #ccc;
      cursor: not-allowed;
    }
  `;

  const SignupButton = styled.button`
    width: 40%;
    padding: 10px;
    font-size: 16px;
    font-weight: bold;
    color: #000;
    background-color: #fff;
    border: 1px solid #000; 
    border-radius: 12px;
    cursor: pointer;
    transition: background-color 0.2s;
  `;

  interface LoginProps {
    onLoginSuccess: () => void;
    onSignupClick: () => void;
  }

  const Login: React.FC<LoginProps> = ({ onLoginSuccess, onSignupClick }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = () => {
      console.log('로그인 시도:', { email, password });
      if (!isFormValid) return;
      onLoginSuccess();
    };

    const isFormValid = email.length > 0 && password.length > 0;

    return (
      <Container>
        <Title>로그인</Title>
        <InputWrapper>
          <Icon>📧</Icon>
          <StyledInput
            type="email"
            placeholder="이메일 주소"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </InputWrapper>
        <InputWrapper>
          <Icon>🔒</Icon>
          <StyledInput
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </InputWrapper>
        <LoginButton onClick={handleLogin} disabled={!isFormValid}>
          로그인
        </LoginButton>
        <div></div>
        <SignupButton onClick={onSignupClick} style={{ marginTop: '10px' }}>
          회원가입
        </SignupButton>
      </Container>
    );
  };

  export default Login;

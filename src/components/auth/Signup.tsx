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
const SignupButton = styled.button`
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
interface SignupProps {
  onSignupSuccess: () => void;
}

const Signup: React.FC<SignupProps> = ({ onSignupSuccess }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignup = () => {
    console.log('회원가입 시도:', { username, email, password });
    if (!isFormValid) return;
    onSignupSuccess();
  };

  const isFormValid = username.length > 0 && email.length > 0 && password.length > 0;

  return (
    <Container>
      <Title>회원가입</Title>
      <InputWrapper>
        <Icon>👤</Icon>
        <StyledInput
          placeholder="이력서에 기입한 이름을 입력해주세요."
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </InputWrapper>
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
      <SignupButton onClick={handleSignup} disabled={!isFormValid}>
        회원가입
      </SignupButton>
    </Container>
  );
};

export default Signup;
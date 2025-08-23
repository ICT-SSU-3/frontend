import styled from 'styled-components';

interface ButtonProps { primary?: boolean; }

export const StyledButton = styled.button<ButtonProps>`
  font-family: 'Pretendard', sans-serif;
  padding: 10px 20px;
  width: 100%;
  min-width: 140px;
  font-size: 14px;
  font-weight: bold;
  border-radius: 10px;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s;
  background-color: ${(p) => (p.primary ? 'black' : '#fff')};
  color: ${(p) => (p.primary ? '#fff' : '#000')};
  border: ${(p) => (p.primary ? 'none' : '1px solid #ddd')};
  &:disabled { opacity: .5; cursor: not-allowed; }
`;

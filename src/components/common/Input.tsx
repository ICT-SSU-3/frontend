import styled from 'styled-components';

export const InputWrapper = styled.div`
  background-color: #f7f7f7;
  border-radius: 8px;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
`;

export const StyledInput = styled.input`
  border: none;
  background: transparent;
  width: 100%;
  font-size: 16px;
  outline: none;
  &::placeholder { color: #999; }
`;

export const StyledTextarea = styled.textarea`
  font-family: 'Pretendard', sans-serif;
  border: none;
  background: transparent;
  width: 100%;
  font-size: 16px;
  line-height: 1.5;
  outline: none;
  resize: none;
  overflow-y: auto;
  white-space: pre-wrap;
  word-break: break-word;
  max-height: 120px;
  &::placeholder { color: #999; }
`;

export const Icon = styled.span`
  color: #999;
  font-size: 20px;
`;

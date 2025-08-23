import React from 'react';
import styled from 'styled-components';

const ModalOverlay = styled.div`
  position: fixed; inset: 0;
  background: rgba(0, 0, 0, 0.25); /* 25% */
  display: flex; justify-content: center; align-items: center;
`;
const ModalContent = styled.div`
  background: #fff; border-radius: 12px; padding: 30px;
  width: 90%; max-width: 500px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
`;

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;
  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        {children}
      </ModalContent>
    </ModalOverlay>
  );
};

export default Modal;

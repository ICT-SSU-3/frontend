import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { createGlobalStyle } from 'styled-components';
import MainRoute from './routes/MainRoute';
import LoginRoute from './routes/LoginRoute';
import SignupRoute from './routes/SignupRoute';
import ChatRoute from './routes/ChatRoute';
import Leaderboard from './components/views/Leaderboard';

const GlobalStyle = createGlobalStyle`
  html, body, #root { height: 100%; }
  body {
    font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
                 'Noto Sans KR','Apple SD Gothic Neo','Malgun Gothic', Arial, sans-serif;
    margin: 0;
    padding: 0;
    overflow: hidden;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background-color: #ffffffff;
    color: #333;
  }
  * { box-sizing: border-box; }
  input, textarea, button, select { font-family: inherit; }
`;

export default function App() {
  return (
    <>
      <GlobalStyle />
      <Routes>
        <Route path="/" element={<MainRoute />} />
        <Route path="/login" element={<LoginRoute />} />
        <Route path="/signup" element={<SignupRoute />} />
        <Route path="/chat" element={<ChatRoute />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

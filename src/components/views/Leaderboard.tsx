// src/pages/Leaderboard.tsx
import React, { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { useLocation, useSearchParams } from 'react-router-dom';
import { InterviewAPI } from '../../api';
import type { FinevalResponse } from '../../api/fineval';

/* -------------------------- styles -------------------------- */
const ModalOverlay = styled.div`
  position: fixed; inset: 0; background: rgba(0,0,0,.5);
  display: flex; justify-content: center; align-items: center; z-index: 1000;
`;
const ModalContent = styled.div`
  background: #fff; padding: 28px; border-radius: 12px;
  max-width: 900px; width: 90%; max-height: 80vh; overflow-y: auto;
  text-align: left; line-height: 1.6; white-space: pre-wrap;
`;
const Container = styled.div`
  padding: 40px; background: #fff; text-align: center;
  width: 90%; max-width: 820px; margin: 40px auto;
  box-shadow: 0 4px 10px rgba(0,0,0,.08); border-radius: 12px;
  font-family: 'Pretendard', sans-serif;
`;
const Title = styled.h2` font-size: 24px; font-weight: 700; margin: 0 0 24px; `;
const HeaderInfo = styled.div` font-size: 15px; color: #555; margin-bottom: 20px; `;
const ScrollArea = styled.div` max-height: 460px; overflow-y: auto; padding-right: 8px; `;
const Row = styled.div`
  display: grid; grid-template-columns: 1fr 100px 180px; gap: 12px;
  align-items: stretch; margin-bottom: 12px;
`;
const Pill = styled.button`
  width: 100%; background: #f3f4f6; border: 1px solid #e5e7eb; border-radius: 10px;
  padding: 12px 14px; text-align: left; cursor: pointer;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  &:hover { background: #eef2ff; border-color: #c7d2fe; }
`;
const Box = styled.div`
  background: #f3f4f6; border: 1px solid #e5e7eb; border-radius: 10px;
  display: flex; align-items: center; justify-content: center; padding: 12px 14px;
`;
const Mono = styled.pre`
  font-size: 12px; text-align: left; background: #f8fafc; border: 1px dashed #cbd5e1;
  padding: 10px; border-radius: 8px; color: #334155; max-height: 220px; overflow: auto;
`;
const Section = styled.div` margin-bottom: 18px; `;
const ScoreRow = styled.div`
  display: grid; grid-template-columns: 110px 1fr; gap: 12px;
  padding: 6px 0; border-bottom: 1px dashed #e5e7eb;
`;

/* ----------------------- helpers ----------------------- */
function parseEval(maybeString: any): any | null {
  if (!maybeString) return null;
  if (typeof maybeString === 'object') return maybeString;
  if (typeof maybeString === 'string') {
    try {
      return JSON.parse(maybeString);
    } catch {
      return null;
    }
  }
  return null;
}

function firstLine(text?: string | null): string {
  if (!text) return '';
  const idx = text.indexOf('\n');
  return idx === -1 ? text : text.slice(0, idx);
}

/* ------------------------- component ------------------------ */
type LBState = (FinevalResponse & { companyName?: string; jobTitle?: string }) | undefined;

const Leaderboard: React.FC = () => {
  const { state } = useLocation() as { state: LBState };
  const [search] = useSearchParams();

  const [data, setData] = useState<FinevalResponse | null>(state ?? null);
  const [error, setError] = useState<string | null>(null);
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  // URL 직접 접근: /leaderboard?session_id=56
  useEffect(() => {
    if (data) return;
    const sid = search.get('session_id');
    if (!sid) return;
    (async () => {
      try {
        const res = await InterviewAPI.fineval({ session_id: Number(sid) });
        setData(res);
      } catch (e: any) {
        setError(String(e?.message || e));
      }
    })();
  }, [data, search]);

  const companyName = (state as any)?.companyName ?? data?.session.company_name ?? '';
  const jobTitle = (state as any)?.jobTitle ?? data?.session.jd_name ?? '';

  // rows: evaluation_content(문자열) → JSON 파싱한 parsedEval 포함
  const rows = useMemo(() => {
    if (!data?.results) return [];
    return data.results.map(r => {
      const parsedEval = parseEval(r.evaluation_content);
      return {
        question: r.question_content ?? '(질문 없음)',
        answer: r.answer_content ?? '',
        parsedEval, // { final_score, final_report, evaluations: { ... } } | null
        reportFirstLine: firstLine(parsedEval?.final_report),
      };
    });
  }, [data]);

  return (
    <Container>
      <Title>리더보드</Title>

      <HeaderInfo>
        <div>🏢 {companyName} / {jobTitle}</div>
        <div>🙍 {data?.session.user_name}</div>
        {data?.counts && (
          <div style={{ marginTop: 6, color: '#6b7280' }}>
            {data.counts.answered}/{data.counts.total_questions} 답변 완료
          </div>
        )}
        {error && <div style={{ marginTop: 8, color: '#b91c1c' }}>{error}</div>}
      </HeaderInfo>

      {!rows.length ? (
        <div style={{ color: '#9ca3af' }}>표시할 결과가 없습니다.</div>
      ) : (
        <ScrollArea>
          {rows.map((r, idx) => (
            <React.Fragment key={idx}>
              <Row>
                {/* 질문 1줄 */}
                <Pill onClick={() => setOpenIdx(idx)} title={r.question}>
                  <b>Q{idx + 1}.</b>&nbsp;{r.question}
                </Pill>

                {/* 최종 점수 */}
                <Box title="최종 점수">
                  {r.parsedEval?.final_score ?? '-'}점
                </Box>

                {/* 리포트 첫 줄 요약 (없으면 버튼 라벨로 대체) */}
                <Pill onClick={() => setOpenIdx(idx)} title="상세 보기">
                  {r.reportFirstLine || '전체 평가/답변 보기'}
                </Pill>
              </Row>

              {openIdx === idx && (
                <ModalOverlay onClick={() => setOpenIdx(null)}>
                  <ModalContent onClick={(e) => e.stopPropagation()}>
                    <h3 style={{ marginTop: 0 }}>
                      Q{idx + 1}. {r.question}
                    </h3>

                    <Section>
                      <h4>🗣️ 내 답변</h4>
                      <div>{r.answer || '(답변 없음)'}</div>
                    </Section>

                    <Section>
                      <h4>📊 세부 평가</h4>
                      {r.parsedEval?.evaluations ? (
                        <>
                          <ScoreRow>
                            <div>STAR</div>
                            <div>
                              {r.parsedEval.evaluations.star_evaluation?.score}점 — {r.parsedEval.evaluations.star_evaluation?.evaluation}
                            </div>
                          </ScoreRow>
                          <ScoreRow>
                            <div>논리성</div>
                            <div>
                              {r.parsedEval.evaluations.logic_evaluation?.score}점 — {r.parsedEval.evaluations.logic_evaluation?.evaluation}
                            </div>
                          </ScoreRow>
                          <ScoreRow>
                            <div>JD</div>
                            <div>
                              {r.parsedEval.evaluations.jd_evaluation?.score}점 — {r.parsedEval.evaluations.jd_evaluation?.evaluation}
                            </div>
                          </ScoreRow>
                          <ScoreRow>
                            <div>발화시간</div>
                            <div>
                              {r.parsedEval.evaluations.timing_evaluation?.score}점 — {r.parsedEval.evaluations.timing_evaluation?.evaluation}
                            </div>
                          </ScoreRow>
                        </>
                      ) : (
                        <div>세부 평가 없음</div>
                      )}
                    </Section>

                    <Section>
                      <h4>📝 종합 피드백</h4>
                      <div>{r.parsedEval?.final_report || '(없음)'}</div>
                    </Section>
                  </ModalContent>
                </ModalOverlay>
              )}
            </React.Fragment>
          ))}
        </ScrollArea>
      )}

      {/* 디버그 원본 */}
      <div style={{ marginTop: 20, textAlign: 'left' }}>
        <h4 style={{ margin: '10px 0' }}>Raw fineval (debug)</h4>
        <Mono>{JSON.stringify(data, null, 2)}</Mono>
      </div>
    </Container>
  );
};

export default Leaderboard;

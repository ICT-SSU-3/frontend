import React, { useMemo, useState } from 'react';
import styled from 'styled-components';
import { useLocation } from 'react-router-dom';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.2);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color: #fff;
  padding: 30px;
  border-radius: 10px;
  width: 85%;
  max-height: 80%;
  overflow-y: auto;
  line-height: 1.6;
  text-align: left;
  white-space: pre-wrap;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
`;
const Container = styled.div`
  padding: 40px;
  background-color: #ffffff;
  text-align: center;
  width: 90%;
  max-width: 750px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  border-radius: 10px;
  font-family: 'Pretendard', sans-serif; /* 폰트 유지 */
`;
const Header = styled.div`text-align:center; margin-bottom:24px;`;
const Title = styled.h2`margin:0 0 8px; font-size:24px; font-weight:800;`;
const HeaderInfo = styled.div`font-size:15px; color:#555;`;
const ScrollArea = styled.div`max-height:480px; overflow:auto; padding-right:8px;`;

const ListItem = styled.div`
  display:grid; grid-template-columns: 1fr 90px 260px; gap:12px;
  align-items:start; margin-bottom:12px;
`;
const Pill = styled.div`
  background:#f5f7fb; border:1px solid #e5e7eb; border-radius:12px; padding:12px 14px;
`;
const QuestionPill = styled(Pill)`height:50px; overflow:auto; text-align:left;`;
const ScorePill = styled(Pill)`text-align:center;`;
const FeedbackButton = styled(Pill)`
  cursor:pointer;
  white-space:nowrap;
  overflow:hidden;
  text-overflow:ellipsis;
  text-align:center; /* 이 부분을 center로 수정 */
  display: flex; /* Flexbox 활성화 */
  justify-content: center; /* 가로 중앙 정렬 */
  align-items: center; /* 세로 중앙 정렬 */
  &:hover{ background:#eef2ff; border-color:#dbeafe; }
`;
const H = styled.h3`margin:20px 0 10px; font-size:20px; font-weight:800;`;
const SubH = styled.h4`margin:14px 0 10px; font-size:16px; font-weight:800; display:flex; gap:8px; align-items:center;`;

const Row = styled.div`
  display:grid; grid-template-columns: 100px 1fr; gap:16px; padding:12px 0;
  border-top:1px solid #eef2f7;
  &:first-of-type{ border-top:none; }
`;
const Label = styled.div`color:#374151; font-weight:700;`;
const SmallMono = styled.pre`
  font-size:12px; text-align:left; background:#f8fafc; border:1px dashed #cbd5e1;
  padding:10px; border-radius:8px; color:#334155; max-height:220px; overflow:auto;
`;


type ResultItem = {
  question_id: number;
  question_content: string;
  answer_content: string | null;
  evaluation_content: any; 
};
type FinevalState = {
  session?: { session_id: number; user_name: string; company_name: string; jd_name: string; created_at: string; };
  results?: ResultItem[];
  counts?: { total_questions: number; answered: number };
  companyName?: string;
  jobTitle?: string;
  error?: string;
  note?: string;
};


const normalize = (s: string) => s.replace(/\r/g, '').replace(/\n{3,}/g, '\n\n').trim();
const parseEval = (v: any) => {
  if (!v) return null;
  if (typeof v === 'object') return v;
  if (typeof v === 'string') { try { return JSON.parse(v); } catch { return null; } }
  return null;
};

function firstLine(s?: string) {
  if (!s) return '';
  const i = s.indexOf('\n');
  return (i === -1 ? s : s.slice(0, i)).trim();
}

// final_report splitter
// ✅ REPLACE ONLY THIS FUNCTION
// final_report splitter — 오직 "## 점수 요약" / "## 종합 피드백" 두 섹션만 파싱
function splitReportSections(report: string) {
  const text = normalize(report || "");

  // 헤더 라인 (정확히 H2 형식만 처리)
  const SCORE_H = /^##\s*점수\s*요약\s*$/gmi;
  const FEED_H  = /^##\s*종합\s*피드백\s*$/gmi;

  // 모든 헤더 위치 수집
  type Hit = { key: "score" | "feedback"; start: number; end: number };
  const hits: Hit[] = [];

  let m: RegExpExecArray | null;
  while ((m = SCORE_H.exec(text)) !== null) {
    hits.push({ key: "score", start: m.index, end: m.index + m[0].length });
  }
  while ((m = FEED_H.exec(text)) !== null) {
    hits.push({ key: "feedback", start: m.index, end: m.index + m[0].length });
  }

  // 시작 위치 기준 정렬
  hits.sort((a, b) => a.start - b.start);

  const bodyBetween = (from: number, to?: number) => {
    const s = from;
    const e = Number.isFinite(to as number) ? (to as number) : text.length;
    return normalize(text.slice(s, e).replace(/^\r?\n/, "")); // 헤더 바로 다음 개행 제거
  };

  let score = "";
  let feedback = "";

  for (let i = 0; i < hits.length; i++) {
    const cur = hits[i];
    const next = hits[i + 1];
    const body = bodyBetween(cur.end, next?.start);
    if (cur.key === "score") score = body;
    else if (cur.key === "feedback") feedback = body;
  }

  // 외부 로직 호환용: 액션은 사용 안 함(빈 값 반환)
  const actions = "";
  const ACTIONS = /$^/i; // 어떤 것도 매치되지 않게

  return { score, feedback, actions, ACTIONS };
}


const Leaderboard: React.FC = () => {
  const { state } = useLocation() as { state?: FinevalState };

  const company = state?.companyName ?? state?.session?.company_name ?? '';
  const role = state?.jobTitle ?? state?.session?.jd_name ?? '';

  const rows = useMemo(() => {
    const list = state?.results ?? [];
    return list.map((r, idx) => {
      const parsed = parseEval(r.evaluation_content);
      const finalReport: string = parsed?.final_report ?? '';
      const { score, feedback, actions, ACTIONS } = splitReportSections(finalReport);

      // 액션 헤더 자동 보강
      const actionsTitled =
        actions
          ? (new RegExp(ACTIONS, 'i').test(actions) ? actions : `<다음 면접 대비 핵심 개선 액션>\n${actions}`)
          : '';

      return {
        idx: idx + 1,
        question: r.question_content ?? '',
        answer: parsed?.answer ?? r.answer_content ?? '',
        time: parsed?.time_in_seconds ?? null,
        finals: {
          scoreSection: score,
          feedbackSection: feedback,
          actionsSection: actionsTitled,
          summaryLine: firstLine(feedback || score) || '(요약 없음)',
          finalScore: parsed?.final_score ?? null,
        },
        breakdown: {
          star: parsed?.evaluations?.star_evaluation ?? null,
          logic: parsed?.evaluations?.logic_evaluation ?? null,
          jd: parsed?.evaluations?.jd_evaluation ?? null,
          timing: parsed?.evaluations?.timing_evaluation ?? null,
        },
      };
    });
  }, [state?.results]);


  const [selected, setSelected] = useState<(typeof rows)[number] | null>(null);

  return (
    <Container>
      <Header>
        <Title>리더보드</Title>
        <HeaderInfo>🏢 {company} / {role}</HeaderInfo>
        {(state?.error || state?.note) && (
          <div style={{ marginTop: 8, color: state?.error ? '#b91c1c' : '#4b5563' }}>
            {state?.error ?? state?.note}
          </div>
        )}
      </Header>

      {rows.length === 0 ? (
        <div style={{ color:'#9ca3af' }}>표시할 인터뷰 로그가 없습니다.</div>
      ) : (
        <ScrollArea>
          {rows.map((r) => (
            <ListItem key={r.idx}>
              <QuestionPill><b>Q{r.idx}. </b>{r.question}</QuestionPill>
              <ScorePill>{r.finals.finalScore ?? '-'}점</ScorePill>
              <FeedbackButton onClick={() => setSelected(r)} title="클릭해서 전체 보기">
                세부평가 확인하기🫵
              </FeedbackButton>
            </ListItem>
          ))}
        </ScrollArea>
      )}


      {selected && (
        <ModalOverlay onClick={() => setSelected(null)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            {/* Q. 질문 */}
            <H>Q{selected.idx}. {selected.question}</H>

            {/* 내 답변 */}
            {selected.answer && (
              <>
                <SubH>🗣️ 내 답변</SubH>
                <div>{selected.answer}</div>
              </>
            )}

            {/* 세부 평가 */}
            {(selected.breakdown.star || selected.breakdown.logic || selected.breakdown.jd || selected.breakdown.timing) && (
              <>
                <SubH>📚 세부 평가</SubH>
                {selected.breakdown.star && (
                  <Row><Label>STAR</Label>
                    <div>
                      {selected.breakdown.star.score != null && <b>{selected.breakdown.star.score}점 — </b>}
                      {selected.breakdown.star.evaluation}
                    </div>
                  </Row>
                )}
                {selected.breakdown.logic && (
                  <Row><Label>논리성</Label>
                    <div>
                      {selected.breakdown.logic.score != null && <b>{selected.breakdown.logic.score}점 — </b>}
                      {selected.breakdown.logic.evaluation}
                    </div>
                  </Row>
                )}
                {selected.breakdown.jd && (
                  <Row><Label>JD</Label>
                    <div>
                      {selected.breakdown.jd.score != null && <b>{selected.breakdown.jd.score}점 — </b>}
                      {selected.breakdown.jd.evaluation}
                    </div>
                  </Row>
                )}
                {selected.breakdown.timing && (
                  <Row><Label>발화시간</Label>
                    <div>
                      {selected.breakdown.timing.score != null && <b>{selected.breakdown.timing.score}점 — </b>}
                      {selected.breakdown.timing.evaluation}
                    </div>
                  </Row>
                )}
              </>
            )}

            {/* 종합 피드백 / 점수 요약 */}
            {(selected.finals.scoreSection || selected.finals.feedbackSection) && (
              <>
                <SubH>🧾 종합 피드백</SubH>
                {selected.finals.scoreSection && (<div>{`<점수 요약>\n${selected.finals.scoreSection}`}</div>)}
                {selected.finals.feedbackSection && (<div style={{ marginTop:12 }}>{`<종합 피드백>\n${selected.finals.feedbackSection}`}</div>)}
              </>
            )}

            {/* 핵심 개선 액션 */}
            {selected.finals.actionsSection && (
              <>
                <SubH>🛠️ 다음 면접 대비 핵심 개선 액션</SubH>
                <div>{selected.finals.actionsSection}</div>
              </>
            )}
          </ModalContent>
        </ModalOverlay>
      )}
    </Container>
  );
};

export default Leaderboard;
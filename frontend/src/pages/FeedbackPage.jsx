import { useLocation, useNavigate } from "react-router-dom";

const scoreColor = (score) => {
  if (score >= 8) return "var(--accent-green)";
  if (score >= 5) return "var(--accent-orange)";
  return "var(--accent-red)";
};

const scoreBg = (score) => {
  if (score >= 8) return "rgba(16,185,129,0.1)";
  if (score >= 5) return "rgba(245,158,11,0.1)";
  return "rgba(239,68,68,0.1)";
};

const recommendationColor = (rec = "") => {
  if (rec.toLowerCase().includes("strong hire")) return "var(--accent-green)";
  if (rec.toLowerCase().includes("hire")) return "var(--accent-blue)";
  return "var(--accent-red)";
};

export default function FeedbackPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { feedback } = location.state || {};

  if (!feedback) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <p style={{ color: "var(--text-secondary)", marginBottom: 20 }}>No feedback data found.</p>
          <button className="btn-primary" onClick={() => navigate("/upload")}>Start New Interview</button>
        </div>
      </div>
    );
  }

  const { per_question_feedback = [], final_report = {} } = feedback;
  const overallScore = final_report.overall_score ?? 0;

  return (
    <div style={{ minHeight: "100vh" }}>
      {/* Nav */}
      <nav style={{
        padding: "20px 60px", borderBottom: "1px solid var(--border)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: "rgba(10,10,15,0.9)", backdropFilter: "blur(20px)",
        position: "sticky", top: 0, zIndex: 100
      }}>
        <span style={{ fontWeight: 600 }}>🎤 AI Interview Copilot</span>
        <button className="btn-primary" style={{ padding: "8px 20px", fontSize: 14 }}
          onClick={() => navigate("/upload")}>
          Practice Again →
        </button>
      </nav>

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "48px 20px" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <h1 style={{ fontSize: 36, fontWeight: 700, marginBottom: 12 }}>
            Your <span className="gradient-text">Interview Report</span>
          </h1>
          <p style={{ color: "var(--text-secondary)" }}>
            AI-generated feedback based on your answers and resume.
          </p>
        </div>

        {/* Overall Score + Recommendation */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 20, marginBottom: 32 }}>
          {/* Score Circle */}
          <div className="glass-card" style={{
            padding: "36px 24px", textAlign: "center",
            background: scoreBg(overallScore)
          }}>
            <div style={{
              fontSize: 56, fontWeight: 800, lineHeight: 1,
              color: scoreColor(overallScore)
            }}>
              {overallScore}<span style={{ fontSize: 24, fontWeight: 400 }}>/10</span>
            </div>
            <p style={{ color: "var(--text-secondary)", marginTop: 12, fontSize: 14 }}>Overall Score</p>
          </div>

          {/* Recommendation */}
          <div className="glass-card" style={{ padding: "28px" }}>
            <p style={{ color: "var(--text-muted)", fontSize: 12, letterSpacing: 1.5,
              textTransform: "uppercase", marginBottom: 12 }}>Hiring Recommendation</p>
            <div style={{
              fontSize: 22, fontWeight: 700, marginBottom: 16,
              color: recommendationColor(final_report.recommendation)
            }}>
              {final_report.recommendation || "—"}
            </div>
            {final_report.overall_summary && (
              <p style={{ color: "var(--text-secondary)", fontSize: 14, lineHeight: 1.7 }}>
                {final_report.overall_summary}
              </p>
            )}
          </div>
        </div>

        {/* Strengths + Improvements */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 32 }}>
          <div className="glass-card" style={{ padding: "28px" }}>
            <h3 style={{ fontWeight: 600, marginBottom: 16, color: "var(--accent-green)" }}>
              ✅ Top Strengths
            </h3>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 10 }}>
              {(final_report.top_strengths || []).map((s, i) => (
                <li key={i} style={{
                  padding: "10px 14px", background: "rgba(16,185,129,0.08)",
                  borderRadius: "var(--radius-sm)", fontSize: 14, lineHeight: 1.5,
                  borderLeft: "3px solid var(--accent-green)"
                }}>{s}</li>
              ))}
            </ul>
          </div>
          <div className="glass-card" style={{ padding: "28px" }}>
            <h3 style={{ fontWeight: 600, marginBottom: 16, color: "var(--accent-orange)" }}>
              📈 Improvement Areas
            </h3>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 10 }}>
              {(final_report.top_improvements || []).map((s, i) => (
                <li key={i} style={{
                  padding: "10px 14px", background: "rgba(245,158,11,0.08)",
                  borderRadius: "var(--radius-sm)", fontSize: 14, lineHeight: 1.5,
                  borderLeft: "3px solid var(--accent-orange)"
                }}>{s}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Skills Gap */}
        {final_report.skills_gap && (
          <div className="glass-card" style={{ padding: "28px", marginBottom: 32 }}>
            <h3 style={{ fontWeight: 600, marginBottom: 16 }}>🔍 Skills Gap Analysis</h3>
            <p style={{ color: "var(--text-secondary)", fontSize: 14, lineHeight: 1.7 }}>
              {final_report.skills_gap}
            </p>
          </div>
        )}

        {/* Per-Question Feedback */}
        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 20 }}>
          Question-by-Question Breakdown
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 48 }}>
          {per_question_feedback.map((item, i) => (
            <div key={i} className="glass-card" style={{ padding: "28px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                <span className="badge badge-purple">Q{i + 1}</span>
                <div style={{
                  fontSize: 22, fontWeight: 700, color: scoreColor(item.score),
                  background: scoreBg(item.score),
                  padding: "4px 14px", borderRadius: "var(--radius-sm)"
                }}>
                  {item.score}/10
                </div>
              </div>

              <p style={{ fontWeight: 500, fontSize: 15, marginBottom: 12, lineHeight: 1.6 }}>
                {item.question}
              </p>

              <div style={{
                padding: "12px 14px", background: "var(--bg-secondary)",
                borderRadius: "var(--radius-sm)", marginBottom: 16,
                borderLeft: "3px solid var(--border)"
              }}>
                <p style={{ color: "var(--text-muted)", fontSize: 11, marginBottom: 6, letterSpacing: 1 }}>
                  YOUR ANSWER
                </p>
                <p style={{ color: "var(--text-secondary)", fontSize: 14, lineHeight: 1.6 }}>
                  {item.answer || "—"}
                </p>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {item.strengths && (
                  <div style={{ padding: "12px", background: "rgba(16,185,129,0.08)",
                    borderRadius: "var(--radius-sm)", borderLeft: "3px solid var(--accent-green)" }}>
                    <p style={{ color: "var(--accent-green)", fontSize: 11, letterSpacing: 1, marginBottom: 6 }}>
                      STRENGTHS
                    </p>
                    <p style={{ fontSize: 13, lineHeight: 1.6, color: "var(--text-secondary)" }}>
                      {item.strengths}
                    </p>
                  </div>
                )}
                {item.missing && (
                  <div style={{ padding: "12px", background: "rgba(245,158,11,0.08)",
                    borderRadius: "var(--radius-sm)", borderLeft: "3px solid var(--accent-orange)" }}>
                    <p style={{ color: "var(--accent-orange)", fontSize: 11, letterSpacing: 1, marginBottom: 6 }}>
                      WHAT WAS MISSING
                    </p>
                    <p style={{ fontSize: 13, lineHeight: 1.6, color: "var(--text-secondary)" }}>
                      {item.missing}
                    </p>
                  </div>
                )}
              </div>

              {item.ideal_answer && (
                <div style={{
                  marginTop: 12, padding: "12px 14px",
                  background: "rgba(59,130,246,0.08)",
                  borderRadius: "var(--radius-sm)", borderLeft: "3px solid var(--accent-blue)"
                }}>
                  <p style={{ color: "var(--accent-blue)", fontSize: 11, letterSpacing: 1, marginBottom: 6 }}>
                    IDEAL ANSWER OUTLINE
                  </p>
                  <p style={{ fontSize: 13, lineHeight: 1.7, color: "var(--text-secondary)" }}>
                    {item.ideal_answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Final CTA */}
        <div style={{ textAlign: "center" }}>
          <button className="btn-primary" style={{ fontSize: 16, padding: "14px 36px" }}
            onClick={() => navigate("/upload")}>
            Practice Again →
          </button>
        </div>
      </div>
    </div>
  );
}


import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { uploadResume, generateQuestions } from "../services/api";

export default function UploadPage() {
  const navigate = useNavigate();
  const fileRef = useRef();
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [numQuestions, setNumQuestions] = useState(5);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) setFile(dropped);
  };

  const handleSubmit = async () => {
    if (!file) { setError("Please select a resume file."); return; }
    setError("");
    setLoading(true);
    try {
      setStatus("📄 Parsing and indexing your resume...");
      const uploadRes = await uploadResume(file, jobDescription);
      const sessionId = uploadRes.session_id;

      setStatus("🧠 Generating tailored interview questions...");
      const questionsRes = await generateQuestions(sessionId, numQuestions);

      navigate("/interview", {
        state: { sessionId, questions: questionsRes.questions }
      });
    } catch (err) {
      setError(err?.response?.data?.detail || "Something went wrong. Is the backend running?");
    } finally {
      setLoading(false);
      setStatus("");
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Nav */}
      <nav style={{
        padding: "20px 60px", borderBottom: "1px solid var(--border)",
        display: "flex", alignItems: "center", gap: 12,
        background: "rgba(10,10,15,0.8)", backdropFilter: "blur(20px)"
      }}>
        <span style={{ fontSize: 20, cursor: "pointer" }} onClick={() => navigate("/")}>🎤</span>
        <span style={{ fontWeight: 600, cursor: "pointer" }} onClick={() => navigate("/")}>
          AI Interview Copilot
        </span>
        <span style={{ color: "var(--text-muted)", margin: "0 8px" }}>›</span>
        <span style={{ color: "var(--text-secondary)" }}>Upload Resume</span>
      </nav>

      <div style={{
        flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
        padding: "40px 20px"
      }}>
        <div style={{ width: "100%", maxWidth: 680 }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <div className="badge badge-purple" style={{ marginBottom: 16, display: "inline-flex" }}>
              Step 1 of 2
            </div>
            <h1 style={{ fontSize: 36, fontWeight: 700, marginBottom: 12 }}>
              Upload Your <span className="gradient-text">Resume</span>
            </h1>
            <p style={{ color: "var(--text-secondary)", fontSize: 16 }}>
              We'll use it to generate questions tailored to your actual experience.
            </p>
          </div>

          {/* Drop Zone */}
          <div
            className="glass-card"
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current.click()}
            style={{
              padding: "48px 32px", textAlign: "center", cursor: "pointer",
              borderColor: dragging ? "var(--accent-purple)" : file ? "var(--accent-green)" : undefined,
              borderStyle: "dashed", marginBottom: 24,
              transition: "all 0.3s ease"
            }}
          >
            <input ref={fileRef} type="file" accept=".pdf,.docx" style={{ display: "none" }}
              onChange={(e) => setFile(e.target.files[0])} />
            {file ? (
              <>
                <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
                <p style={{ fontWeight: 600, fontSize: 16, marginBottom: 4 }}>{file.name}</p>
                <p style={{ color: "var(--text-muted)", fontSize: 13 }}>
                  {(file.size / 1024).toFixed(1)} KB · Click to change
                </p>
              </>
            ) : (
              <>
                <div style={{ fontSize: 40, marginBottom: 12 }}>📄</div>
                <p style={{ fontWeight: 600, fontSize: 16, marginBottom: 8 }}>
                  Drop your resume here
                </p>
                <p style={{ color: "var(--text-muted)", fontSize: 14 }}>
                  PDF or DOCX · Click to browse
                </p>
              </>
            )}
          </div>

          {/* Job Description */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: "block", fontWeight: 600, marginBottom: 10, fontSize: 15 }}>
              Job Description <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>(optional)</span>
            </label>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the job description here to get more targeted questions..."
              rows={5}
              style={{
                width: "100%", padding: "14px 16px",
                background: "var(--bg-glass)", border: "1px solid var(--border)",
                borderRadius: "var(--radius-md)", color: "var(--text-primary)",
                fontSize: 14, resize: "vertical", fontFamily: "Inter, sans-serif",
                outline: "none", transition: "border-color 0.2s",
                boxSizing: "border-box"
              }}
              onFocus={(e) => e.target.style.borderColor = "var(--accent-purple)"}
              onBlur={(e) => e.target.style.borderColor = "var(--border)"}
            />
          </div>

          {/* Number of Questions */}
          <div style={{ marginBottom: 32 }}>
            <label style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
              <span style={{ fontWeight: 600, fontSize: 15 }}>Number of Questions</span>
              <span className="badge badge-purple">{numQuestions} questions</span>
            </label>
            <input type="range" min={3} max={10} value={numQuestions}
              onChange={(e) => setNumQuestions(Number(e.target.value))}
              style={{ width: "100%", accentColor: "var(--accent-purple)" }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12,
              color: "var(--text-muted)", marginTop: 6 }}>
              <span>3 (Quick)</span><span>10 (Thorough)</span>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div style={{
              padding: "12px 16px", background: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.3)", borderRadius: "var(--radius-md)",
              color: "var(--accent-red)", fontSize: 14, marginBottom: 20
            }}>
              ⚠️ {error}
            </div>
          )}

          {/* Status */}
          {status && (
            <div style={{
              padding: "12px 16px", background: "rgba(124,58,237,0.1)",
              border: "1px solid rgba(124,58,237,0.3)", borderRadius: "var(--radius-md)",
              color: "var(--accent-purple-light)", fontSize: 14, marginBottom: 20,
              display: "flex", alignItems: "center", gap: 10
            }}>
              <div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
              {status}
            </div>
          )}

          <button className="btn-primary" disabled={loading || !file}
            onClick={handleSubmit}
            style={{ width: "100%", justifyContent: "center", padding: "16px", fontSize: 16 }}>
            {loading ? (
              <><div className="spinner" /> Processing...</>
            ) : (
              "Generate Interview Questions →"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
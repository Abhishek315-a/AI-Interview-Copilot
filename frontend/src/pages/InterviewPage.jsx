import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { submitAnswer, evaluateAnswers, transcribeAudio, getQuestionAudioUrl } from "../services/api";

export default function InterviewPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { sessionId, questions = [] } = location.state || {};

  const [currentIndex, setCurrentIndex] = useState(0);
  const [mode, setMode] = useState("text"); // "text" | "voice"
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [status, setStatus] = useState("");

  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  useEffect(() => {
    if (!sessionId || questions.length === 0) navigate("/upload");
  }, []);

  const currentQuestion = questions[currentIndex] || "";
  const progress = ((currentIndex) / questions.length) * 100;

  const playQuestionAudio = () => {
    const url = getQuestionAudioUrl(sessionId, currentIndex);
    const audio = new Audio(url);
    audio.play();
  };

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    chunksRef.current = [];
    recorder.ondataavailable = (e) => chunksRef.current.push(e.data);
    recorder.onstop = async () => {
      const blob = new Blob(chunksRef.current, { type: "audio/webm" });
      stream.getTracks().forEach(t => t.stop());
      setStatus("🔄 Transcribing your answer...");
      try {
        const res = await transcribeAudio(sessionId, blob);
        setTranscript(res.transcript);
        setAnswer(res.transcript);
      } catch {
        setStatus("❌ Transcription failed. Please type your answer.");
      } finally { setStatus(""); }
    };
    mediaRecorderRef.current = recorder;
    recorder.start();
    setRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  };

  const handleSubmit = async () => {
    const finalAnswer = answer.trim();
    if (!finalAnswer) return;
    setLoading(true);
    try {
      const res = await submitAnswer(sessionId, currentIndex, currentQuestion, finalAnswer);
      if (res.is_interview_complete) {
        setStatus("🧠 Evaluating your answers...");
        const feedback = await evaluateAnswers(sessionId);
        navigate("/feedback", { state: { sessionId, feedback } });
      } else {
        setCurrentIndex(res.next_question_index);
        setAnswer("");
        setTranscript("");
      }
    } catch (err) {
      setStatus("❌ Error submitting answer. Try again.");
    } finally {
      setLoading(false);
      if (!status.startsWith("🧠")) setStatus("");
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Nav */}
      <nav style={{
        padding: "16px 40px", borderBottom: "1px solid var(--border)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: "rgba(10,10,15,0.9)", backdropFilter: "blur(20px)",
        position: "sticky", top: 0, zIndex: 100
      }}>
        <span style={{ fontWeight: 600 }}>🎤 AI Interview Copilot</span>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ color: "var(--text-muted)", fontSize: 14 }}>
            Question {currentIndex + 1} of {questions.length}
          </span>
          <div style={{ width: 120, height: 4, background: "var(--border)", borderRadius: 2 }}>
            <div style={{
              height: "100%", borderRadius: 2, transition: "width 0.4s ease",
              width: `${((currentIndex + 1) / questions.length) * 100}%`,
              background: "var(--gradient-primary)"
            }} />
          </div>
        </div>
      </nav>

      <div style={{
        flex: 1, display: "flex", alignItems: "flex-start", justifyContent: "center",
        padding: "48px 20px"
      }}>
        <div style={{ width: "100%", maxWidth: 720 }}>

          {/* Question Card */}
          <div className="glass-card" style={{ padding: "36px", marginBottom: 28 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <span className="badge badge-purple">Question {currentIndex + 1}</span>
              <button onClick={playQuestionAudio} style={{
                background: "none", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)",
                color: "var(--text-secondary)", padding: "6px 14px", cursor: "pointer", fontSize: 13,
                display: "flex", alignItems: "center", gap: 6
              }}>
                🔊 Play Audio
              </button>
            </div>
            <p style={{ fontSize: 20, fontWeight: 500, lineHeight: 1.65, color: "var(--text-primary)" }}>
              {currentQuestion}
            </p>
          </div>

          {/* Mode Toggle */}
          <div style={{
            display: "flex", gap: 8, marginBottom: 24,
            background: "var(--bg-secondary)", padding: 4, borderRadius: "var(--radius-md)",
            width: "fit-content"
          }}>
            {["text", "voice"].map(m => (
              <button key={m} onClick={() => setMode(m)} style={{
                padding: "8px 20px", borderRadius: "var(--radius-sm)",
                border: "none", cursor: "pointer", fontSize: 14, fontWeight: 500,
                background: mode === m ? "var(--gradient-primary)" : "transparent",
                color: mode === m ? "white" : "var(--text-secondary)",
                transition: "all 0.2s"
              }}>
                {m === "text" ? "📝 Text Mode" : "🎙️ Voice Mode"}
              </button>
            ))}
          </div>

          {/* Text Mode */}
          {mode === "text" && (
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Type your answer here..."
              rows={8}
              style={{
                width: "100%", padding: "16px",
                background: "var(--bg-glass)", border: "1px solid var(--border)",
                borderRadius: "var(--radius-md)", color: "var(--text-primary)",
                fontSize: 15, resize: "vertical", fontFamily: "Inter, sans-serif",
                outline: "none", marginBottom: 20, boxSizing: "border-box",
                lineHeight: 1.7
              }}
              onFocus={(e) => e.target.style.borderColor = "var(--accent-purple)"}
              onBlur={(e) => e.target.style.borderColor = "var(--border)"}
            />
          )}

          {/* Voice Mode */}
          {mode === "voice" && (
            <div className="glass-card" style={{ padding: "36px", textAlign: "center", marginBottom: 20 }}>
              <button
                onClick={recording ? stopRecording : startRecording}
                style={{
                  width: 80, height: 80, borderRadius: "50%", border: "none",
                  background: recording ? "var(--accent-red)" : "var(--gradient-primary)",
                  color: "white", fontSize: 28, cursor: "pointer",
                  boxShadow: recording ? "0 0 0 8px rgba(239,68,68,0.2)" : "var(--shadow-glow)",
                  transition: "all 0.3s", marginBottom: 16,
                  animation: recording ? "pulse-glow 1.5s infinite" : "none"
                }}
              >
                {recording ? "⏹" : "🎤"}
              </button>
              <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>
                {recording ? "Recording... Click to stop" : "Click to start recording"}
              </p>
              {status && (
                <p style={{ color: "var(--accent-purple-light)", fontSize: 14, marginTop: 16 }}>
                  {status}
                </p>
              )}
              {transcript && (
                <div style={{
                  marginTop: 20, padding: "16px", background: "var(--bg-secondary)",
                  borderRadius: "var(--radius-md)", textAlign: "left",
                  border: "1px solid var(--border)"
                }}>
                  <p style={{ color: "var(--text-muted)", fontSize: 12, marginBottom: 8 }}>TRANSCRIPT</p>
                  <p style={{ fontSize: 15, lineHeight: 1.7 }}>{transcript}</p>
                  <button onClick={() => { setAnswer(""); setTranscript(""); }}
                    style={{ background: "none", border: "none", color: "var(--text-muted)",
                      fontSize: 12, cursor: "pointer", marginTop: 10, padding: 0 }}>
                    ✕ Clear and re-record
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Status message */}
          {status && !status.includes("Transcri") && (
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

          {/* Submit Button */}
          <button className="btn-primary"
            disabled={loading || !answer.trim()}
            onClick={handleSubmit}
            style={{ width: "100%", justifyContent: "center", padding: "16px", fontSize: 16 }}>
            {loading ? (
              <><div className="spinner" /> {currentIndex === questions.length - 1 ? "Evaluating..." : "Submitting..."}</>
            ) : currentIndex === questions.length - 1 ? (
              "Submit & Get Feedback →"
            ) : (
              `Submit & Next Question (${currentIndex + 2}/${questions.length}) →`
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

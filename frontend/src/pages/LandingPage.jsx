import { useNavigate } from "react-router-dom";

const features = [
  {
    icon: "🧠",
    title: "Resume-Aware Questions",
    desc: "AI reads your actual resume and generates questions specific to your experience, projects, and skills — not generic questions."
  },
  {
    icon: "🎙️",
    title: "Voice or Text Mode",
    desc: "Answer by speaking naturally or typing. Your voice is transcribed instantly and your answer is evaluated just as thoroughly."
  },
  {
    icon: "📊",
    title: "Detailed Scoring",
    desc: "Every answer is scored 1–10 with strengths, what was missing, and an ideal answer outline."
  },
  {
    icon: "🎯",
    title: "RAG-Powered Context",
    desc: "We compare your answers against your resume using Retrieval-Augmented Generation for fair, grounded evaluation."
  },
  {
    icon: "⚡",
    title: "Fast, Not Slow",
    desc: "Interview questions appear in seconds. Evaluations are thorough but snappy — no waiting around for a loading spinner."
  },
  {
    icon: "📝",
    title: "Hiring Recommendation",
    desc: "Get a final verdict: Strong Hire, Hire, or No Hire — with a full skills gap analysis."
  }
];

const steps = [
  { num: "01", title: "Upload Resume", desc: "Drop your PDF or DOCX resume and paste the job description." },
  { num: "02", title: "AI Generates Questions", desc: "Our RAG pipeline reads your resume and crafts tailored interview questions." },
  { num: "03", title: "Answer Naturally", desc: "Speak or type your answers. Take your time — this is practice." },
  { num: "04", title: "Get Detailed Feedback", desc: "Receive scores, strengths, gaps, and a hiring recommendation." },
];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: "100vh", overflowX: "hidden" }}>

      {/* ── Nav ────────────────────────────────────── */}
      <nav style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "20px 60px", borderBottom: "1px solid var(--border)",
        position: "sticky", top: 0, zIndex: 100,
        background: "rgba(10,10,15,0.8)", backdropFilter: "blur(20px)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 24 }}>🎤</span>
          <span style={{ fontWeight: 700, fontSize: 18, color: "var(--text-primary)" }}>
            AI Interview Copilot
          </span>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <button className="btn-secondary" style={{ padding: "8px 20px", fontSize: 14 }}
            onClick={() => navigate("/upload")}>
            Sign In
          </button>
          <button className="btn-primary" style={{ padding: "8px 20px", fontSize: 14 }}
            onClick={() => navigate("/upload")}>
            Get Started Free →
          </button>
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────────── */}
      <section style={{
        textAlign: "center", padding: "100px 20px 80px",
        position: "relative", overflow: "hidden"
      }}>
        {/* Background glow blobs */}
        <div style={{
          position: "absolute", top: "10%", left: "20%",
          width: 400, height: 400, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)",
          filter: "blur(40px)", pointerEvents: "none"
        }} />
        <div style={{
          position: "absolute", top: "20%", right: "15%",
          width: 300, height: 300, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)",
          filter: "blur(40px)", pointerEvents: "none"
        }} />

        <div className="badge badge-purple" style={{ marginBottom: 24, display: "inline-flex" }}>
          ✨ AI-Powered Interview Practice
        </div>

        <h1 style={{
          fontSize: "clamp(40px, 6vw, 72px)", fontWeight: 800,
          lineHeight: 1.1, letterSpacing: "-2px", marginBottom: 24,
          maxWidth: 800, margin: "0 auto 24px"
        }}>
          Ace Your Next Interview With{" "}
          <span className="gradient-text">AI That Knows Your Resume</span>
        </h1>

        <p style={{
          fontSize: "clamp(16px, 2vw, 20px)", color: "var(--text-secondary)",
          maxWidth: 560, margin: "0 auto 48px", lineHeight: 1.7
        }}>
          Upload your resume. Get questions built around your actual experience.
          Speak or type your answers. Walk away knowing exactly where you stand.
        </p>

        <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
          <button className="btn-primary" style={{ fontSize: 16, padding: "14px 32px" }}
            onClick={() => navigate("/upload")}>
            Start Free Practice →
          </button>
          <button className="btn-secondary" style={{ fontSize: 16, padding: "14px 32px" }}
            onClick={() => document.getElementById("how-it-works").scrollIntoView({ behavior: "smooth" })}>
            See How It Works
          </button>
        </div>

        {/* Hero card preview */}
        <div className="glass-card animate-float" style={{
          maxWidth: 680, margin: "64px auto 0",
          padding: "32px", textAlign: "left"
        }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
            {["#ef4444","#f59e0b","#10b981"].map(c => (
              <div key={c} style={{ width: 12, height: 12, borderRadius: "50%", background: c }} />
            ))}
          </div>
          <div style={{ color: "var(--text-secondary)", fontSize: 13, marginBottom: 16 }}>
            AI Generated Question — based on your resume
          </div>
          <p style={{ fontSize: 17, fontWeight: 500, marginBottom: 20, lineHeight: 1.6 }}>
            "You listed a RAG-based chatbot project using LangChain. Can you walk me through
            how you handled retrieval quality and what embedding model you chose — and why?"
          </p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <span className="badge badge-purple">🎙️ Voice Mode</span>
            <span className="badge badge-blue">📝 Text Mode</span>
            <span className="badge badge-green">⚡ Groq Powered</span>
          </div>
        </div>
      </section>

      {/* ── Features ───────────────────────────────── */}
      <section style={{ padding: "80px 60px", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 60 }}>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 700, marginBottom: 16 }}>
            Everything You Need to <span className="gradient-text">Nail the Interview</span>
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: 17 }}>
            Built on production-grade AI with real resume understanding — not just templates.
          </p>
        </div>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: 20
        }}>
          {features.map((f, i) => (
            <div key={i} className="glass-card" style={{ padding: "28px" }}>
              <div style={{ fontSize: 32, marginBottom: 16 }}>{f.icon}</div>
              <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 10 }}>{f.title}</h3>
              <p style={{ color: "var(--text-secondary)", lineHeight: 1.7, fontSize: 15 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How It Works ───────────────────────────── */}
      <section id="how-it-works" style={{
        padding: "80px 60px", background: "var(--bg-secondary)"
      }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 60 }}>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 700, marginBottom: 16 }}>
              How It <span className="gradient-text">Works</span>
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: 17 }}>
              Go from resume to feedback in under 10 minutes.
            </p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {steps.map((s, i) => (
              <div key={i} style={{
                display: "flex", gap: 24, alignItems: "flex-start",
                padding: "28px", background: "var(--bg-glass)",
                border: "1px solid var(--border)", borderRadius: "var(--radius-lg)",
                transition: "border-color 0.3s"
              }}>
                <div style={{
                  fontSize: 13, fontWeight: 700, color: "var(--accent-purple-light)",
                  minWidth: 36, padding: "4px 0"
                }}>{s.num}</div>
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>{s.title}</h3>
                  <p style={{ color: "var(--text-secondary)", lineHeight: 1.7 }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Tech Stack ─────────────────────────────── */}
      <section style={{ padding: "80px 60px", textAlign: "center" }}>
        <p style={{ color: "var(--text-muted)", fontSize: 13, letterSpacing: 2, textTransform: "uppercase", marginBottom: 32 }}>
          Powered by
        </p>
        <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
          {["Groq · Llama 3.3-70B", "LangChain", "RAG · Qdrant", "Groq Whisper API", "Gemini Embeddings", "FastAPI", "Redis Sessions"].map((t, i) => (
            <span key={i} className="badge badge-purple" style={{ fontSize: 13 }}>{t}</span>
          ))}
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────── */}
      <section style={{
        padding: "80px 20px", textAlign: "center",
        background: "linear-gradient(135deg, rgba(124,58,237,0.08), rgba(59,130,246,0.08))",
        borderTop: "1px solid var(--border)"
      }}>
        <h2 style={{ fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 700, marginBottom: 16 }}>
          Ready to <span className="gradient-text">Practice?</span>
        </h2>
        <p style={{ color: "var(--text-secondary)", fontSize: 17, marginBottom: 40 }}>
          Upload your resume and start your AI mock interview in 30 seconds.
        </p>
        <button className="btn-primary" style={{ fontSize: 18, padding: "16px 40px" }}
          onClick={() => navigate("/upload")}>
          Start Your Interview →
        </button>
      </section>

      {/* ── Footer ─────────────────────────────────── */}
      <footer style={{
        padding: "24px 60px", borderTop: "1px solid var(--border)",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        color: "var(--text-muted)", fontSize: 14
      }}>
        <span>🎤 AI Interview Copilot</span>
        <span>Built with FastAPI · LangChain · React · Groq</span>
      </footer>

    </div>
  );
}

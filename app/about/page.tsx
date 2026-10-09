import Link from "next/link";

export default function About() {
  return (
    <main className="sermon-shell">
      <div className="sermon-container">
        {/* Hero Section */}
        <header className="sermon-header">
          <p className="eyebrow">About</p>
          <h1>About SermonAI</h1>
          <p>
            Empowering pastors and believers with AI-driven sermon analysis.
            Turn hours of preaching into structured, actionable Bible study notes.
          </p>
        </header>

        {/* Mission Section */}
        <section className="note-section note-section--overview" style={{ maxWidth: "62rem", margin: "3rem auto 0" }}>
          <h3>Our Mission</h3>
          <p>
            SermonAI was built to help pastors, students, and believers get more out of every sermon.
            Instead of relying on memory or scattered notes, you can now generate structured study guides
            that capture the key teachings, Bible references, practical applications, and prayer points
            from any YouTube sermon.
          </p>
        </section>

        {/* Features Grid */}
        <section style={{ maxWidth: "62rem", margin: "3rem auto 0" }}>
          <h2 style={{ fontSize: "clamp(1.4rem, 3vw, 2rem)", letterSpacing: "-0.04em", marginBottom: "1.5rem" }}>
            How It Works
          </h2>
          <div className="note-grid">
            <div className="note-section">
              <h3>1. Paste a YouTube URL</h3>
              <p>
                Drop any sermon link from YouTube. SermonAI extracts the video metadata and transcript automatically.
              </p>
            </div>

            <div className="note-section">
              <h3>2. Choose Your Mode</h3>
              <p>
                Select between structured notes (fast, no AI) or AI-powered analysis for deeper insights using Gemini.
              </p>
            </div>

            <div className="note-section">
              <h3>3. Get Structured Notes</h3>
              <p>
                Receive a complete sermon note with overview, main points, key lessons, Bible references, and more.
              </p>
            </div>

            <div className="note-section">
              <h3>4. Study & Reflect</h3>
              <p>
                Use the generated notes for personal study, small groups, or sermon preparation.
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section style={{ textAlign: "center", margin: "4rem auto 0" }}>
          <Link href="/">
            <button className="sermon-form button" style={{ background: "var(--foreground)", color: "#fffdf8", border: "none", borderRadius: "0.8rem", padding: "0.9rem 2rem", fontWeight: 700, cursor: "pointer", fontSize: "1rem" }}>
              Start Analyzing Sermons →
            </button>
          </Link>
        </section>
      </div>
    </main>
  );
}
import Link from "next/link";

export default function Sermons() {
  return (
    <main className="sermon-shell">
      <div className="sermon-container">
        {/* Header */}
        <header className="sermon-header" style={{ marginBottom: "2rem" }}>
          <p className="eyebrow">Library</p>
          <h1>My Sermons</h1>
          <p>Browse and manage your saved sermon transcripts and notes.</p>
        </header>

        {/* Empty State */}
        <section style={{ textAlign: "center", padding: "4rem 0" }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📚</div>
          <h2 style={{ fontSize: "clamp(1.4rem, 3vw, 2rem)", letterSpacing: "-0.04em", marginBottom: "0.75rem" }}>
            No sermons yet
          </h2>
          <p style={{ color: "var(--ink-muted)", maxWidth: "28rem", margin: "0 auto 2rem" }}>
            Start by pasting a YouTube sermon URL on the Home page to generate your first set of study notes.
          </p>
          <Link href="/">
            <button style={{ background: "var(--foreground)", color: "#fffdf8", border: "none", borderRadius: "0.8rem", padding: "0.9rem 2rem", fontWeight: 700, cursor: "pointer", fontSize: "1rem" }}>
              Go to Home →
            </button>
          </Link>
        </section>

        {/* Placeholder for future sermon list */}
        <div style={{ maxWidth: "62rem", margin: "3rem auto 0" }}></div>
      </div>
    </main>
  );
}

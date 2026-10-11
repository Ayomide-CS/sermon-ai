export default function MySermons() {
  return (
    <div>
      <h1 style={{ fontSize: "clamp(1.6rem, 4vw, 2.25rem)", letterSpacing: "-0.045em", marginBottom: "0.5rem" }}>
        My Sermons
      </h1>
      <p style={{ color: "var(--ink-muted)", marginBottom: "2rem" }}>All your saved sermon transcripts.</p>

      {/* Empty State */}
      <div style={{ background: "var(--paper)", border: "1px solid var(--line)", borderRadius: "1.25rem", padding: "3rem 2rem", textAlign: "center" }}>
        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📚</div>
        <h3 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.5rem" }}>No sermons saved yet</h3>
        <p style={{ color: "var(--ink-muted)", maxWidth: "28rem", margin: "0 auto" }}>
          Analyze a sermon from the Home page to see it listed here.
        </p>
      </div>
    </div>
  );
}

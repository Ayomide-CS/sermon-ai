export default function SavedNotes() {
  return (
    <div>
      <h1 style={{ fontSize: "clamp(1.6rem, 4vw, 2.25rem)", letterSpacing: "-0.045em", marginBottom: "0.5rem" }}>
        Saved Notes
      </h1>
      <p style={{ color: "var(--ink-muted)", marginBottom: "2rem" }}>Your generated sermon study notes.</p>

      {/* Empty State */}
      <div style={{ background: "var(--paper)", border: "1px solid var(--line)", borderRadius: "1.25rem", padding: "3rem 2rem", textAlign: "center" }}>
        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📝</div>
        <h3 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.5rem" }}>No notes saved yet</h3>
        <p style={{ color: "var(--ink-muted)", maxWidth: "28rem", margin: "0 auto" }}>
          Generate sermon notes from the Home page to see them here.
        </p>
      </div>
    </div>
  );
}

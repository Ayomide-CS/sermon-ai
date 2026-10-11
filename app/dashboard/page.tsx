import Link from "next/link";

export default function Dashboard() {
  return (
    <div>
      <h1 style={{ fontSize: "clamp(1.6rem, 4vw, 2.25rem)", letterSpacing: "-0.045em", marginBottom: "0.5rem" }}>
        Overview
      </h1>
      <p style={{ color: "var(--ink-muted)", marginBottom: "2rem" }}>Welcome to your SermonAI dashboard.</p>

      {/* Stats Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
        <StatCard label="Sermons Analyzed" value="0" icon="📖" />
        <StatCard label="Notes Generated" value="0" icon="📝" />
        <StatCard label="Bible References" value="0" icon="✝️" />
      </div>

      {/* Quick Actions */}
      <section style={{ background: "var(--paper)", border: "1px solid var(--line)", borderRadius: "1.25rem", padding: "2rem" }}>
        <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "1rem" }}>Quick Actions</h3>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          <Link href="/">
            <button style={{ background: "var(--foreground)", color: "#fffdf8", border: "none", borderRadius: "0.8rem", padding: "0.75rem 1.5rem", fontWeight: 600, cursor: "pointer" }}>
              Analyze New Sermon →
            </button>
          </Link>
          <Link href="/sermons">
            <button style={{ background: "transparent", color: "var(--foreground)", border: "1px solid var(--line)", borderRadius: "0.8rem", padding: "0.75rem 1.5rem", fontWeight: 600, cursor: "pointer" }}>
              View All Sermons
            </button>
          </Link>
        </div>
      </section>

      {/* Recent Activity Placeholder */}
      <section style={{ marginTop: "2rem", background: "var(--paper)", border: "1px solid var(--line)", borderRadius: "1.25rem", padding: "2rem" }}>
        <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "1rem" }}>Recent Activity</h3>
        <p style={{ color: "var(--ink-muted)", textAlign: "center", padding: "2rem 0" }}>
          No recent activity yet. Start by analyzing your first sermon!
        </p>
      </section>
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div style={{ background: "var(--paper)", border: "1px solid var(--line)", borderRadius: "1rem", padding: "1.5rem" }}>
      <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>{icon}</div>
      <p style={{ fontSize: "1.75rem", fontWeight: 800, letterSpacing: "-0.04em", margin: 0 }}>{value}</p>
      <p style={{ color: "var(--ink-muted)", fontSize: "0.85rem", margin: "0.25rem 0 0" }}>{label}</p>
    </div>
  );
}

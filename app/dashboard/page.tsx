"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Stats {
  sermons: number;
  notes: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({ sermons: 0, notes: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    try {
      const accessToken = typeof window !== "undefined" ? localStorage.getItem("sermon_ai_access_token") : null;

      const headers: Record<string, string> = {};
      if (accessToken) {
        headers["Authorization"] = `Bearer ${accessToken}`;
      }

      const res = await fetch("/api/sermons?action=stats", { headers });

      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch {
      // Stats are non-critical, silently fail
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 style={{ fontSize: "clamp(1.6rem, 4vw, 2.25rem)", letterSpacing: "-0.045em", marginBottom: "0.5rem" }}>
        Overview
      </h1>
      <p style={{ color: "var(--ink-muted)", marginBottom: "2rem" }}>Welcome to your SermonAI dashboard.</p>

      {/* Stats Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
        <StatCard label="Sermons Analyzed" value={loading ? "..." : String(stats.sermons)} icon="📖" />
        <StatCard label="Notes Generated" value={loading ? "..." : String(stats.notes)} icon="📝" />
        <StatCard label="Bible References" value="0" icon="✝️" tooltip="Coming soon — auto-extracted from sermons" />
      </div>

      {/* Quick Actions */}
      <section style={{ background: "var(--paper)", border: "1px solid var(--line)", borderRadius: "1.25rem", padding: "2rem", marginBottom: "1.5rem" }}>
        <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "1rem" }}>Quick Actions</h3>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          <Link href="/">
            <button className="btn btn--accent">Analyze New Sermon →</button>
          </Link>
          <Link href="/sermons">
            <button style={{ background: "transparent", color: "var(--ink)", border: "1px solid var(--line)", borderRadius: "0.8rem", padding: "0.75rem 1.5rem", fontWeight: 600, cursor: "pointer" }}>
              View All Sermons
            </button>
          </Link>
        </div>
      </section>

      {/* Recent Activity */}
      <RecentActivity />
    </div>
  );
}

function StatCard({ label, value, icon, tooltip }: { label: string; value: string; icon: string; tooltip?: string }) {
  return (
    <div style={{ background: "var(--paper)", border: "1px solid var(--line)", borderRadius: "1rem", padding: "1.5rem", position: "relative" }}>
      <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>{icon}</div>
      <p style={{ fontSize: "1.75rem", fontWeight: 800, letterSpacing: "-0.04em", margin: 0 }}>{value}</p>
      <p style={{ color: "var(--ink-muted)", fontSize: "0.85rem", margin: "0.25rem 0 0" }}>{label}</p>
      {tooltip && (
        <span title={tooltip} style={{ position: "absolute", top: "1rem", right: "1rem", fontSize: "0.75rem", color: "var(--ink-muted)", cursor: "help" }}>ℹ️</span>
      )}
    </div>
  );
}

function RecentActivity() {
  const [recentSermons, setRecentSermons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecent();
  }, []);

  async function fetchRecent() {
    try {
      const accessToken = typeof window !== "undefined" ? localStorage.getItem("sermon_ai_access_token") : null;
      const headers: Record<string, string> = {};
      if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;

      const res = await fetch("/api/sermons?action=list", { headers });
      if (res.ok) {
        const data = await res.json();
        setRecentSermons((data.sermons || []).slice(0, 5));
      }
    } catch {} finally {
      setLoading(false);
    }
  }

  return (
    <section style={{ background: "var(--paper)", border: "1px solid var(--line)", borderRadius: "1.25rem", padding: "2rem" }}>
      <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "1rem" }}>Recent Activity</h3>

      {loading ? (
        <p style={{ color: "var(--ink-muted)", textAlign: "center", padding: "2rem 0" }}>Loading...</p>
      ) : recentSermons.length === 0 ? (
        <p style={{ color: "var(--ink-muted)", textAlign: "center", padding: "2rem 0" }}>
          No recent activity yet. Start by analyzing your first sermon!
        </p>
      ) : (
        <div style={{ display: "grid", gap: "0.75rem" }}>
          {recentSermons.map((sermon) => (
            <Link
              key={sermon.id}
              href={`/sermons/${sermon.id}`}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "0.75rem 1rem",
                background: "var(--background)",
                borderRadius: "0.65rem",
                textDecoration: "none",
                color: "inherit",
                transition: "background 120ms ease",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--accent-soft)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--background)"; }}
            >
              <div>
                <p style={{ fontWeight: 600, fontSize: "0.95rem", margin: 0 }}>{sermon.title}</p>
                <p style={{ color: "var(--ink-muted)", fontSize: "0.8rem", margin: 0 }}>by {sermon.speaker} • {new Date(sermon.createdAt).toLocaleDateString()}</p>
              </div>
              <span style={{ color: "var(--ink-muted)" }}>→</span>
            </Link>
          ))}
        </div>
      )}

      {!loading && recentSermons.length > 0 && (
        <div style={{ textAlign: "center", marginTop: "1rem" }}>
          <Link href="/sermons" style={{ color: "var(--accent-dark)", fontSize: "0.9rem", fontWeight: 600, textDecoration: "none" }}>
            View all sermons →
          </Link>
        </div>
      )}
    </section>
  );
}

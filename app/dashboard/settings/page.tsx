export default function Settings() {
  return (
    <div>
      <h1 style={{ fontSize: "clamp(1.6rem, 4vw, 2.25rem)", letterSpacing: "-0.045em", marginBottom: "0.5rem" }}>
        Settings
      </h1>
      <p style={{ color: "var(--ink-muted)", marginBottom: "2rem" }}>Manage your account and preferences.</p>

      {/* Settings Sections */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        {/* API Keys Section */}
        <section style={{ background: "var(--paper)", border: "1px solid var(--line)", borderRadius: "1.25rem", padding: "2rem" }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "1rem" }}>API Configuration</h3>
          <p style={{ color: "var(--ink-muted)", fontSize: "0.9rem", marginBottom: "1rem" }}>
            Configure your API keys in the <code style={{ background: "var(--accent-soft)", padding: "0.25rem 0.5rem", borderRadius: "0.4rem" }}>.env</code> file.
          </p>
          <div style={{ display: "grid", gap: "1rem" }}>
            <ApiKeyField label="YouTube API Key" value={process.env.NEXT_PUBLIC_YOUTUBE_API_KEY ? "••••••••" : "Not configured"} />
            <ApiKeyField label="Gemini API Key" value={process.env.NEXT_PUBLIC_GEMINI_API_KEY ? "••••••••" : "Not configured"} />
          </div>
        </section>

        {/* Transcription Settings */}
        <section style={{ background: "var(--paper)", border: "1px solid var(--line)", borderRadius: "1.25rem", padding: "2rem" }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "1rem" }}>Transcription Settings</h3>
          <p style={{ color: "var(--ink-muted)", fontSize: "0.9rem" }}>
            Transcription fallback uses local whisper.cpp when YouTube captions are unavailable.
          </p>
        </section>

        {/* Danger Zone */}
        <section style={{ background: "var(--paper)", border: "1px solid #f5c6cb", borderRadius: "1.25rem", padding: "2rem" }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "1rem", color: "#943e2c" }}>Danger Zone</h3>
          <p style={{ color: "var(--ink-muted)", fontSize: "0.9rem", marginBottom: "1rem" }}>
            Clear all saved data from your browser storage.
          </p>
          <button style={{ background: "#943e2c", color: "#fffdf8", border: "none", borderRadius: "0.8rem", padding: "0.75rem 1.5rem", fontWeight: 600, cursor: "pointer" }}>
            Clear All Data
          </button>
        </section>
      </div>
    </div>
  );
}

function ApiKeyField({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span style={{ fontWeight: 600 }}>{label}</span>
      <span style={{ color: value === "Not configured" ? "#943e2c" : "var(--accent-dark)", fontSize: "0.9rem" }}>
        {value}
      </span>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useAuth } from "@/app/lib/auth-context";

export default function Settings() {
  const { logout, user } = useAuth();
  const [clearing, setClearing] = useState(false);
  const [cleared, setCleared] = useState(false);

  async function handleLogout() {
    try {
      await logout();
      window.location.href = "/";
    } catch {
      // Force clear anyway
      localStorage.removeItem("sermon_ai_access_token");
      window.location.href = "/";
    }
  }

  function handleClearData() {
    if (!confirm("Are you sure you want to clear all saved data? This will remove your access token and any cached data.")) return;
    
    setClearing(true);
    try {
      localStorage.removeItem("sermon_ai_access_token");
      setCleared(true);
      setTimeout(() => setCleared(false), 3000);
    } catch {
      // Ignore errors
    } finally {
      setClearing(false);
    }
  }

  return (
    <div>
      <h1 style={{ fontSize: "clamp(1.6rem, 4vw, 2.25rem)", letterSpacing: "-0.045em", marginBottom: "0.5rem" }}>
        Settings
      </h1>
      <p style={{ color: "var(--ink-muted)", marginBottom: "2rem" }}>Manage your account and preferences.</p>

      {/* Account Info */}
      {user && (
        <section style={{ background: "var(--paper)", border: "1px solid var(--line)", borderRadius: "1.25rem", padding: "2rem", marginBottom: "1.5rem" }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "1rem" }}>Account</h3>
          <div style={{ display: "grid", gap: "0.75rem" }}>
            <SettingRow label="Name" value={user.name || "Not set"} />
            <SettingRow label="Email" value={user.email} />
          </div>
        </section>
      )}

      {/* API Keys Section */}
      <section style={{ background: "var(--paper)", border: "1px solid var(--line)", borderRadius: "1.25rem", padding: "2rem", marginBottom: "1.5rem" }}>
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
      <section style={{ background: "var(--paper)", border: "1px solid var(--line)", borderRadius: "1.25rem", padding: "2rem", marginBottom: "1.5rem" }}>
        <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "1rem" }}>Transcription Settings</h3>
        <p style={{ color: "var(--ink-muted)", fontSize: "0.9rem" }}>
          Transcription fallback uses local whisper.cpp when YouTube captions are unavailable. Configure whisper settings in your environment variables.
        </p>
      </section>

      {/* Danger Zone */}
      <section style={{ background: "var(--paper)", border: "1px solid #f5c6cb", borderRadius: "1.25rem", padding: "2rem" }}>
        <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "1rem", color: "#943e2c" }}>Danger Zone</h3>
        
        {/* Clear Data */}
        <div style={{ marginBottom: "1.5rem" }}>
          <p style={{ color: "var(--ink-muted)", fontSize: "0.9rem", marginBottom: "0.75rem" }}>
            Clear all saved data from your browser storage (access tokens, cached data).
          </p>
          <button
            onClick={handleClearData}
            disabled={clearing}
            style={{ 
              background: cleared ? "#4caf50" : "#943e2c", 
              color: "#fffdf8", 
              border: "none", 
              borderRadius: "0.8rem", 
              padding: "0.75rem 1.5rem", 
              fontWeight: 600, 
              cursor: clearing ? "not-allowed" : "pointer",
              opacity: clearing ? 0.7 : 1,
            }}
          >
            {clearing ? "Clearing..." : cleared ? "✓ Cleared!" : "Clear All Data"}
          </button>
        </div>

        {/* Logout */}
        <div>
          <p style={{ color: "var(--ink-muted)", fontSize: "0.9rem", marginBottom: "0.75rem" }}>
            Sign out of your account on this device.
          </p>
          <button
            onClick={handleLogout}
            style={{ 
              background: "#fffdf8", 
              color: "#943e2c", 
              border: "1px solid #943e2c", 
              borderRadius: "0.8rem", 
              padding: "0.75rem 1.5rem", 
              fontWeight: 600, 
              cursor: "pointer"
            }}
          >
            Sign Out
          </button>
        </div>
      </section>
    </div>
  );
}

function SettingRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span style={{ fontWeight: 600 }}>{label}</span>
      <span style={{ color: "var(--ink-muted)", fontSize: "0.9rem" }}>{value}</span>
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

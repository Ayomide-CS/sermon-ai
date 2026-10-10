"use client";

import { useState } from "react";

export type TranscriptionMode = "deterministic" | "whisper" | "external";

interface TranscriptModeSelectorProps {
  onModeChange: (mode: TranscriptionMode, apiKey?: string) => void;
}

/**
 * TranscriptModeSelector — lets the user choose how to get the sermon transcript.
 *
 * Options:
 *   1. Deterministic — YouTube transcript API (free, no key needed)
 *   2. Local Whisper — whisper.cpp from .env (free, requires setup)
 *   3. External LLM — user provides their own API key for Gemini/OpenAI
 */
export default function TranscriptModeSelector({
  onModeChange,
}: TranscriptModeSelectorProps) {
  const [selectedMode, setSelectedMode] = useState<TranscriptionMode>("deterministic");
  const [apiKey, setApiKey] = useState("");
  const [provider, setProvider] = useState<"openai" | "gemini">("openai");

  const handleSelect = (mode: TranscriptionMode) => {
    setSelectedMode(mode);
    onModeChange(mode, mode === "external" ? apiKey : undefined);
  };

  return (
    <div className="mode-selector">
      <div className="mode-selector__header">
        <p className="eyebrow">Choose your transcription method</p>
        <h2>How should we get the sermon transcript?</h2>
        <p>
          Pick the option that works best for you. You can always switch later.
        </p>
      </div>

      <div className="mode-selector__options">
        {/* Option 1: Deterministic */}
        <button
          type="button"
          onClick={() => handleSelect("deterministic")}
          className={`mode-card ${selectedMode === "deterministic" ? "mode-card--active" : ""}`}
        >
          <span className="mode-card__icon">🎯</span>
          <strong>YouTube Transcript (Free)</strong>
          <span>
            Uses YouTube's built-in captions. No API key needed. Works best when the video has auto-generated or manual subtitles enabled.
          </span>
        </button>

        {/* Option 2: Local Whisper */}
        <button
          type="button"
          onClick={() => handleSelect("whisper")}
          className={`mode-card ${selectedMode === "whisper" ? "mode-card--active" : ""}`}
        >
          <span className="mode-card__icon">🖥️</span>
          <strong>Local Whisper (Free)</strong>
          <span>
            Uses your local whisper.cpp installation. Works even without YouTube captions. Requires whisper.cpp to be installed and configured in .env.
          </span>
        </button>

        {/* Option 3: External LLM */}
        <button
          type="button"
          onClick={() => handleSelect("external")}
          className={`mode-card ${selectedMode === "external" ? "mode-card--active" : ""}`}
        >
          <span className="mode-card__icon">☁️</span>
          <strong>Cloud AI (Your API Key)</strong>
          <span>
            Use a cloud provider to transcribe and structure the sermon. You provide your own API key — we never store it. Supports OpenAI & Gemini.
          </span>
        </button>
      </div>

      {/* External LLM configuration panel */}
      {selectedMode === "external" && (
        <div className="external-config">
          <h3>Your API Key</h3>
          <p className="external-config__hint">
            Your key is sent directly to the provider and never stored on our servers.
          </p>

          {/* Provider selector */}
          <div className="provider-selector">
            <button
              type="button"
              onClick={() => setProvider("openai")}
              className={`provider-btn ${provider === "openai" ? "active" : ""}`}
            >
              OpenAI
            </button>
            <button
              type="button"
              onClick={() => setProvider("gemini")}
              className={`provider-btn ${provider === "gemini" ? "active" : ""}`}
            >
              Google Gemini
            </button>
          </div>

          {/* API Key input */}
          <input
            type="password"
            value={apiKey}
            onChange={(e) => {
              setApiKey(e.target.value);
              onModeChange("external", e.target.value);
            }}
            placeholder={`Enter your ${provider === "openai" ? "OpenAI" : "Gemini"} API key`}
            aria-label="API Key"
            className="api-key-input"
          />

          {provider === "gemini" && (
            <p className="external-config__note">
              💡 Gemini will structure your transcript. If you have raw audio, paste it as text first — Gemini works best with text input.
            </p>
          )}

          {provider === "openai" && (
            <p className="external-config__note">
              💡 OpenAI Whisper transcribes audio, and GPT-4o structures the result. For best results, paste your raw transcript text if you already have it.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

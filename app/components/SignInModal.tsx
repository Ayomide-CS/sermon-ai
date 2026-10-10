"use client";

import { useState } from "react";
import { useAuth } from "@/app/lib/auth-context";

interface SignInModalProps {
  onClose: () => void;
  onSwitchToSignUp: () => void;
}

export default function SignInModal({ onClose, onSwitchToSignUp }: SignInModalProps) {
  const { login, isLoading, error, clearError } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    try {
      await login({ email, password });
      onClose();
    } catch {
      // Error is handled by auth context
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Close button */}
        <button className="modal-close" onClick={onClose} type="button" aria-label="Close">
          ✕
        </button>

        <div className="modal-header">
          <h2>Welcome back</h2>
          <p>Sign in to save and manage your sermon notes.</p>
        </div>

        {error && (
          <div className="alert alert--error" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="signin-email">Email</label>
            <input
              id="signin-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="signin-password">Password</label>
            <input
              id="signin-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
              minLength={8}
            />
          </div>

          <button
            type="submit"
            className="btn btn--accent btn--full"
            disabled={isLoading}
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="modal-footer">
          Don't have an account?{" "}
          <button type="button" onClick={onSwitchToSignUp} className="link-btn">
            Sign up
          </button>
        </p>
      </div>
    </div>
  );
}

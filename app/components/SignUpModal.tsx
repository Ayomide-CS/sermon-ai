"use client";

import { useState } from "react";
import { useAuth } from "@/app/lib/auth-context";

interface SignUpModalProps {
  onClose: () => void;
  onSwitchToSignIn: () => void;
}

export default function SignUpModal({ onClose, onSwitchToSignIn }: SignUpModalProps) {
  const { register, isLoading, error, clearError } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (password !== confirmPassword) {
      return; // Let the form validation handle this visually
    }

    try {
      await register({ email, password, name: name || undefined });
      onClose();
    } catch {
      // Error is handled by auth context
    }
  };

  const passwordsMatch = !confirmPassword || password === confirmPassword;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Close button */}
        <button className="modal-close" onClick={onClose} type="button" aria-label="Close">
          ✕
        </button>

        <div className="modal-header">
          <h2>Create your account</h2>
          <p>Start saving and organizing your sermon study notes.</p>
        </div>

        {error && (
          <div className="alert alert--error" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="signup-name">Name <span className="optional">(optional)</span></label>
            <input
              id="signup-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              autoComplete="name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="signup-email">Email</label>
            <input
              id="signup-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="signup-password">Password</label>
            <input
              id="signup-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              required
              autoComplete="new-password"
              minLength={8}
            />
          </div>

          <div className="form-group">
            <label htmlFor="signup-confirm">Confirm Password</label>
            <input
              id="signup-confirm"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="new-password"
              minLength={8}
              style={{ borderColor: confirmPassword && !passwordsMatch ? "#c0392b" : undefined }}
            />
            {confirmPassword && !passwordsMatch && (
              <span className="field-error">Passwords do not match</span>
            )}
          </div>

          <button
            type="submit"
            className="btn btn--accent btn--full"
            disabled={isLoading || !passwordsMatch}
          >
            {isLoading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="modal-footer">
          Already have an account?{" "}
          <button type="button" onClick={onSwitchToSignIn} className="link-btn">
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
}

import React from "react";

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
}

export default function AuthModal({ open, onClose }: AuthModalProps) {
  if (!open) return null;

  return (
    <div className="auth-overlay" onClick={onClose}>
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        <div className="auth-header">
          <h3>Welcome back</h3>
          <button className="close-btn" onClick={onClose} type="button">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div className="auth-form">
          <div className="field">
            <label>Email</label>
            <input type="email" defaultValue="aisha@twistchess.app" />
          </div>

          <div className="field">
            <label>Password</label>
            <input type="password" defaultValue="••••••••" />
          </div>

          <div className="auth-row">
            <span className="switch-text">New here? <strong>Sign up</strong></span>
            <button className="primary-btn small" type="button">
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
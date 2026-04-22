import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../api/authService.js';
import BrandLogo from '../components/BrandLogo.jsx';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');

  async function requestReset(e) {
    e.preventDefault();
    setError('');
    try {
      const { data } = await authService.forgotPassword(email);
      if (data.resetToken) {
        setResetToken(data.resetToken);
      }
      setMsg(data.message || 'Check response for token (POC)');
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Request failed');
    }
  }

  async function submitReset(e) {
    e.preventDefault();
    setError('');
    try {
      await authService.resetPassword({ email, resetToken, newPassword });
      setMsg('Password updated. You can log in.');
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || 'Reset failed');
    }
  }

  return (
    <div className="parvati-store auth-page">
      <header className="parvati-topbar">
        <div className="parvati-shell parvati-nav">
          <BrandLogo />
          <div className="auth-top-actions">
            <Link className="auth-pill" to="/store">Store</Link>
            <Link className="auth-pill" to="/login">Sign in</Link>
          </div>
        </div>
      </header>
      <div className="parvati-shell auth-shell">
      <div className="card auth-card">
        <h2 className="auth-title">Forgot password</h2>
        {error && <p className="error">{error}</p>}
        {msg && <p style={{ color: '#4ade80', fontSize: 14 }}>{msg}</p>}
        {step === 1 && (
          <form onSubmit={requestReset}>
            <div className="field">
              <label>Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <button className="btn btn-primary" type="submit" style={{ width: '100%' }}>
              Get reset token
            </button>
          </form>
        )}
        {step === 2 && (
          <form onSubmit={submitReset}>
            <div className="field">
              <label>Reset token (pre-filled in POC)</label>
              <input value={resetToken} onChange={(e) => setResetToken(e.target.value)} required />
            </div>
            <div className="field">
              <label>New password</label>
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} minLength={6} required />
            </div>
            <button className="btn btn-primary" type="submit" style={{ width: '100%' }}>
              Update password
            </button>
          </form>
        )}
        {step === 3 && (
          <p>
            <Link to="/login">Go to login</Link>
          </p>
        )}
        <p style={{ marginTop: 16 }}>
          <Link to="/login">Back</Link>
        </p>
      </div>
      </div>
    </div>
  );
}

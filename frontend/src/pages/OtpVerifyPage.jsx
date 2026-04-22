import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { authService } from '../api/authService.js';
import { useAuth } from '../context/AuthContext.jsx';
import BrandLogo from '../components/BrandLogo.jsx';

export default function OtpVerifyPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { setToken } = useAuth();
  const { mobile, mode, otpHint } = location.state || {};
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');

  if (!mobile || !mode) {
    return (
      <div className="parvati-store auth-page" style={{ padding: 24 }}>
        <p>Missing session. Start from </p>
        <Link to="/login">Login</Link> or <Link to="/register">Register</Link>.
      </div>
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      if (mode === 'register') {
        const { data } = await authService.verifyRegisterOtp(mobile, otp);
        setToken(data.token);
        navigate('/dashboard', { replace: true });
        return;
      }
      const { data } = await authService.verifyLoginOtp(mobile, otp);
      setToken(data.token);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed');
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
        <h2 className="auth-title">Verify OTP</h2>
        <p style={{ fontSize: 14, color: '#94a3b8' }}>
          Mobile: <strong>{mobile}</strong> · Mode: <strong>{mode}</strong>
        </p>
        {otpHint && (
          <p style={{ fontSize: 13, color: '#fbbf24' }}>
            POC hint: <code>{otpHint}</code>
          </p>
        )}
        <form onSubmit={(e) => void handleSubmit(e)}>
          <div className="field">
            <label>OTP</label>
            <input value={otp} onChange={(e) => setOtp(e.target.value)} required />
          </div>
          {error && <p className="error">{error}</p>}
          <button className="btn btn-primary" type="submit" style={{ width: '100%' }}>
            Verify
          </button>
        </form>
        <p style={{ marginTop: 12 }}>
          <Link to="/login">Back to login</Link>
        </p>
      </div>
      </div>
    </div>
  );
}

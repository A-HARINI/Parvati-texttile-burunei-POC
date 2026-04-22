import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../api/authService.js';
import { useAuth } from '../context/AuthContext.jsx';
import BrandLogo from '../components/BrandLogo.jsx';

export default function LoginPage() {
  const navigate = useNavigate();
  const { setToken } = useAuth();
  const [tab, setTab] = useState('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mobile, setMobile] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleEmailLogin(e) {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      const { data } = await authService.loginEmail(email, password);
      if (!data?.token) {
        setError('Login response missing token. Please try again.');
        return;
      }
      setToken(data.token);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const serverMessage = err.response?.data?.message;
      setError(serverMessage || err.message || 'Login failed');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function goOtpLogin() {
    setError('');
    if (!mobile.trim()) {
      setError('Enter mobile');
      return;
    }
    try {
      const { data } = await authService.loginOtpRequest(mobile);
      navigate('/verify-otp', {
        state: { mobile, mode: 'login', otpHint: data.otpHint },
      });
    } catch (err) {
      const serverMessage = err.response?.data?.message;
      setError(serverMessage || err.message || 'Could not send OTP');
    }
  }

  return (
    <div className="parvati-store auth-page">
      <header className="parvati-topbar">
        <div className="parvati-shell parvati-nav">
          <BrandLogo />
          <div className="auth-top-actions">
            <Link className="auth-pill" to="/store">Store</Link>
            <Link className="auth-pill" to="/register">Create Account</Link>
          </div>
        </div>
      </header>
      <div className="parvati-shell auth-shell">
      <div className="card auth-card">
        <h2 className="auth-title">Sign in to your account</h2>
        <div className="tabs">
          <button type="button" className={tab === 'email' ? 'active' : ''} onClick={() => setTab('email')}>
            Email
          </button>
          <button type="button" className={tab === 'otp' ? 'active' : ''} onClick={() => setTab('otp')}>
            Mobile OTP
          </button>
        </div>
        {error && <p className="error">{error}</p>}
        {tab === 'email' ? (
          <form onSubmit={handleEmailLogin}>
            <div className="field">
              <label>Email</label>
              <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
            </div>
            <div className="field">
              <label>Password</label>
              <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
            </div>
            <button className="btn btn-primary" type="submit" style={{ width: '100%' }}>
              {isSubmitting ? 'Signing in...' : 'Sign in'}
            </button>
            <p style={{ marginTop: 12, fontSize: 14 }}>
              <Link to="/register">Create account</Link>
              {' · '}
              <Link to="/forgot-password">Forgot password?</Link>
            </p>
          </form>
        ) : (
          <div>
            <div className="field">
              <label>Mobile</label>
              <input value={mobile} onChange={(e) => setMobile(e.target.value)} placeholder="10+ digits" />
            </div>
            <p style={{ fontSize: 13, color: '#94a3b8' }}>We will send an OTP (shown in API response in POC).</p>
            <button type="button" className="btn btn-primary" style={{ width: '100%' }} onClick={() => void goOtpLogin()}>
              Send OTP and continue
            </button>
            <p style={{ marginTop: 12 }}>
              <Link to="/register">Register with mobile</Link>
            </p>
          </div>
        )}
      </div>
      </div>
    </div>
  );
}

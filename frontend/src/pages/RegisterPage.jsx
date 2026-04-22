import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../api/authService.js';
import BrandLogo from '../components/BrandLogo.jsx';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('email');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mobile, setMobile] = useState('');
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');

  async function handleEmailRegister(e) {
    e.preventDefault();
    setError('');
    setMsg('');
    try {
      await authService.registerEmail({ name, email, password });
      setMsg('Account created. You can log in.');
      setTimeout(() => navigate('/login'), 1200);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  }

  async function handleMobileRegister() {
    setError('');
    setMsg('');
    try {
      const { data } = await authService.registerMobile(mobile);
      setMsg(`OTP hint (POC): ${data.otpHint}`);
      navigate('/verify-otp', { state: { mobile, mode: 'register', otpHint: data.otpHint } });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP');
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
        <h2 className="auth-title">Create your account</h2>
        <div className="tabs">
          <button type="button" className={tab === 'email' ? 'active' : ''} onClick={() => setTab('email')}>
            Email + password
          </button>
          <button type="button" className={tab === 'mobile' ? 'active' : ''} onClick={() => setTab('mobile')}>
            Mobile + OTP
          </button>
        </div>
        {error && <p className="error">{error}</p>}
        {msg && <p style={{ color: '#4ade80' }}>{msg}</p>}
        {tab === 'email' ? (
          <form onSubmit={handleEmailRegister}>
            <div className="field">
              <label>Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="field">
              <label>Email</label>
              <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
            </div>
            <div className="field">
              <label>Password (min 6)</label>
              <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" minLength={6} required />
            </div>
            <button className="btn btn-primary" type="submit" style={{ width: '100%' }}>
              Register
            </button>
          </form>
        ) : (
          <div>
            <div className="field">
              <label>Mobile</label>
              <input value={mobile} onChange={(e) => setMobile(e.target.value)} placeholder="10+ digits" />
            </div>
            <button type="button" className="btn btn-primary" style={{ width: '100%' }} onClick={handleMobileRegister}>
              Send OTP
            </button>
          </div>
        )}
        <p style={{ marginTop: 16 }}>
          <Link to="/login">Already have an account?</Link>
        </p>
      </div>
      </div>
    </div>
  );
}

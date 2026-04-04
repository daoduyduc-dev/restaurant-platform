import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import api from '../../services/api';
import type { AuthResponseData, ApiResponse } from '../../services/types';
import { UtensilsCrossed, ArrowRight, Mail, Lock, Eye, EyeOff, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const QUICK_LOGIN_USERS = [
  { email: 'admin@servegenius.com', password: 'admin123', role: 'Admin', icon: '👨‍💼' },
  { email: 'manager@servegenius.com', password: 'manager123', role: 'Manager', icon: '👔' },
  { email: 'waiter@servegenius.com', password: 'waiter123', role: 'Waiter', icon: '🤵' },
  { email: 'receptionist@servegenius.com', password: 'reception123', role: 'Receptionist', icon: '🛎️' },
  { email: 'kitchen@servegenius.com', password: 'kitchen123', role: 'Kitchen', icon: '👨‍🍳' },
  { email: 'customer@servegenius.com', password: 'customer123', role: 'Customer', icon: '🧑‍💼' },
];

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const setAuth = useAuthStore(state => state.setAuth);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/login', { email, password });
      const d: AuthResponseData = res.data.data;
      setAuth(
        { id: d.userId, name: d.name, email: d.email, roles: d.roles },
        d.accessToken,
        d.refreshToken
      );
      navigate('/');
    } catch (err: Error | any) {
      const msg = err?.response?.data?.message;
      if (msg) {
        setError(msg);
      } else {
        setError('Backend server is not available. Please ensure the server is running on port 8080.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (user: typeof QUICK_LOGIN_USERS[0]) => {
    setEmail(user.email);
    setPassword(user.password);
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/login', {
        email: user.email,
        password: user.password
      });
      const d: AuthResponseData = res.data.data;
      setAuth(
        { id: d.userId, name: d.name, email: d.email, roles: d.roles },
        d.accessToken,
        d.refreshToken
      );
      navigate('/');
    } catch (err: Error | any) {
      const msg = err?.response?.data?.message;
      if (msg) {
        setError(msg);
      } else {
        setError('Backend server is not available. Please ensure the server is running on port 8080.');
      }
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="auth-bg"
    >
      {/* Background Decoration */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <div style={{
          position: 'absolute',
          top: '-10%',
          right: '-5%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(212, 175, 55, 0.1) 0%, transparent 70%)',
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-15%',
          left: '-10%',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(13, 148, 136, 0.08) 0%, transparent 70%)',
        }} />
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        maxWidth: '1000px', 
        width: '90%',
        background: 'white',
        borderRadius: 'var(--r-3xl)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-xl)',
        position: 'relative',
        zIndex: 10
      }}>
        {/* Left Side - Branding */}
        <motion.div 
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          style={{
            background: 'linear-gradient(135deg, #1F2937 0%, #111827 100%)',
            padding: 'var(--sp-12)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            color: 'white',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <div style={{ position: 'absolute', inset: 0, opacity: 0.1 }}>
            <div style={{
              position: 'absolute',
              top: '20%',
              left: '10%',
              width: '200px',
              height: '200px',
              borderRadius: '50%',
              border: '2px solid rgba(212, 175, 55, 0.3)',
            }} />
            <div style={{
              position: 'absolute',
              bottom: '15%',
              right: '15%',
              width: '150px',
              height: '150px',
              borderRadius: '50%',
              border: '2px solid rgba(212, 175, 55, 0.2)',
            }} />
          </div>

          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ 
              width: '80px', 
              height: '80px', 
              borderRadius: 'var(--r-2xl)', 
              background: 'linear-gradient(135deg, var(--orange-600), var(--orange-500))', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              marginBottom: 'var(--sp-6)',
              boxShadow: '0 8px 24px rgba(212, 175, 55, 0.3)'
            }}>
              <UtensilsCrossed size={40} color="white" />
            </div>
            <h1 style={{ 
              fontSize: 'var(--text-4xl)', 
              fontWeight: 800, 
              marginBottom: 'var(--sp-3)',
              fontFamily: 'var(--font-serif)',
              lineHeight: 1.1
            }}>
              ServeGenius
            </h1>
            <p style={{ 
              fontSize: 'var(--text-lg)', 
              opacity: 0.8,
              lineHeight: 1.6,
              marginBottom: 'var(--sp-6)'
            }}>
              Restaurant Management Platform
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)', fontSize: 'var(--text-sm)', opacity: 0.7 }}>
              <Sparkles size={16} />
              <span>Complete restaurant solution</span>
            </div>
          </div>
        </motion.div>

        {/* Right Side - Login Form */}
        <motion.div 
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          style={{ padding: 'var(--sp-10)' }}
        >
          <div style={{ textAlign: 'center', marginBottom: 'var(--sp-8)' }}>
            <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, marginBottom: 'var(--sp-2)', color: 'var(--text-heading)' }}>
              Welcome back
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-md)' }}>
              Sign in to your dashboard
            </p>
          </div>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-5)' }}>
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ 
                  padding: 'var(--sp-3)', 
                  background: 'rgba(239, 68, 68, 0.1)', 
                  color: 'var(--red-500)', 
                  borderRadius: 'var(--r-md)', 
                  fontSize: 'var(--text-sm)', 
                  fontWeight: 500,
                  border: '1px solid rgba(239, 68, 68, 0.2)'
                }}
              >
                {error}
              </motion.div>
            )}

            <div>
              <label style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-heading)', marginBottom: 'var(--sp-2)' }}>
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <div style={{
                  position: 'absolute',
                  left: 'var(--sp-3)',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)'
                }}>
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  placeholder="you@restaurant.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: '100%',
                    padding: 'var(--sp-3) var(--sp-3) var(--sp-3) var(--sp-10)',
                    borderRadius: 'var(--r-md)',
                    border: '1px solid var(--border-main)',
                    fontSize: 'var(--text-base)',
                    transition: 'all var(--dur-fast) var(--ease-out)',
                    outline: 'none'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'var(--orange-500)';
                    e.target.style.boxShadow = '0 0 0 3px rgba(212, 175, 55, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'var(--border-main)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-heading)', marginBottom: 'var(--sp-2)' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <div style={{
                  position: 'absolute',
                  left: 'var(--sp-3)',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)'
                }}>
                  <Lock size={18} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: 'var(--sp-3) var(--sp-10) var(--sp-3) var(--sp-10)',
                    borderRadius: 'var(--r-md)',
                    border: '1px solid var(--border-main)',
                    fontSize: 'var(--text-base)',
                    transition: 'all var(--dur-fast) var(--ease-out)',
                    outline: 'none'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'var(--orange-500)';
                    e.target.style.boxShadow = '0 0 0 3px rgba(212, 175, 55, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'var(--border-main)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: 'var(--sp-3)',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-muted)',
                    padding: '4px'
                  }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: 'var(--sp-3)',
                background: loading ? 'var(--gray-300)' : 'linear-gradient(135deg, var(--orange-600), var(--orange-500))',
                color: 'white',
                border: 'none',
                borderRadius: 'var(--r-md)',
                fontSize: 'var(--text-base)',
                fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 'var(--sp-2)',
                transition: 'all var(--dur-normal) var(--ease-out)',
                boxShadow: 'var(--shadow-md)'
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  (e.target as HTMLButtonElement).style.transform = 'translateY(-2px)';
                  (e.target as HTMLButtonElement).style.boxShadow = 'var(--shadow-lg)';
                }
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLButtonElement).style.transform = 'translateY(0)';
                (e.target as HTMLButtonElement).style.boxShadow = 'var(--shadow-md)';
              }}
            >
              {loading ? (
                <>
                  <span className="spinner" style={{ width: '20px', height: '20px', borderColor: 'rgba(255,255,255,0.3)', borderTopColor: 'white' }} />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Quick Login */}
          <div style={{ marginTop: 'var(--sp-8)' }}>
            <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-heading)', marginBottom: 'var(--sp-3)' }}>
              Quick Login (Demo Users)
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--sp-2)' }}>
              {QUICK_LOGIN_USERS.map((user) => (
                <button
                  key={user.email}
                  onClick={() => handleQuickLogin(user)}
                  disabled={loading}
                  style={{
                    padding: 'var(--sp-2)',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-main)',
                    borderRadius: 'var(--r-md)',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    transition: 'all var(--dur-fast) var(--ease-out)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: 'var(--text-xs)'
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--orange-500)';
                    (e.currentTarget as HTMLButtonElement).style.background = 'rgba(212, 175, 55, 0.05)';
                    (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-main)';
                    (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-secondary)';
                    (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
                  }}
                >
                  <span style={{ fontSize: '20px' }}>{user.icon}</span>
                  <span style={{ fontWeight: 600, color: 'var(--text-heading)' }}>{user.role}</span>
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

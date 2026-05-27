import { useState } from 'react';
import type { ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, CalendarCheck, Eye, EyeOff, Gift, Lock, Mail, ReceiptText, Sparkles, UtensilsCrossed } from 'lucide-react';

import { useAuthStore } from '../../store/authStore';
import api from '../../services/api';
import type { AuthResponseData } from '../../services/types';

const QUICK_LOGIN_USERS = [
  { email: 'admin@servegenius.com', password: 'admin123', role: 'Admin' },
  { email: 'staff@servegenius.com', password: 'staff123', role: 'Staff' },
  { email: 'customer@servegenius.com', password: 'customer123', role: 'Customer' },
];

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const onLoginSuccess = (data: AuthResponseData) => {
    setAuth(
      { id: data.userId, name: data.name, email: data.email, roles: data.roles },
      data.accessToken,
      data.refreshToken,
    );
    navigate('/app/dashboard');
  };

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/login', { email, password });
      onLoginSuccess(response.data.data);
    } catch (err: unknown) {
      const message = err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
        : undefined;

      setError(message || 'Không thể kết nối máy chủ. Vui lòng kiểm tra backend đang chạy.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (user: typeof QUICK_LOGIN_USERS[number]) => {
    setEmail(user.email);
    setPassword(user.password);
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/login', {
        email: user.email,
        password: user.password,
      });
      onLoginSuccess(response.data.data);
    } catch (err: unknown) {
      const message = err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
        : undefined;

      setError(message || 'Không thể kết nối máy chủ. Vui lòng kiểm tra backend đang chạy.');
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.45 }}
      className="auth-bg"
    >
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <div style={{
          position: 'absolute',
          top: '-10%',
          right: '-5%',
          width: 500,
          height: 500,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(212, 175, 55, 0.1) 0%, transparent 70%)',
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-15%',
          left: '-10%',
          width: 600,
          height: 600,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(13, 148, 136, 0.08) 0%, transparent 70%)',
        }} />
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        maxWidth: 1080,
        width: '92%',
        background: 'white',
        borderRadius: 'var(--r-3xl)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-xl)',
        position: 'relative',
        zIndex: 10,
      }}>
        <motion.div
          initial={{ x: -40, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.55, delay: 0.15 }}
          style={{
            background: 'linear-gradient(160deg, #1f2937 0%, #7c2d12 100%)',
            padding: 'var(--sp-12)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            color: 'white',
          }}
        >
          <div>
            <div style={{
              width: 82,
              height: 82,
              borderRadius: 'var(--r-2xl)',
              background: 'linear-gradient(135deg, var(--orange-600), var(--orange-500))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 'var(--sp-6)',
            }}>
              <UtensilsCrossed size={40} color="white" />
            </div>

            <h1 style={{
              color: 'white',
              fontSize: 'var(--text-4xl)',
              fontWeight: 800,
              marginBottom: 'var(--sp-3)',
              fontFamily: 'var(--font-serif)',
              lineHeight: 1.1,
            }}>
              ServeGenius
            </h1>

            <p style={{ fontSize: 'var(--text-lg)', opacity: 0.84, lineHeight: 1.7, marginBottom: 'var(--sp-7)' }}>
              Đăng nhập để quản lý đặt bàn, theo dõi đơn món và nhận điểm thưởng sau thanh toán thành công.
            </p>
          </div>

          <div style={{ display: 'grid', gap: 14 }}>
            <Feature icon={<CalendarCheck size={18} />} text="Lưu lịch sử đặt bàn và chọn món nhanh hơn cho những lần quay lại." />
            <Feature icon={<ReceiptText size={18} />} text="Theo dõi hóa đơn và trạng thái đơn ngay trong dashboard." />
            <Feature icon={<Gift size={18} />} text="Khách có tài khoản sẽ được cộng điểm sau khi nhân viên xác nhận thanh toán." />
          </div>
        </motion.div>

        <motion.div
          initial={{ x: 40, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.55, delay: 0.2 }}
          style={{ padding: 'var(--sp-10)' }}
        >
          <div style={{ textAlign: 'center', marginBottom: 'var(--sp-8)' }}>
            <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, marginBottom: 'var(--sp-2)', color: 'var(--text-heading)' }}>
              Chào mừng bạn quay lại
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-md)' }}>
              Đăng nhập để tiếp tục với tài khoản của bạn
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
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                }}
              >
                {error}
              </motion.div>
            )}

            <div>
              <label style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-heading)', marginBottom: 'var(--sp-2)' }}>
                Email
              </label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: 'var(--sp-3)', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  placeholder="you@restaurant.com"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  style={{
                    width: '100%',
                    padding: 'var(--sp-3) var(--sp-3) var(--sp-3) var(--sp-10)',
                    borderRadius: 'var(--r-md)',
                    border: '1px solid var(--border-main)',
                    fontSize: 'var(--text-base)',
                    transition: 'all var(--dur-fast) var(--ease-out)',
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-heading)', marginBottom: 'var(--sp-2)' }}>
                Mật khẩu
              </label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: 'var(--sp-3)', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                  <Lock size={18} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Nhập mật khẩu của bạn"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  style={{
                    width: '100%',
                    padding: 'var(--sp-3) var(--sp-10) var(--sp-3) var(--sp-10)',
                    borderRadius: 'var(--r-md)',
                    border: '1px solid var(--border-main)',
                    fontSize: 'var(--text-base)',
                    transition: 'all var(--dur-fast) var(--ease-out)',
                    outline: 'none',
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
                    padding: 4,
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
                boxShadow: 'var(--shadow-md)',
              }}
            >
              {loading ? (
                <>
                  <span className="spinner" style={{ width: 20, height: 20, borderColor: 'rgba(255,255,255,0.3)', borderTopColor: 'white' }} />
                  Đang đăng nhập...
                </>
              ) : (
                <>
                  Đăng nhập
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="auth-switch">
            Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
          </div>

          <div style={{ marginTop: 'var(--sp-8)' }}>
            <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-heading)', marginBottom: 'var(--sp-3)' }}>
              Tài khoản mẫu
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
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 6,
                    fontSize: 'var(--text-xs)',
                  }}
                >
                  <Sparkles size={16} />
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

function Feature({ icon, text }: { icon: ReactNode; text: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', fontSize: 'var(--text-sm)', opacity: 0.88 }}>
      <div style={{
        width: 36,
        height: 36,
        borderRadius: 12,
        background: 'rgba(255,255,255,0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {icon}
      </div>
      <span>{text}</span>
    </div>
  );
}

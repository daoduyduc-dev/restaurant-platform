import { useState } from 'react';
import type { ChangeEvent, FormEvent, ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, CalendarCheck, Gift, Lock, Mail, Phone, User, UtensilsCrossed } from 'lucide-react';

import api from '../../services/api';
import type { AuthResponseData } from '../../services/types';
import { useAuthStore } from '../../store/authStore';

export const RegisterPage = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const update = (field: keyof typeof form) => (event: ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleRegister = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/register', form);
      const data: AuthResponseData = response.data.data;

      setAuth(
        { id: data.userId, name: data.name, email: data.email, roles: data.roles },
        data.accessToken,
        data.refreshToken,
      );

      navigate('/app/dashboard');
    } catch (err: unknown) {
      const message = err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
        : undefined;

      setError(message || 'Không thể đăng ký tài khoản lúc này.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      width: 'min(1080px, 92vw)',
      background: 'white',
      borderRadius: 'var(--r-3xl)',
      overflow: 'hidden',
      display: 'grid',
      gridTemplateColumns: '1fr 1.1fr',
      boxShadow: 'var(--shadow-xl)',
      position: 'relative',
      zIndex: 2,
    }}>
      <div style={{
        background: 'linear-gradient(160deg, #78350f 0%, #1f2937 100%)',
        color: 'white',
        padding: 'var(--sp-12)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}>
        <div>
          <div style={{
            width: 72,
            height: 72,
            borderRadius: 'var(--r-2xl)',
            background: 'rgba(255,255,255,0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 'var(--sp-6)',
          }}>
            <UtensilsCrossed size={34} />
          </div>
          <h1 style={{ color: 'white', marginBottom: 14 }}>Tạo tài khoản khách hàng</h1>
          <p style={{ opacity: 0.86, lineHeight: 1.7 }}>
            Bạn vẫn có thể đặt bàn mà không đăng nhập, nhưng tài khoản sẽ giúp lưu lịch sử, nhận điểm thưởng và quản lý hóa đơn dễ hơn.
          </p>
        </div>

        <div style={{ display: 'grid', gap: 14 }}>
          <Benefit icon={<CalendarCheck size={18} />} text="Đặt bàn nhanh hơn cho những lần quay lại." />
          <Benefit icon={<Gift size={18} />} text="Tích điểm sau khi thanh toán thành công để đổi ưu đãi." />
          <Benefit icon={<Mail size={18} />} text="Theo dõi thông tin đặt bàn và đơn món trong cùng một nơi." />
        </div>
      </div>

      <div style={{ padding: 'var(--sp-10)' }}>
        <div style={{ marginBottom: 'var(--sp-7)' }}>
          <h2 style={{ marginBottom: 8 }}>Đăng ký tài khoản mới</h2>
          <p style={{ color: 'var(--text-muted)' }}>
            Tài khoản mới sẽ được tạo với vai trò khách hàng để đặt bàn, chọn món và tích điểm.
          </p>
        </div>

        <form onSubmit={handleRegister} className="auth-form">
          {error && <div className="auth-error">{error}</div>}
          <Field icon={<User size={18} />} label="Họ và tên" value={form.name} onChange={update('name')} placeholder="Nguyễn Văn A" />
          <Field icon={<Mail size={18} />} label="Email" type="email" value={form.email} onChange={update('email')} placeholder="you@example.com" />
          <Field icon={<Phone size={18} />} label="Số điện thoại" value={form.phone} onChange={update('phone')} placeholder="0901234567" />
          <Field icon={<Lock size={18} />} label="Mật khẩu" type="password" value={form.password} onChange={update('password')} placeholder="Tối thiểu 6 ký tự" />
          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? 'Đang tạo tài khoản...' : 'Đăng ký và vào dashboard'} <ArrowRight size={18} />
          </button>
        </form>

        <div className="auth-switch">
          Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
        </div>
      </div>
    </div>
  );
};

function Field({
  icon,
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
}: {
  icon: ReactNode;
  label: string;
  type?: string;
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
}) {
  return (
    <label className="auth-field">
      <span>{label}</span>
      <div>
        {icon}
        <input type={type} required value={value} onChange={onChange} placeholder={placeholder} />
      </div>
    </label>
  );
}

function Benefit({ icon, text }: { icon: ReactNode; text: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, opacity: 0.92 }}>
      <div style={{
        width: 36,
        height: 36,
        borderRadius: 12,
        background: 'rgba(255,255,255,0.12)',
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
